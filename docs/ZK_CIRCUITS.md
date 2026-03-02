# ZK Circuits — v3 Balance Threshold Proof

## Status: In Progress / Partially Implemented

The balance threshold circuit is implemented and integrated into the backend.
Browser-side proof generation is wired into the React app.
The remaining gap (PEDERSEN TLS binding) is tracked as a TODO below.

---

## What changed in v3

| Layer | v2 (reveal) | v3 (ZK) |
|-------|-------------|---------|
| Plugin | Reveals `available` field via REVEAL action | Same REVEAL + exposes `balance_raw` for app |
| App | Passes raw results to backend | Generates Noir proof from `balance_raw` in browser |
| Backend input | Exact balance value | ZK proof + public inputs (commitment, threshold) |
| Backend check | `balance >= threshold` (arithmetic) | Verify Noir proof via `bb verify` subprocess |
| Attestation | Stores `balance: 8481134.26` | Stores `commitment` + `balance_proof`, no raw balance |
| Trust model | Backend learns exact balance | Backend learns only `balance > T` |

The MPC-TLS layer is unchanged.

---

## Proof system

**Noir (v1.0.0-beta.3)** with **Barretenberg UltraHonk** proving backend.

- No trusted setup (UltraHonk uses a universal SRS)
- Proof size: ~15KB (UltraHonk proofs; larger than Groth16 but no per-circuit setup)
- Verification: ~200ms via `bb verify` CLI subprocess on backend
- Browser proving: ~5-30s via `@aztec/bb.js` WASM (depends on hardware)

---

## Commitment scheme

```
commitment = sha256(balance_le_bytes || blinder)
```

Where:
- `balance_le_bytes` — 8-byte little-endian encoding of `floor(balance_COP)`
- `blinder` — 16 random bytes generated in the browser (prevents preimage attacks)

The commitment binds the ZK proof to a specific balance value without revealing it.

---

## Circuit

**Location**: `circuit/src/main.nr`

**Public inputs:**
- `commitment: [u8; 32]` — sha256 hash binding the private balance
- `threshold: u64` — minimum balance (default: `1_000_000` COP)

**Private inputs:**
- `balance: u64` — actual balance in whole COP pesos (decimal truncated)
- `blinder: [u8; 16]` — random salt

**Statement proven:**
1. `balance > threshold`
2. `sha256(balance_le_bytes || blinder) == commitment`

---

## Compiled artifacts

Committed to repo at `circuit/target/`:

| File | Purpose |
|------|---------|
| `balance_threshold.json` | Compiled circuit bytecode (nargo compile) |
| `vk` | Verification key (bb write_vk) |
| `proof` | Test fixture proof (balance=2M, threshold=1M) |
| `proof.hex` | Same proof in hex (for copy-paste in tests) |

To recompile (requires Noir toolchain):
```bash
cd circuit
nargo compile
bb write_vk -b target/balance_threshold.json -o target/
# Regenerate test fixture:
nargo execute && bb prove -b target/balance_threshold.json -w target/balance_threshold.gz -o target/
```

---

## Data flow

```
Browser (React app)
    ↓
TLSNotary plugin (plugin-bancolombia)
    → prove() reveals balance_raw, currency, account number
    → done({ results, bank: 'bancolombia', balance_raw: '8481134.26' })
    ↓
App receives plugin output
    → generates 16-byte random blinder
    → commitment = sha256(floor(balance_raw)_le_bytes || blinder)
    → generates Noir proof via @noir-lang/noir_js + @aztec/bb.js WASM
    → presentation = { results, bank, zkProof: { proof, publicInputs } }
    ↓
POST /attest { user_address, presentation }
    ↓
Backend (server.ts)
    → detects presentation.zkProof
    → calls ingestZkPresentation()
        → verifyBalanceProof() via bb verify subprocess
        → builds ZkDisclosedData (commitment, threshold, currency, account_id_hash)
        → NO raw balance stored
    → signs attestation with notary key
    → stores attestation with proof_type: 'v3_zk'
    ↓
GET /attest/:id
    → disclosed_data contains commitment + balance_proof, never balance value
POST /verify/:id
    → signature check only (ZK proof verified at ingest; no balance arithmetic)
```

---

## Implementation files

| File | Role |
|------|------|
| `circuit/src/main.nr` | Noir ZK circuit |
| `circuit/target/balance_threshold.json` | Compiled circuit artifact |
| `circuit/target/vk` | Verification key |
| `app/src/zkproof.ts` | Browser ZK proof generation (WASM) |
| `app/public/circuit.json` | Circuit served to browser |
| `backend/src/verifier/zkproof.ts` | Backend proof verification (bb CLI) |
| `backend/src/attestation/ingest.ts` | `ingestZkPresentation()` |
| `backend/src/types.ts` | `ZkDisclosedData`, `JsPresentationWithZk`, `ZkProofPayload` |
| `plugin-bancolombia/src/index.ts` | Exposes `balance_raw` in plugin output |

---

## TODO: PEDERSEN TLS binding (v3.1)

**Current gap:** The balance value still passes through the TLSNotary webhook payload
transiently (as a REVEAL result). A fully private v3 would use the `PEDERSEN` action
instead of `REVEAL` for the balance field, incorporating the TLSNotary Pedersen commitment
into the ZK circuit's public inputs.

This would mean:
- Plugin uses `PEDERSEN` action for `data.accounts[0].balances.available`
- The Pedersen commitment is a public input in the Noir circuit alongside the sha256 commitment
- The circuit proves: `balance > T` AND `sha256(balance || blinder) == commitment` AND `pedersen_verify(balance, pedersen_commitment)`
- No value-bearing data appears in the webhook payload at all

This requires TLSNotary extension support for PEDERSEN transcript commitments.

---

## Open questions

1. **Proof size**: UltraHonk proofs are ~15KB. For production, consider migrating to
   a compact scheme (Groth16 / FFLONK) once on-chain verification is needed.

2. **Proof generation time**: ~5-30s in browser WASM depending on hardware.
   Consider a loading indicator or background Web Worker.

3. **Multiple predicates**: `balance > T` is one predicate. Future circuits may need
   `average_monthly_income > T` or composable statements.
