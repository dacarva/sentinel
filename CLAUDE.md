# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sentinel** is a zero-knowledge attestation engine for proving financial data (bank balances, transaction history) without exposing credentials. It combines:
- **MPC-TLS** via [TLSNotary](https://tlsnotary.org) for witnessing encrypted bank sessions
- **secp256k1 ECDSA signatures** for attestation verification
- **Webhook-based proofs** to prevent client-side forgery

The system enables users to prove their banking data to third parties with cryptographic guarantees.

## Monorepo Structure

This is a Bun workspaces monorepo with the following packages:

| Workspace | Purpose | Key Files |
|-----------|---------|-----------|
| `backend/` | REST API for attestation creation & verification | `src/server.ts`, `src/attestation/`, `src/verifier/` |
| `app/` | React frontend for wallet connection & proof flow | `src/` (React + Vite) |
| `mock-bank/` | HTTPS server simulating bank (login + accounts) | `server.ts` |
| `plugin/` | TLSNotary plugin for selective disclosure (base) | `src/` |
| `plugin-bancolombia/` | Bank-specific plugin (Bancolombia) | `src/` |
| `plugin-sdk/` | SDK for building TLSNotary plugins | `src/` |
| `tlsn-common/` | Shared TLSNotary utilities | `src/` |

## Development Commands

**Root level (monorepo)**:
```bash
bun install                    # Install all dependencies
bun test                       # Run all tests across workspaces
bun test --watch              # Watch mode
```

**Backend (Attestation API)**:
```bash
bun run sentinel:start                          # Start on port 3000
bun run sentinel:start:inspect                  # Debug mode (localhost:6499)
bun run sentinel:start:inspect:brk              # Debug with breakpoint
bun run --filter backend test                  # Backend tests only
bun run --filter backend verify -- <id>        # CLI: verify attestation by ID
```

**Mock Bank**:
```bash
bun run bank:start             # Start HTTPS server on port 3443
```

**Web App**:
```bash
bun run app:dev                # Dev server (≈5173)
bun run app:build              # Production build
bun run app:lint               # Run ESLint
```

**Plugins**:
```bash
bun run plugin:build           # Build sample plugin and copy to app/public/
bun run --filter @tlsn/ts-plugin-sample build
bun run --filter plugin-bancolombia build
```

## Data Flow Architecture

```
User Wallet (metamask, etc.)
    ↓
Web App (localhost:5173)
    ↓
TLSNotary Browser Extension
    ↓
MPC-TLS Session with Mock Bank (https://localhost:3443)
    ↓
Local TLSNotary Verifier (localhost:7047)
    ↓
HTTP Webhook POST → Backend API (localhost:3000)
    ↓
Attestation Storage + Verification
    ↓
Signed Attestation returned to App
```

## Backend Architecture

**Core modules** in `backend/src/`:

1. **`server.ts`** — Express REST API with CORS and webhook auth
   - Endpoints: POST `/attest`, GET `/attest/:id`, POST `/verify/:id`, GET `/notary/pubkey`, POST `/webhook/tlsn`
   - Handles both JS presentation (from plugin) and binary presentation formats
   - Validates HMAC signatures on webhooks (±5 min replay protection)

2. **`attestation/`** — Proof ingestion & storage
   - `ingest.ts` — Verify TLSNotary binary proofs, extract disclosed data
   - `ingestFromJsPresentation.ts` — Handle JS plugin results
   - `storage.ts` — Filesystem storage (dev) or PostgreSQL (prod)
   - `webhook-store.ts` — Match JS presentations with webhook payloads
   - `webhook-hmac.ts` — HMAC-SHA256 signature validation

3. **`verifier/`** — Attestation verification logic
   - `balance.ts` — Check minimum balance threshold
   - `consistency.ts` — Verify transaction patterns across months
   - `signature.ts` — secp256k1 ECDSA verification
   - `index.ts` — Orchestrates all checks

4. **`types.ts`** — Shared TypeScript interfaces
5. **`config.ts`** — Environment variable loading with defaults
6. **`cli-verify.ts`** — CLI tool for offline attestation verification

**Key data structures**:
- `Attestation` — Contains id, user_address, timestamp, notary signature, disclosed_data, proof_origin, status
- `DisclosedData` — Balance, currency, account_id_hash, transactions_summary
- `ProofOrigin` — Cryptographic binding: server_name, session_id, transcript_hash
- `TlsnWebhookPayload` — From verifier: results (SENT/RECV), session, transcript

## Configuration

**Backend** environment variables (see `backend/src/config.ts`):
- `PORT` (3000) — Server port
- `DATA_DIR` (data) — Filesystem storage directory
- `NOTARY_PRIV_KEY` — secp256k1 private key (keep secret!)
- `NOTARY_PUB_KEY` — Derived from private key if unset
- `TLSN_WEBHOOK_SECRET` (dev-local-secret) — Shared secret for webhook auth
- `REQUIRE_WEBHOOK` (true) — Enforce webhook for JS presentations
- `BALANCE_THRESHOLD` (1000) — Minimum balance for verification
- `MIN_TX_PER_MONTH` (3) — Min transactions per month
- `CONSISTENCY_MONTHS` (3) — Months to check for consistency

**Mock Bank**:
- `PORT` (3443) — HTTPS port
- `BANK_BASE_URL` (https://localhost:3443) — For local testing

**App**:
- `VITE_SENTINEL_API` (http://localhost:3000) — Backend URL
- `VITE_TLSN_PLUGIN_URL` (/ts-plugin-sample.js) — Plugin JS URL

## Testing

**Unit & Integration Tests**:
- `bun test` — Run all tests (31+ tests)
- `bun test --watch` — Watch mode
- Tests located in `**/__tests__/*.test.ts` files

**Test environment**:
- `REQUIRE_WEBHOOK=false bun test backend/src` — Skip webhook requirement in tests
- Bun's native test runner (Jest-like syntax)

**Manual testing**:
- See `docs/MANUAL_TESTING.md` for E2E test cases
- Includes webhook auth scenarios, signature verification, balance checks

## Key Concepts

### Attestation Lifecycle

1. **Proof Generation** — User runs TLSNotary MPC-TLS session with bank
2. **Webhook Submission** — Verifier POSTs proof results to backend
3. **Ingestion** — Backend extracts disclosed data, binds to proof origin
4. **Verification** — Balance + consistency checks, signature validation
5. **Storage** — Attestation persisted with signed proof

### Webhook Authentication (Production)

Two methods:

**HMAC (Production)**:
```
POST /webhook/tlsn
X-TLSN-Signature: c47e5767...  (HMAC-SHA256 of "timestamp.body")
X-TLSN-Timestamp: 1708881960   (Unix seconds, ±5 min window)
```

**Legacy (Development)**:
```
X-TLSN-Secret: dev-local-secret
```

### Signature Verification

- Curve: **secp256k1** (Bitcoin/Ethereum compatible)
- Payload: Canonical JSON of `{id, user_address, timestamp, disclosed_data, proof_origin}`
- Public key available at `GET /notary/pubkey`

### Storage

- **Development** — Filesystem: `data/attestations/{id}.json`
- **Production** — PostgreSQL with audit logging (see PRODUCTION_DEPLOYMENT.md)

## Code Style & Patterns

- **TypeScript strict mode** — All code must be strict-compatible
- **ESM modules only** — No CommonJS
- **No implicit `any`** — Strict type checking
- **Format with Prettier** — Configure IDE to format on save
- **Bun for build/test/run** — Not Node/npm

## Important Files & Patterns

- **API definition** — `backend/src/server.ts` (all endpoints)
- **Type definitions** — `backend/src/types.ts` (canonical source)
- **Config loading** — `backend/src/config.ts` (environment & defaults)
- **Test structure** — `**/__tests__/*.test.ts` (collocated with source)
- **Monorepo scripts** — `package.json` at root (workspace commands)

## Debugging

**Backend with Inspector**:
```bash
bun run sentinel:start:inspect       # Listen on 127.0.0.1:6499
bun run sentinel:start:inspect:brk   # Pause at startup
# Connect: chrome://inspect or DevTools
```

**CLI Attestation Verification**:
```bash
bun run --filter backend verify -- att-12345
```

## Documentation References

- **[README.md](README.md)** — Project overview, quick start, architecture diagrams
- **[ZKTLS_WEBHOOK_SETUP.md](docs/ZKTLS_WEBHOOK_SETUP.md)** — Webhook architecture & setup
- **[MANUAL_TESTING.md](docs/MANUAL_TESTING.md)** — Test cases & troubleshooting
- **[PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)** — PostgreSQL, backups, compliance

## Plugin Development

Plugins implement selective disclosure by specifying which fields from the bank response to reveal:

```typescript
// plugin-bancolombia/src/index.ts example
export function prove(transcript: string): ProveResult[] {
  return [
    { type: "SENT", part: "BODY", action: "REVEAL", value: "..." },
    { type: "RECV", part: "BODY", action: "PEDERSEN", path: "balance", ... }
  ];
}
```

Plugins are built to `dist/` and copied to `app/public/` for the frontend to load.
