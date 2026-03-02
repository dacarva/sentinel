# Production Deployment Guide

## Attestation Storage

### Current Implementation (Development)
- **Storage**: Filesystem (`data/attestations/`)
- **Use Case**: Local development and testing only
- **Status**: ❌ NOT production-ready

### Production Storage Options

#### Option 1: PostgreSQL + Audit Log (Recommended)

**Schema**:
```sql
CREATE TABLE attestations (
  id UUID PRIMARY KEY,
  user_address VARCHAR(42) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  notary_signature VARCHAR(128) NOT NULL,
  notary_public_key VARCHAR(130) NOT NULL,
  disclosed_data JSONB NOT NULL,
  proof_origin JSONB,  -- nullable for backward compatibility
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhook_log (
  id BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  server_name VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  signature VARCHAR(128) NOT NULL,
  payload JSONB NOT NULL,
  verification_status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attestations_user ON attestations(user_address);
CREATE INDEX idx_attestations_timestamp ON attestations(timestamp);
CREATE INDEX idx_webhook_session ON webhook_log(session_id);
```

**Implementation**:
```typescript
// backend/src/attestation/storage-db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function saveAttestation(att: Attestation): Promise<void> {
  await pool.query(
    `INSERT INTO attestations
     (id, user_address, timestamp, notary_signature, notary_public_key,
      disclosed_data, proof_origin, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      att.id,
      att.user_address,
      att.timestamp,
      att.notary.signature,
      att.notary.public_key,
      JSON.stringify(att.disclosed_data),
      att.proof_origin ? JSON.stringify(att.proof_origin) : null,
      att.status,
    ]
  );
}

export async function loadAttestation(id: string): Promise<Attestation | null> {
  const result = await pool.query(
    'SELECT * FROM attestations WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    user_address: row.user_address,
    timestamp: row.timestamp,
    notary: {
      signature: row.notary_signature,
      public_key: row.notary_public_key,
    },
    disclosed_data: row.disclosed_data,
    proof_origin: row.proof_origin,
    status: row.status,
  };
}

export async function storeWebhookLog(
  webhook: TlsnWebhookPayload,
  signature: string,
  verified: boolean
): Promise<void> {
  await pool.query(
    `INSERT INTO webhook_log (session_id, server_name, timestamp,
     signature, payload, verification_status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      webhook.session.id,
      webhook.server_name,
      new Date(),
      signature,
      JSON.stringify(webhook),
      verified ? 'verified' : 'failed',
    ]
  );
}
```

**Advantages**:
- ✅ Persistent across restarts
- ✅ Audit trail via webhook_log
- ✅ Query capabilities (by user, date, status)
- ✅ Standard backups & replication
- ✅ ACID compliance

**Disadvantages**:
- Requires database infrastructure
- Need to manage credentials

---

#### Option 2: MongoDB (Document Store)

If you prefer a document database:

```typescript
// backend/src/attestation/storage-mongo.ts
import { MongoClient, Db } from 'mongodb';

let db: Db;

export async function connect(): Promise<void> {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  db = client.db('sentinel');
}

export async function saveAttestation(att: Attestation): Promise<void> {
  await db.collection('attestations').insertOne({
    _id: att.id,
    ...att,
    createdAt: new Date(),
  });
}

export async function loadAttestation(id: string): Promise<Attestation | null> {
  return await db.collection('attestations').findOne({ _id: id });
}
```

**Advantages**:
- ✅ Flexible schema
- ✅ Built-in replication
- ✅ Good performance for document storage

**Disadvantages**:
- Less structured audit trail
- Higher memory footprint

---

#### Option 3: Immutable Append-Only Log

For maximum auditability and compliance:

```typescript
// backend/src/attestation/storage-log.ts
// Store in append-only log with merkle tree verification

interface LogEntry {
  index: number;
  timestamp: string;
  attestation: Attestation;
  previousHash: string;
  currentHash: string;
}

export async function appendAttestation(att: Attestation): Promise<void> {
  const previousEntry = await getLastLogEntry();
  const entry: LogEntry = {
    index: (previousEntry?.index ?? 0) + 1,
    timestamp: new Date().toISOString(),
    attestation: att,
    previousHash: previousEntry?.currentHash ?? '0'.repeat(64),
    currentHash: computeHash(att, previousEntry?.currentHash),
  };

  // Store in database or S3
  await storeLogEntry(entry);
}

function computeHash(att: Attestation, previousHash: string): string {
  const entry = JSON.stringify({ att, previousHash });
  return createHash('sha256').update(entry).digest('hex');
}
```

**Advantages**:
- ✅ Cryptographically verifiable
- ✅ Tamper-proof
- ✅ Compliance/audit-friendly
- ✅ Can be published publicly for transparency

**Disadvantages**:
- More complex to implement
- Harder to update/delete records

---

## Environment-Specific Configuration

### Development
```bash
# Use filesystem storage (current)
STORAGE_TYPE=filesystem
DATA_DIR=./data
```

### Staging
```bash
# PostgreSQL with audit logging
STORAGE_TYPE=postgresql
DATABASE_URL=postgresql://user:pass@localhost/sentinel
WEBHOOK_LOG_RETENTION_DAYS=90
```

### Production
```bash
# PostgreSQL + audit log + optional archive
STORAGE_TYPE=postgresql
DATABASE_URL=postgresql://prod-user:${DB_PASS}@prod-db.internal/sentinel
WEBHOOK_LOG_RETENTION_DAYS=365
ARCHIVE_TYPE=s3
ARCHIVE_S3_BUCKET=sentinel-attestations-archive
ARCHIVE_S3_REGION=us-east-1
```

---

## Migration Path

1. **Phase 1** (Now): Keep filesystem for dev/test
2. **Phase 2**: Add PostgreSQL support (keep filesystem as option)
3. **Phase 3**: Migrate staging to PostgreSQL
4. **Phase 4**: Deploy to production with PostgreSQL
5. **Phase 5** (Optional): Add immutable log + S3 archival

---

## Data Retention & Compliance

### Webhook Logs
- **Retention**: 1 year (or per regulatory requirement)
- **Purpose**: Prove attested data existed at specific time
- **Access**: Read-only for auditors

### Attestations
- **Retention**: Indefinite (or per user request for GDPR)
- **Purpose**: Verify proofs for downstream users
- **Access**: User + verifiers with proof

### Audit Trail
- **Retention**: 7 years (typical financial compliance)
- **Purpose**: Regulatory compliance
- **Access**: Internal security team + regulators

---

## Backup & Disaster Recovery

### PostgreSQL Backup Strategy
```bash
# Daily backups to S3
pg_dump sentinel | gzip | aws s3 cp - s3://sentinel-backups/$(date +%Y-%m-%d).sql.gz

# Point-in-time recovery (PITR)
# - Enable WAL archiving to S3
# - Retain backups for 30 days
```

### RTO/RPO Targets
| Metric | Target |
|--------|--------|
| RTO (Recovery Time Objective) | < 1 hour |
| RPO (Recovery Point Objective) | < 5 minutes |

---

## Conclusion

**For production Sentinel deployment, strongly recommend:**
1. **Database**: PostgreSQL with webhook audit log
2. **Backup**: Daily automated backups to S3
3. **Monitoring**: Alert on storage failures, backup failures
4. **Compliance**: Retain logs per regulatory requirements
5. **Future**: Consider immutable log + archival for high-security deployments

Update `.gitignore` to exclude local development data but commit database initialization scripts:
```
data/attestations/    # LOCAL DEV ONLY
!database/schema.sql  # COMMIT SCHEMA
!database/migrations/ # COMMIT MIGRATIONS
```
