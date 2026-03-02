# Sentinel — zkTLS Attestation Engine

[![Tests](https://img.shields.io/badge/tests-31%20passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

Sentinel is a cryptographic attestation system that enables users to prove their financial data (bank balance, transaction history) to third parties without exposing credentials. It combines **MPC-TLS** (via [TLSNotary](https://tlsnotary.org)) with **secp256k1 signatures** and **webhook-based proofs** to create verifiable, auditable attestations.

## Key Features

### 🔐 Cryptographic Proofs of Banking Data
- Prove bank balance to a third party without exposing credentials or the exact figure
- Uses MPC-TLS to witness encrypted TLS sessions between browser and bank
- **Selective disclosure (current)**: TLSNotary path-level REVEAL handlers extract specific JSON fields (`balances.available`, `currency`, `number`, `name`) and commit them to the MPC-TLS transcript — balance comes from the verifier, not the client
- **ZK circuits (next)**: replace the revealed balance value with a ZK proof of `balance > threshold`, so even the backend never learns the exact figure — see [SELECTIVE_DISCLOSURE.md](docs/SELECTIVE_DISCLOSURE.md)

### 🌍 Production-Ready Auditability
- **Proof Origin Binding**: Attestations cryptographically bind to their originating TLS session
- **HMAC Webhook Authentication**: Secure webhook verification with replay protection (±5 minute window)
- **Public Key Discovery**: GET `/notary/pubkey` endpoint for third-party verification
- **Attestation Signing**: secp256k1 ECDSA signatures over canonical attestation payload

### 🏗️ Modular Architecture
- **Mock Bank**: HTTPS server simulating bank login + account endpoints
- **Sentinel Backend**: REST API for receiving proofs, verifying signatures, checking balances
- **Web App**: Frontend for wallet connection and proof submission
- **TLSNotary Integration**: Connects local verifier, browser extension, and backend via webhooks
- **Storage**: Filesystem (dev) → PostgreSQL (production) with audit logging

---

## Quick Start

### Prerequisites
- **Bun** (v1.3.4+) for package management and testing
- **Rust** (optional, for building TLSNotary verifier locally)
- **Chrome** (for TLSNotary browser extension)

### Installation
```bash
git clone https://github.com/yourusername/sentinel.git
cd sentinel
bun install
```

### Local Development

**Terminal 1: Mock Bank** (HTTPS on 3443)
```bash
bun run bank:start
```

**Terminal 2: Sentinel Backend** (HTTP on 3000)
```bash
bun run sentinel:start
```

**Terminal 3: Web App** (dev server, e.g. 5173)
```bash
bun run app:dev
```

Visit `http://localhost:5173` to use the app. For full E2E with TLSNotary:

1. Install [TLSNotary extension](https://chromewebstore.google.com/detail/gcfkkledipjgbkdbimfpijgbkhajiaaph)
2. Build and run the local TLSNotary verifier
3. Configure extension Options: Notary API = `http://localhost:7047`, Proxy API = `ws://localhost:7047/proxy`

See [ZKTLS_WEBHOOK_SETUP.md](docs/ZKTLS_WEBHOOK_SETUP.md) for detailed setup.

---

## Architecture

### Data Flow
```
User Wallet
    ↓
Web App (localhost:5173)
    ↓
TLSNotary Extension + Plugin
    ↓
MPC-TLS with Mock Bank (https://sentinel-d75o.onrender.com)
    ↓
Local TLSNotary Verifier (localhost:7047)
    ↓
Webhook POST to Sentinel Backend (localhost:3000)
    ↓
Attestation Storage + Verification
    ↓
Signed Attestation returned to App
```

### Monorepo Workspaces
| Workspace | Purpose | Port |
|-----------|---------|------|
| `mock-bank/` | HTTPS server with auth & account endpoints | 3443 |
| `backend/` | Attestation REST API + verification logic | 3000 |
| `app/` | Frontend for wallet + proof flow | 5173 |
| `plugin-bancolombia/` | Live Bancolombia prover (selective disclosure via path REVEAL) | N/A |
| `plugin/` | Sample TLSNotary plugin (mock bank) | N/A |
| `plugin-sdk/` | SDK for building TLSNotary plugins | N/A |
| `tlsn-common/` | Shared TLSNotary utilities | N/A |

---

## Attestation Format

### Example Attestation (with Proof Origin)
```json
{
  "id": "att-12345",
  "user_address": "0x1111111111111111111111111111111111111111",
  "timestamp": "2026-02-25T10:30:00.000Z",
  "notary": {
    "public_key": "02abc123...",
    "signature": "c47e5767..."
  },
  "disclosed_data": {
    "balance": 25000,
    "currency": "USD",
    "account_id_hash": "h...",
    "transactions_summary": { "months": [...] }
  },
  "proof_origin": {
    "server_name": "sentinel-d75o.onrender.com",
    "session_id": "tlsn-sess-xyz",
    "transcript_hash": "a1b2c3d4..."
  },
  "status": "verified"
}
```

**Key Fields:**
- `notary.signature`: ECDSA secp256k1 signature covering id + user_address + timestamp + disclosed_data + proof_origin
- `proof_origin`: Cryptographic binding to the originating TLS session (when webhook enabled)
- `disclosed_data`: Redacted bank data (balance, not credentials)

---

## API Endpoints

### Attestation API
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/attest` | POST | None | Create attestation from TLSNotary proof |
| `/attest/:id` | GET | None | Retrieve stored attestation |
| `/verify/:id` | POST | None | Verify attestation signature & data |
| `/notary/pubkey` | GET | None | Get notary's secp256k1 public key |
| `/webhook/tlsn` | POST | HMAC/Secret | Receive webhook from TLSNotary verifier |

### Mock Bank API
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/login` | POST | None | Authenticate user, return JWT |
| `/account/balance` | GET | JWT | Get balance + account metadata |
| `/account/transactions` | GET | JWT | Get transaction history |

---

## Security Features

### Webhook Authentication
Two methods supported:

**HMAC (Production)**
```
POST /webhook/tlsn
X-TLSN-Signature: c47e5767...  (HMAC-SHA256)
X-TLSN-Timestamp: 1708881960   (Unix seconds)
Content-Type: application/json

{...webhook payload...}
```
- Timestamp validated within ±5 minutes (replay protection)
- Signature computed over `timestamp.body` using shared secret
- Constant-time comparison to prevent timing attacks

**Legacy (Development)**
```
X-TLSN-Secret: dev-local-secret
```

### Signature Verification
- secp256k1 ECDSA signatures (same curve as Bitcoin/Ethereum)
- Payload is canonical JSON: `{id, user_address, timestamp, disclosed_data, proof_origin}`
- Public key available at `/notary/pubkey` for third-party verification

### Data Privacy
- Authorization headers (JWT tokens) never leave the MPC-TLS session
- Only disclosed data (balance, transaction count) is revealed
- Account ID is hashed before attestation

---

## Testing

### Run All Tests
```bash
bun test
```

### Backend Tests Only
```bash
REQUIRE_WEBHOOK=false bun test backend/src
```

### Manual Testing
See [MANUAL_TESTING.md](docs/MANUAL_TESTING.md) for comprehensive manual test cases:
- Webhook authentication (legacy & HMAC)
- Attestation creation and verification
- Balance/consistency checks
- E2E flow with extension

---

## Configuration

### Environment Variables

**Backend (Sentinel)**
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Backend server port |
| `DATA_DIR` | `data` | Directory for storing attestations |
| `NOTARY_PRIV_KEY` | (dev key) | secp256k1 private key (KEEP SECRET) |
| `NOTARY_PUB_KEY` | (derived) | Public key (auto-derived if unset) |
| `TLSN_WEBHOOK_SECRET` | `dev-local-secret` | Shared secret for HMAC/legacy webhook auth |
| `REQUIRE_WEBHOOK` | `true` | Require webhook for JS presentations |
| `BALANCE_THRESHOLD` | `1000` | Minimum balance for verification |
| `MIN_TX_PER_MONTH` | `3` | Min transactions per month |
| `CONSISTENCY_MONTHS` | `3` | Months to check for consistency |

**Mock Bank**
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3443` | HTTPS server port |
| `BANK_BASE_URL` | `https://localhost:3443` | Bank base URL for local testing |

**Web App**
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_SENTINEL_API` | `http://localhost:3000` | Backend API URL |
| `VITE_TLSN_PLUGIN_URL` | `/ts-plugin-sample.js` | Plugin JS URL (mock bank) |
| `VITE_TLSN_PLUGIN_BANCOLOMBIA_URL` | `/ts-plugin-bancolombia.js` | Plugin JS URL (Bancolombia) |

---

## Documentation

- **[SELECTIVE_DISCLOSURE.md](docs/SELECTIVE_DISCLOSURE.md)** — Completed v2: path-level REVEAL handlers, proof format details, and bridge to v3
- **[ZK_CIRCUITS.md](docs/ZK_CIRCUITS.md)** — v3 roadmap: ZK circuits to prove `balance > threshold` without revealing the balance; proof system options and integration sketch
- **[ZKTLS_WEBHOOK_SETUP.md](docs/ZKTLS_WEBHOOK_SETUP.md)** — Webhook architecture, Bancolombia E2E flow, and verifier setup
- **[MANUAL_TESTING.md](docs/MANUAL_TESTING.md)** — Manual test cases and troubleshooting
- **[PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)** — Production deployment with PostgreSQL, backups, and compliance
- **[plans/notary-features.md](docs/plans/notary-features.md)** — Notary architecture & audit workflow
- **[plan/zktls/IMPLEMENTATION.md](docs/plan/zktls/IMPLEMENTATION.md)** — Low-level implementation details

---

## Production Deployment

### Storage Architecture

**Development**: Filesystem-based (`data/attestations/`)

**Production**: Requires persistent storage with audit logging:
- **Primary**: PostgreSQL with webhook audit table
- **Backup**: Daily automated backups to S3
- **Retention**: 1-year webhook logs, 7-year audit trail
- **Optional**: Immutable append-only log for enhanced auditability

⚠️ **Important**: The current filesystem storage is for development only. See [PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) for complete production setup including:
- PostgreSQL schema and migrations
- Backup & disaster recovery strategy
- Compliance and data retention policies
- Audit logging for webhook verification

### Deployment Checklist
- [ ] Setup PostgreSQL with provided schema
- [ ] Configure backups (daily to S3)
- [ ] Set environment variables for production
- [ ] Deploy with HTTPS and valid certificates
- [ ] Enable webhook signature verification (HMAC)
- [ ] Setup monitoring and alerting
- [ ] Document RTO/RPO targets
- [ ] Configure log retention per compliance requirements

---

## Project Status

### ✅ v2 — Current Release (Selective Disclosure)
- Full MPC-TLS integration with TLSNotary against live Bancolombia sessions
- **Cryptographic selective disclosure**: path-level REVEAL handlers extract `balances.available`, `currency`, `number`, and `name` — balance is committed to the MPC-TLS transcript by the verifier, not asserted by the client
- Webhook-based proof delivery with HMAC authentication and replay protection (±5 min window)
- secp256k1 ECDSA attestation signing with public-key discovery endpoint
- Proof origin binding: attestation cryptographically linked to the originating TLS session transcript
- Balance and transaction consistency checks
- 31 passing tests
- UI claim banner derived from cryptographically-proven fields: **CARVAJAL (2030\*\*\*\*\*\*\*) has more than 1,000,000 COP**

### 🔜 v3 — Next: ZK Circuits

> **The remaining trust gap**: the verifier discloses the exact balance to the backend. A true zero-knowledge system should prove `balance > threshold` without revealing the figure at all.

The plan is to wrap the MPC-TLS transcript commitment in a ZK circuit so the backend receives only a succinct proof that the committed balance satisfies the predicate — not the balance itself. Candidate proving systems: **circom/snarkjs** (compact, EVM-verifiable), **Halo2** (no trusted setup, PSE-native), or **RISC Zero** (general-purpose zkVM).

See **[SELECTIVE_DISCLOSURE.md](docs/SELECTIVE_DISCLOSURE.md)** for the detailed transition plan.

### 🚧 Backlog
- Support for additional bank endpoints (credit score, employment verification)
- Batch attestation verification
- Attestation revocation lists
- Integration with PSE's notary server for third-party proofs
- Mobile app support

---

## Development Commands

From repo root:

| Command | Purpose |
|---------|---------|
| `bun run bank:start` | Start Mock Bank (HTTPS 3443) |
| `bun run sentinel:start` | Start Backend (HTTP 3000) |
| `bun run app:dev` | Start App dev server (≈5173) |
| `bun run plugin:build` | Build plugin and copy to app |
| `bun test` | Run all tests |
| `bun test --watch` | Run tests in watch mode |
| `bun run --filter backend verify -- <id>` | Verify attestation by ID |

---

## Contributing

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes and run tests: `bun test`
3. Commit with descriptive messages
4. Push and create a pull request

### Code Style
- TypeScript strict mode enabled
- ESM modules only
- No implicit `any`
- Format with Prettier (configured in workspace)

---

## License

MIT

---

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation in `/docs`
- Review [MANUAL_TESTING.md](docs/MANUAL_TESTING.md) for troubleshooting

---

## Acknowledgments

- [TLSNotary](https://tlsnotary.org) — MPC-TLS protocol and browser extension
- [Privacy and Scaling Explorations (PSE)](https://pse.dev) — Cryptographic research
- [Bun](https://bun.sh) — Fast JavaScript runtime
