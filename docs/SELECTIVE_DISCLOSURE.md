> **Note:** This documents the v2 selective disclosure implementation. For the current v3 zero-knowledge proof approach, see [ZK_CIRCUITS.md](ZK_CIRCUITS.md).

# Selective Disclosure

## Status: Completed in v2

---

## What was shipped

The Bancolombia plugin now performs cryptographic selective disclosure via TLSNotary
path-level REVEAL handlers. Instead of revealing the full HTTP response body and computing
a threshold claim client-side, the verifier extracts only four specific JSON fields and
commits them to the MPC-TLS transcript. The backend receives those values directly from
the verifier — not from the client — making the balance figure cryptographically bound to
the real TLS session.

### v1 — Mock ZKP (removed)

The original approach revealed the entire RECV body, then the plugin parsed the JSON and
computed `balance > 1,000,000` client-side. A boolean `mockZkp.balanceAboveThreshold` was
sent to the backend alongside the proof.

**Trust gap**: a malicious client could fabricate `balanceAboveThreshold: true` without
having a real session. The webhook validated that *a* session happened, but not that the
threshold was computed honestly.

### v2 — Path-specific REVEAL (current)

```
MPC-TLS session
    ↓
Verifier extracts 4 JSON fields (available, currency, number, name)
    ↓
Fields committed to transcript — client cannot alter them
    ↓
Backend reads balance directly from verified fields
```

**Trust assumption eliminated.** The balance comes from the verifier's witness of the TLS
session, not from any client-side computation.

---

## Implementation

### Plugin (`plugin-bancolombia/src/index.ts`)

Six handlers instead of one full-body REVEAL:

```typescript
handlers: [
  { type: 'SENT', part: 'START_LINE', action: 'REVEAL' },
  { type: 'RECV', part: 'START_LINE', action: 'REVEAL' },
  { type: 'RECV', part: 'BODY', action: 'REVEAL',
    params: { type: 'json', path: 'data.accounts[0].balances.available' } },
  { type: 'RECV', part: 'BODY', action: 'REVEAL',
    params: { type: 'json', path: 'data.accounts[0].currency' } },
  { type: 'RECV', part: 'BODY', action: 'REVEAL',
    params: { type: 'json', path: 'data.accounts[0].number' } },
  { type: 'RECV', part: 'BODY', action: 'REVEAL',
    params: { type: 'json', path: 'data.accounts[0].name' } },
]
```

`done()` is simplified — no mock ZKP post-processing:

```typescript
done(JSON.stringify({ results: balanceResp.results, bank: 'bancolombia' }));
```

### Proof format (as received from the extension)

The TLSNotary extension returns raw key-value text fragments — not nested JSON paths and
not scalar values alone. The `params.path` field used in the handler spec is **not**
echoed back in the results. Each revealed BODY result looks like:

```json
{ "type": "RECV", "part": "BODY", "value": "\"available\":8481134.26" }
{ "type": "RECV", "part": "BODY", "value": "\"currency\":\"COP\"" }
{ "type": "RECV", "part": "BODY", "value": "\"number\":\"20303826004\"" }
{ "type": "RECV", "part": "BODY", "value": "\"name\":\"CARVAJAL CERTUCHE DA\"" }
```

### Backend field extraction (`presentation-from-results.ts`)

`findResultByPath` uses a two-step lookup:

1. **Primary**: check `params?.path === fullPath` (forward-compat if a future extension
   version preserves handler params in results).
2. **Fallback**: extract the leaf key from the dotted path
   (`data.accounts[0].balances.available` → `available`), search for a BODY result whose
   `value` contains `"available"`, then regex-extract the scalar.

### Types and routing cleanup

- `MockZkpClaim` interface deleted from `types.ts`
- `mockZkp?` field removed from `JsPresentation`
- `disclosedDataFromMockZkp()` deleted from `presentation-from-results.ts`
- `ingest.ts` routes directly: `bancolombia` → `disclosedDataFromBancolombiaPresentation`,
  else → `disclosedDataFromJsPresentation`

### App UI (`app/src/Attest.tsx`)

`extractThresholdClaim()` uses the same leaf-key approach as the backend to read balance,
currency, number, and name from the raw fragments. The banner appears only when the
cryptographically-proven balance exceeds 1,000,000:

> **CARVAJAL** (2030\*\*\*\*\*\*\*) has more than 1,000,000 COP

---

## What selective disclosure does NOT yet provide

The balance value is cryptographically revealed — the client cannot forge it. However,
the backend still receives the **exact balance figure**. A true zero-knowledge proof would
let the backend verify `balance > 1,000,000` without learning the actual number.

That is the goal of the next stage: **ZK circuits**.

---

## Next: ZK Circuits (v3)

See [ZK_CIRCUITS.md](ZK_CIRCUITS.md) for the roadmap.

**Goal**: replace the revealed balance value with a ZK proof that the committed balance
satisfies the threshold predicate, so the backend (and any observer) learns only
`balance > T` — not the balance itself.

**Approach**: use the MPC-TLS transcript commitment as a public input to a ZK circuit
that proves `balance > threshold` in zero knowledge. Candidate proving systems:

- **Groth16 / Plonk** (via snarkjs or circom) — compact proofs, EVM-verifiable
- **Halo2** — no trusted setup, used by PSE projects
- **RISC Zero** — general-purpose zkVM, can prove arbitrary Rust programs including JSON parsing

The MPC-TLS layer does not change. The revealed field becomes a private witness to the
circuit rather than a disclosed value.
