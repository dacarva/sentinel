# Sentinel Backend

Attestation engine and verifier for zkCredit. **Client-prove flow:** the browser runs TLSNotary and submits a presentation; the backend verifies the presentation (via Rust verifier when configured), runs balance/consistency checks, binds `user_address`, and stores attestations.

## Scripts

- `bun run start` — start the API server (from repo root: `bun run sentinel:start`)
- `bun run start:inspect` — start with Bun inspector (from root: `bun run sentinel:start:inspect`). Opens debug.bun.sh for breakpoints.
- `bun run start:inspect:brk` — same but pause on the first line (from root: `bun run sentinel:start:inspect:brk`).
- `bun run verify -- <attestation_id>` — run verification for an attestation by id (exit 0 if valid, 1 if invalid)
- `bun test` — run tests

## Debugging

The inspector is bound to **127.0.0.1:6499** so the URL printed in the terminal uses `127.0.0.1` instead of `localhost`. On macOS (and some setups), `localhost` can resolve to IPv6 (`::1`) and the debugger then returns 404 and the Sources pane stays empty; using 127.0.0.1 avoids that.

If the Sources tab in debug.bun.sh is still empty:

- Use the **exact** URL from the terminal (it should already contain `127.0.0.1`).
- Disable ad blockers or privacy extensions for `debug.bun.sh` and `127.0.0.1:6499` (or add a WebSocket allow rule for that host/port).
- Alternatively, use the [Bun VSCode extension](https://bun.com/docs/guides/runtime/vscode-debugger) and attach to `ws://127.0.0.1:6499/<session-id>`.

## Environment

- `BALANCE_THRESHOLD` (default 1000), `MIN_TX_PER_MONTH` (3), `CONSISTENCY_MONTHS` (3)
- `DATA_DIR` — directory for attestation JSON files (default `data`)
- `NOTARY_PUB_KEY` — secp256k1 public key hex for signature verification
- `VERIFIER_BINARY` — path to TLSNotary Rust verifier binary (optional; when unset, POST /attest requires a test double or real verifier configured via adapter)

## Rust verifier setup

The backend invokes the TLSNotary Rust verifier as a subprocess (see `src/attestation/verifier-adapter.ts`). Build the verifier from the [tlsn](https://github.com/tlsnotary/tlsn) repo (e.g. attestation example); set `VERIFIER_BINARY` to the binary path, or pass presentation to a custom command. Without a real binary, use the client with mock/test flows or the API test double (`_mockDisclosed` in POST /attest body for tests).

## Layout

- `src/types.ts` — shared interfaces
- `src/config.ts` — env and defaults
- `src/attestation/` — ingest, verifier-adapter, bind, storage
- `src/verifier/` — signature, balance, consistency, index
- `src/server.ts` — Express API (POST /attest, GET /attest/:id, POST /verify/:id)
- `src/cli-verify.ts` — CLI to verify by id
