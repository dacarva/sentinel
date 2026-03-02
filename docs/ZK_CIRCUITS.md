# ZK Circuits — v3 Roadmap

## Status: Planned

---

## Goal

Selective disclosure (v2) eliminated the client-side trust assumption: the balance figure
now comes from the TLSNotary verifier's witness of the MPC-TLS session, not from a
client-asserted boolean.

The remaining gap: the backend (and any observer of the attestation) still learns the
**exact balance**. A true zero-knowledge proof would let anyone verify `balance > 1,000,000`
without the balance ever leaving the user's browser in any form.

---

## What changes in v3

| Layer | v2 (current) | v3 (target) |
|-------|-------------|-------------|
| Plugin | Reveals `available` field via path REVEAL | Same — field committed to transcript |
| Verifier | Sends `"available":8481134.26` in webhook | Same transcript commitment |
| Backend input | Exact balance value | ZK proof + public inputs only |
| Backend check | `balance >= threshold` (arithmetic) | Verify ZK proof validity |
| Attestation | Stores `balance: 8481134.26` | Stores `balanceProof: <proof bytes>` |
| Trust model | Backend learns exact balance | Backend learns only `balance > T` |

The MPC-TLS layer is unchanged. The revealed field transitions from a *disclosed value*
to a *private witness* inside the ZK circuit.

---

## Proof system options

### circom + snarkjs (Groth16 / Plonk)
- Mature toolchain, widely used in DeFi
- Compact proofs (≈200 bytes for Groth16)
- EVM-verifiable on-chain
- Requires a per-circuit trusted setup (Groth16) or universal SRS (Plonk/FFLONK)
- Cons: circom DSL is low-level; complex circuits are hard to audit

### Halo2 (PSE fork)
- No trusted setup
- Used across PSE projects (Semaphore, ZK-EVM)
- Rust-native; good fit for integration with TLSNotary (also Rust)
- Cons: larger proof size than Groth16; less tooling than circom

### RISC Zero
- General-purpose zkVM: circuit = Rust program
- Can prove arbitrary computation including HTTP response JSON parsing
- Simpler to write and audit than circuit DSLs
- Cons: larger proofs, higher prover cost; less battle-tested than circom

**Recommended starting point**: RISC Zero for rapid prototyping (write the
`balance > threshold` check as a Rust guest program, prove it); migrate to Halo2 or
circom if proof size or on-chain verification becomes a requirement.

---

## Integration sketch

```
MPC-TLS session
    ↓
Verifier commits balance field to transcript (same as v2)
    ↓
Extension passes commitment + plaintext balance to ZK prover (browser or native)
    ↓
ZK prover: private inputs = { balance, transcript_commitment }
           public inputs  = { threshold, transcript_commitment }
           statement      = "I know a balance such that
                             balance > threshold AND
                             hash(balance) == transcript_commitment"
    ↓
Proof sent to backend (instead of raw balance)
    ↓
Backend verifies proof using public inputs only
    ↓
Attestation stores proof bytes + public inputs — never the balance
```

The transcript commitment comes from the MPC-TLS session already; TLSNotary's
`transcript_hash` in the webhook payload is a natural public input.

---

## Open questions

1. **Where does proving happen?** Browser-side (WASM prover) adds latency but avoids
   sending plaintext to any server. Native prover on a user-controlled machine is faster
   but adds setup friction.

2. **Proof portability**: should the proof be verifiable on-chain (Ethereum/EVM) or
   only by the Sentinel backend? On-chain verification unlocks DeFi use cases but
   increases proof system constraints.

3. **Multiple predicates**: `balance > T` is one predicate. Future circuits may need
   `average_monthly_income > T` or `credit_utilization < 30%` — the circuit design
   should be composable from the start.

4. **Transcript binding**: the circuit must prove that the committed value was genuinely
   extracted from the same TLS session the verifier witnessed. This requires incorporating
   the TLSNotary session commitment into the circuit's public inputs.
