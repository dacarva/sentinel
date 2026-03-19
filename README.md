# Sentinel — zkTLS Attestation Engine

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Sentinel is a cryptographic attestation engine that lets users prove financial data (bank balance, transaction history) to third parties without exposing credentials or exact figures. It combines **MPC-TLS** (via [TLSNotary](https://tlsnotary.org)) with **Zero-Knowledge Proofs** (via [Noir](https://noir-lang.org)) to produce verifiable, privacy-preserving attestations.

The system operates in two modes:

- **v2 Selective Disclosure**: The TLSNotary verifier extracts specific JSON fields from a live bank TLS session and commits them cryptographically to the transcript. The backend receives only the disclosed fields — the client cannot forge them.
- **v3 Zero-Knowledge Proofs**: A Noir circuit proves `balance > threshold` in the browser using the committed balance as a private witness. The backend verifies the ZK proof without ever learning the exact balance.

Both modes produce a secp256k1-signed attestation that any third party can verify offline using only the notary's public key.

---

## Architecture

```
User Browser (React + TLSNotary Extension)
    ↓
MPC-TLS Session with Bank (TLSNotary Protocol)
    ↓  (v2: selective field reveal)
    ↓  (v3: Noir circuit proves threshold in browser)
Local/Remote TLSNotary Verifier
    ↓  HTTP Webhook POST (HMAC-authenticated)
Sentinel Backend (Express API, port 3000)
    ↓
secp256k1-Signed Attestation
    ↓
Returned to App / Third-Party Verifier
```

---

## Monorepo Workspaces

| Workspace | Purpose | Key Files |
|-----------|---------|-----------|
| `backend/` | REST API for attestation creation and verification | `src/server.ts`, `src/attestation/`, `src/verifier/` |
| `app/` | React frontend for wallet connection and proof flow | `src/` (React + Vite) |
| `circuit/` | Noir ZK circuit for balance threshold proofs | `src/main.nr`, `Nargo.toml` |
| `mock-bank/` | HTTPS server simulating a bank (development only) | `server.ts` |
| `plugin/` | Base TLSNotary plugin for selective disclosure | `src/` |
| `plugin-bancolombia/` | Bank-specific plugin (Bancolombia) | `src/` |
| `plugin-sdk/` | SDK for building TLSNotary plugins | `src/` |
| `tlsn-common/` | Shared TLSNotary utilities | `src/` |

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Nargo](https://noir-lang.org/docs/getting_started/installation/) (for ZK circuit development)
- [Barretenberg CLI (`bb`)](https://github.com/AztecProtocol/barretenberg) (for ZK proof verification)
- [TLSNotary Browser Extension](https://chromewebstore.google.com/detail/gcfkkledipjgbkdbimfpijgbkhajiaaph) (for E2E testing)

### Install

```bash
git clone https://github.com/your-org/sentinel.git
cd sentinel
bun install
```

### Run the backend

```bash
# Copy and edit environment variables
cp backend/.env.example backend/.env  # then set NOTARY_PRIV_KEY and TLSN_WEBHOOK_SECRET

bun run sentinel:start          # API on http://localhost:3000
```

### Run the web app

```bash
bun run app:dev                 # Dev server on http://localhost:5173
```

### Run the mock bank (development only)

```bash
bun run bank:start              # HTTPS on https://localhost:3443
```

---

## Testing

```bash
bun test                        # Run all tests across workspaces
bun run --filter backend test  # Backend tests only
```

Some ZK circuit tests require `bb` to be in `PATH`. Integration tests that depend on the mock bank server will be skipped if it is not running.

---

## Configuration

### Backend (`backend/src/config.ts`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DATA_DIR` | `data` | Filesystem attestation storage directory |
| `NOTARY_PRIV_KEY` | *(required)* | secp256k1 private key for signing attestations |
| `NOTARY_PUB_KEY` | *(derived)* | Derived from private key if unset |
| `TLSN_WEBHOOK_SECRET` | *(required)* | Shared secret for HMAC webhook authentication |
| `REQUIRE_WEBHOOK` | `true` | Enforce webhook verification for JS presentations |
| `BALANCE_THRESHOLD` | `1000` | Minimum balance for v2 attestation verification |
| `MIN_TX_PER_MONTH` | `3` | Minimum transactions per month for consistency check |
| `CONSISTENCY_MONTHS` | `3` | Number of months to check for consistency |

### App

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_SENTINEL_API` | `http://localhost:3000` | Backend API URL |
| `VITE_TLSN_PLUGIN_URL` | `/ts-plugin-sample.js` | Plugin JS URL |

### Circuit / ZK

| Variable | Default | Description |
|----------|---------|-------------|
| `BB_BIN` | `bb` | Path to the Barretenberg CLI binary |

---

## Security

The repository ships with placeholder secrets (`CHANGE_ME_...`) that are clearly not real. The server logs a prominent warning at startup if these defaults are detected.

**Never deploy to production without setting:**
- `NOTARY_PRIV_KEY` — a real secp256k1 private key
- `TLSN_WEBHOOK_SECRET` — a strong random string

See [SECURITY.md](SECURITY.md) for the vulnerability disclosure policy and [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) for production configuration.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for prerequisites, development workflow, and code style guidelines.

---

## License

[MIT](LICENSE)
