# Sentinel — zkTLS Attestation Engine

[![Tests](https://img.shields.io/badge/tests-146%20total-blue)]()
[![Passing](https://img.shields.io/badge/passing-136-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

Sentinel is a cryptographic attestation system that enables users to prove their financial data (bank balance, transaction history) to third parties without exposing credentials. It leverages **MPC-TLS** (via [TLSNotary](https://tlsnotary.org)) and **Zero-Knowledge Proofs** (via [Noir](https://noir-lang.org)) to create verifiable, privacy-preserving attestations.

**Note** (March 2026): Sentinel was my initial architecture for Zero-Knowledge financial attestations using zkTLS. While powerful, zkTLS introduces massive latency overhead for real-time AI agents. I have since evolved this architecture into [Zemtik](https://github.com/dacarva/zemtik-core), replacing zkTLS with a sub-20-second local state-extraction proxy (Rust + UltraHonk) designed specifically for Enterprise AI compliance.

---

## Key Features

### 🔐 Cryptographic Privacy
- **Selective Disclosure (v2)**: Reveal only specific JSON fields (`balance`, `currency`) from a TLS session. The verifier (not the client) commits these to the transcript, ensuring they are cryptographically bound to the bank's response.
- **Zero-Knowledge Proofs (v3)**: Prove that a balance exceeds a threshold (e.g., `balance > 1,000,000 COP`) without revealing the exact figure. Uses Noir UltraHonk to generate proofs in the browser and verify them on the backend.

### 🌍 Production-Ready Auditability
- **Proof Origin Binding**: Attestations are linked to their originating TLS session via transcript hashes.
- **HMAC Webhook Authentication**: Secure, replay-protected delivery of proofs from the TLSNotary verifier to the Sentinel backend.
- **ECDSA Signatures**: All attestations are signed using secp256k1 (the same curve as Ethereum) for easy third-party verification.

---

## Architecture

```
User Browser (React + TLSN Extension)
    ↓
MPC-TLS Session (TLSNotary Protocol)
    ↓
Local/Remote Verifier (Webhook)
    ↓
Sentinel Backend (Signature & ZK Verification)
    ↓
Signed Attestation (secp256k1)
```

### Monorepo Workspaces
- `backend/`: Attestation REST API and verification logic.
- `app/`: Frontend for wallet connection and proof submission.
- `circuit/`: Noir ZK circuit for balance threshold proofs.
- `plugin-bancolombia/`: TLSNotary plugin for live Bancolombia sessions.
- `plugin-sdk/` & `tlsn-common/`: Shared utilities for building plugins.
- `mock-bank/`: (Legacy) HTTPS server for development testing (deprecated).

---

## Core Concepts

### Commitment Scheme
For v3 ZK proofs, we use a commitment scheme to bind the private balance to the public proof:
`commitment = sha256(balance_le_bytes || blinder)`
- `balance_le_bytes`: 8-byte little-endian encoding of the floor(balance).
- `blinder`: 16 random bytes to prevent brute-force preimage attacks.

### Thresholds
- **Mock Bank (v2)**: Default threshold is **1,000 USD**.
- **Bancolombia (v3)**: Default threshold is **1,000,000 COP**.
- Thresholds are configurable via environment variables or public inputs in the ZK circuit.

---

## Quick Start for Contributors

### Prerequisites
- **Bun** (v1.3.4+): Package management and test runner.
- **Nargo** (v1.0.0-beta.3+): [Noir CLI](https://noir-lang.org/docs/getting_started/installation/) for compiling circuits.
- **Barretenberg CLI (bb)**: [Proving backend](https://github.com/AztecProtocol/barretenberg) for verifying ZK proofs.
- **Chrome**: Required for the [TLSNotary Browser Extension](https://chromewebstore.google.com/detail/gcfkkledipjgbkdbimfpijgbkhajiaaph).

### Installation
```bash
git clone https://github.com/yourusername/sentinel.git
cd sentinel
bun install
```

### Building the Project
Build the ZK circuit and the Bancolombia plugin before running the full stack:
```bash
# Compile Noir circuit and generate verification key (optional for v2-only flows)
bun run circuit:build

# Build the Bancolombia plugin and copy to app/public/
bun run plugin:build
```
`plugin:build` builds `plugin-bancolombia` and copies `ts-plugin-bancolombia.js` to `app/public/`. For local dev, set `VERIFIER_URL` and `PROXY_URL` in `plugin-bancolombia/.env` (see `plugin-bancolombia/.env.example`). For Vercel, set those variables in the project’s Environment Variables.

### Local Development
1. **Start Backend**: `bun run sentinel:start` (Port 3000)
2. **Start Web App**: `bun run app:dev` (Port 5173)
3. **Configure Extension**: Set Notary/Proxy API to `http://localhost:7047` and ensure your local TLSNotary verifier is running.

---

## Testing

The project includes a comprehensive suite of 146 tests covering the backend, circuits, and plugin SDK.

```bash
# Run all tests (requires 'bb' CLI for ZK tests)
bun test

# Run backend tests only
cd backend && bun test
```
*Note: Some ZK tests may fail if `bb` is not in your PATH. Integration tests for the mock bank require the bank server to be running or will be skipped in future updates.*

---

## Project Status & Roadmap

### ✅ Completed
- **v2 Selective Disclosure**: Path-level extraction of bank data with transcript binding.
- **v3 ZK Threshold Proofs**: Browser-side Noir proof generation and backend verification.
- **Webhook HMAC Auth**: Secure delivery of proofs with replay protection.

### 🚧 Backlog (v3.1+)
- **PEDERSEN TLS binding**: Replace `REVEAL` with `PEDERSEN` actions in the TLSNotary plugin to ensure balance values never touch the webhook payload.
- **On-chain Verification**: Solidity verifier for Noir proofs to enable smart contract integration.
- **Multi-bank Support**: Standardization of plugin outputs for easier bank onboarding.

---

## Contributing

1. **Research**: Read `docs/ARCHITECTURE.md` and `docs/ZK_CIRCUITS.md`.
2. **Implement**: Follow the existing TypeScript and Noir patterns.
3. **Test**: Ensure `bun test` passes (including ZK verification).
4. **Document**: Update relevant `.md` files in `/docs` for any architectural changes.

---

## License
MIT
