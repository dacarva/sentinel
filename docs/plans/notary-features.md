# Notary Features & Self-Hosted Attestation

## Overview

Sentinel's notary service provides cryptographic binding between zkTLS attestations and their originating TLS sessions. This document covers the rationale, architecture, and operational aspects of running a self-hosted notary.

## Why Self-Hosted Notary?

### Auditability
- **Proof of Authorization**: Each attestation includes `proof_origin` — a cryptographic commitment to the exact TLS handshake and transcript
- **Session Traceability**: Attestation claims can be linked to their originating TLS session by anyone with access to the notary's webhook logs
- **Verifier Independence**: Third-party auditors can verify the notary's public key and inspect timestamped webhook records

### Security Properties
1. **Shared Secret HMAC** (`X-TLSN-Signature`): Verifies webhook authenticity and provides timestamp replay protection
2. **Public Key Endpoint** (`GET /notary/pubkey`): Allows offline verification of attestations without trusting the issuer
3. **Transcript Hash Binding**: Attestation signature covers the full transcript descriptor, preventing server from claiming different data than was received

## Architecture

### ProofOrigin Interface

```typescript
interface ProofOrigin {
  server_name: string;      // e.g. "sentinel-d75o.onrender.com"
  session_id: string;       // TLSNotary session.id from webhook
  transcript_hash: string;  // SHA-256 of canonical descriptor
}
```

Included in attestation when `REQUIRE_WEBHOOK=true`:

```typescript
interface Attestation {
  id: string;
  user_address: string;
  timestamp: string;
  notary: { signature: string; public_key: string };
  disclosed_data: DisclosedData;
  proof_origin?: ProofOrigin;  // ← Bound to notary signature
  status: "pending" | "verified" | "failed";
}
```

### HMAC Webhook Protocol

The TLSNotary verifier POSTs to `/webhook/tlsn` with HMAC authentication:

```http
POST /webhook/tlsn HTTP/1.1
X-TLSN-Signature: c47e5767...  (SHA256 HMAC hex)
X-TLSN-Timestamp: 1708881960   (Unix seconds)
Content-Type: application/json

{
  "server_name": "bank.example.com",
  "session": { "id": "tlsn-sess-xyz" },
  "transcript": { "sent": [...], "recv": [...], ... },
  "results": [...]
}
```

**Signature Calculation** (TLSNotary verifier):
```
signature = HMAC-SHA256(secret, "${timestamp}.${raw_body_json}")
```

**Verification** (Sentinel backend):
1. Extract `X-TLSN-Signature` and `X-TLSN-Timestamp` headers
2. Recompute expected HMAC using raw body and timestamp
3. Constant-time compare using `timingSafeEqual`
4. Check timestamp is within ±5 minutes (replay protection)

### Public Key Endpoint

```http
GET /notary/pubkey HTTP/1.1
```

Response:
```json
{
  "public_key": "02abc123...",
  "algorithm": "secp256k1",
  "encoding": "compressed-hex"
}
```

Allows third-party verifiers to:
- Fetch the notary's signing key independent of attestation claims
- Verify signature of any attestation offline
- Detect if issuer tries to present different keys to different auditors

## Deployment Configuration

### Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `NOTARY_PRIV_KEY` | `a1b2c3...` (64-char hex) | secp256k1 private key for signing (KEEP SECRET) |
| `NOTARY_PUB_KEY` | `02abc123...` | Public key (optional; derived from private if unset) |
| `TLSN_WEBHOOK_SECRET` | `dev-local-secret` | Shared secret with verifier for HMAC |
| `REQUIRE_WEBHOOK` | `true` | Require webhook for JS presentations (default: true) |

### Webhook Sender Setup (TLSNotary Verifier)

In the TLSNotary verifier's config:

```yaml
notary:
  webhook:
    url: "https://your-sentinel-backend/webhook/tlsn"
    hmac_secret: "dev-local-secret"  # Match TLSN_WEBHOOK_SECRET
    use_hmac: true                    # Enable HMAC auth
```

The verifier will then POST with `X-TLSN-Signature` and `X-TLSN-Timestamp`.

## Third-Party Audit Workflow

### Step 1: Fetch Notary Public Key
```bash
curl https://your-sentinel-backend/notary/pubkey
# → { "public_key": "02abc123...", ... }
```

### Step 2: Retrieve Attestation
```bash
curl https://your-sentinel-backend/attest/some-attestation-id
# → { "id": "...", "proof_origin": {...}, "notary": {...}, ... }
```

### Step 3: Verify Signature
Using the public key from step 1 and attestation from step 2:
- Reconstruct payload: `{ id, user_address, timestamp, disclosed_data, proof_origin }`
- Hash payload: `SHA256(JSON.stringify(payload))`
- Verify ECDSA signature against secp256k1 public key

### Step 4: Cross-Check Webhook Log
- Request webhook log from notary operator (out-of-band)
- Verify `session.id` from attestation matches webhook entry
- Verify `transcript_hash` matches computed hash in webhook
- Confirm webhook timestamp is reasonable (e.g., before attestation timestamp)

## Verification Checklist

### For Each Attestation
- [ ] Fetch `/notary/pubkey` and cache result
- [ ] Load attestation JSON (GET `/attest/:id`)
- [ ] Reconstruct canonical payload with `proof_origin` included
- [ ] Hash and verify ECDSA signature
- [ ] Check that `proof_origin.server_name` matches expected server
- [ ] Confirm `proof_origin.session_id` exists in notary's webhook logs
- [ ] Validate `proof_origin.transcript_hash` against transcript data in webhook

### Operational
- [ ] Private key (`NOTARY_PRIV_KEY`) stored securely (vault, KMS, etc.)
- [ ] Webhook logs retained for audit trail (e.g., 90 days minimum)
- [ ] Notary backend runs on HTTPS with valid certificate
- [ ] HMAC secret rotated periodically
- [ ] Public key endpoint monitored for unexpected key changes

## Backward Compatibility

Attestations created without a webhook (when `REQUIRE_WEBHOOK=false`) will have no `proof_origin` field. The signature verification still works because `buildPayload` conditionally includes `proof_origin` only if present:

```typescript
if (att.proof_origin !== undefined) {
  base.proof_origin = att.proof_origin;
}
```

This allows gradual rollout: old attestations verify, new ones gain additional auditability.
