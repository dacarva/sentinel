# Sentinel Backend

Attestation engine and verifier for zkCredit. Accepts TLSNotary presentations from the client, verifies them, runs balance/consistency checks, and stores attestations.

## Scripts

- `bun run start` — start the API server (from repo root: `bun run sentinel:start`)
- `bun test` — run tests

## Environment

See `.env.example` (when added). Config: `BALANCE_THRESHOLD`, `MIN_TX_PER_MONTH`, `CONSISTENCY_MONTHS`, `DATA_DIR`, TLSNotary verifier binary path.

## Layout (per implementation plan)

- `src/types.ts` — shared interfaces
- `src/config.ts` — env and defaults
- `src/attestation/` — ingest, verifier-adapter, bind, storage
- `src/verifier/` — signature, balance, consistency, index
- `src/server.ts` — Express API (POST /attest, GET /attest/:id, POST /verify/:id)
