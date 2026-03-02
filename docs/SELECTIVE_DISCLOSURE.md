# Selective Disclosure — v2 Implementation Plan

## Status: Scheduled for next release

This document describes the plan to replace the current mock ZKP threshold claim with
cryptographic selective disclosure via TLSNotary path-level REVEAL handlers.

---

## Background

### What works today (v1 — mock ZKP)

The Bancolombia plugin completes a full MPC-TLS session and reveals the entire RECV BODY
to both the browser and the verifier. After `prove()` returns, the **plugin itself** parses
the JSON and computes `balance > 1,000,000` client-side, then passes this boolean claim to
the backend via a `mockZkp` field in the presentation.

```
MPC-TLS session → full body revealed → plugin parses → boolean claim sent to backend
```

**Trust assumption**: the backend trusts that the client computed the threshold correctly.
The actual balance figure is never sent, but a malicious client could fabricate the
`balanceAboveThreshold: true` flag without having a real session at all (the webhook
still validates the _session_ happened, but not that the threshold was computed honestly).

### What selective disclosure achieves (v2)

TLSNotary's path-specific REVEAL handlers instruct the verifier to extract and commit only
the specified JSON fields from the response body. The backend receives those field values
directly from the verifier webhook — not from the client — and cryptographically bound to
the MPC-TLS transcript.

```
MPC-TLS session → verifier extracts specific fields → fields bound to transcript → backend reads balance directly
```

**Trust assumption eliminated**: the client cannot forge the balance value because it comes
from the verifier's witness of the TLS session, not from client-side computation.

---

## Why it isn't done yet

TLSNotary's path-specific handler notation (`params: { type: 'json', path: '...' }`) was
found to produce empty results in practice during v1 development — the handlers were
accepted by the extension without error but the corresponding `value` fields came back
empty or missing. The root cause is likely one of:

1. **Path syntax incompatibility** — the path format expected by the current extension
   version may differ from what was tested (e.g. `data.accounts[0].balances.available`
   vs. bracket notation vs. a different separator).
2. **Extension version mismatch** — path-level REVEAL may require a newer alpha of the
   extension or a specific verifier binary version.
3. **Body encoding** — the response may be chunked or compressed in a way the path
   extractor doesn't handle without additional configuration.

Investigation was deferred in favour of shipping a working end-to-end flow for v1.

---

## v2 Implementation Plan

### Step 1 — Diagnose path handler support

Before writing any backend code, confirm which path notation the running extension version
accepts:

```typescript
// Candidate notations to test one at a time:
{ type: 'RECV', part: 'BODY', action: 'REVEAL', params: { type: 'json', path: 'data.accounts[0].balances.available' } }
{ type: 'RECV', part: 'BODY', action: 'REVEAL', params: { type: 'json', path: 'data.accounts.0.balances.available' } }
{ type: 'RECV', part: 'BODY', action: 'REVEAL', params: { type: 'json', path: '$.data.accounts[0].balances.available' } }
```

Add a diagnostic `console.log(JSON.stringify(balanceResp.results, null, 2))` in the plugin
after `prove()` returns and inspect the extension DevTools console.

Also check the TLSNotary extension changelog between alpha versions for breaking changes to
handler params.

### Step 2 — Update plugin handlers

Once the correct path notation is confirmed, replace the full-body REVEAL in
`plugin-bancolombia/src/index.ts` with path-specific handlers:

```typescript
handlers: [
  { type: 'SENT', part: 'START_LINE', action: 'REVEAL' } satisfies Handler,
  { type: 'RECV', part: 'START_LINE', action: 'REVEAL' } satisfies Handler,
  {
    type: 'RECV',
    part: 'BODY',
    action: 'REVEAL',
    params: { type: 'json', path: 'data.accounts[0].balances.available' },
  } satisfies Handler,
  {
    type: 'RECV',
    part: 'BODY',
    action: 'REVEAL',
    params: { type: 'json', path: 'data.accounts[0].currency' },
  } satisfies Handler,
  {
    type: 'RECV',
    part: 'BODY',
    action: 'REVEAL',
    params: { type: 'json', path: 'data.accounts[0].number' },
  } satisfies Handler,
],
```

Remove the mock ZKP post-processing block and the `mockZkp` field from `done()`:

```typescript
done(JSON.stringify({ results: balanceResp.results, bank: 'bancolombia' }));
```

### Step 3 — Backend: remove mock ZKP routing

In `backend/src/attestation/ingest.ts`, remove the `mockZkp` branch:

```typescript
// Before (v1):
const disclosed_data =
  presentation.mockZkp
    ? disclosedDataFromMockZkp(presentation.mockZkp)
    : presentation.bank === 'bancolombia'
      ? disclosedDataFromBancolombiaPresentation(presentation)
      : disclosedDataFromJsPresentation(presentation);

// After (v2):
const disclosed_data =
  presentation.bank === 'bancolombia'
    ? disclosedDataFromBancolombiaPresentation(presentation)
    : disclosedDataFromJsPresentation(presentation);
```

`disclosedDataFromBancolombiaPresentation()` in `presentation-from-results.ts` already
contains the correct field-extraction logic — it just needs the path-specific results to
be non-empty for it to work.

### Step 4 — Types cleanup

Remove `MockZkpClaim` from `backend/src/types.ts` and the `mockZkp?` field from
`JsPresentation`. Remove `disclosedDataFromMockZkp()` from `presentation-from-results.ts`.

### Step 5 — App: update UI claim

The `extractThresholdClaim()` helper in `app/src/Attest.tsx` parses the full body from
`proof.results`. After selective disclosure, only the specific fields will be present — the
full body string will no longer be in `results`. Update `extractThresholdClaim()` to read
from the path-specific result items instead:

```typescript
function extractThresholdClaim(proof: PluginProof): ThresholdClaim | null {
  const balanceResult = proof.results?.find(
    (r) => r.type === 'RECV' && r.part === 'BODY' && (r.params as { path?: string })?.path === 'data.accounts[0].balances.available'
  )
  const nameResult = proof.results?.find(
    (r) => r.type === 'RECV' && r.part === 'BODY' && (r.params as { path?: string })?.path === 'data.accounts[0].number'
  )
  // ... extract balance, compare to threshold, build claim
}
```

### Step 6 — Rebuild and test

```bash
bun run --filter @tlsn/ts-plugin-bancolombia build
cp plugin-bancolombia/build/ts-plugin-bancolombia.js app/public/ts-plugin-bancolombia.js
REQUIRE_WEBHOOK=false bun test backend/src   # all 31 tests must pass
```

Then run the full E2E flow (see [ZKTLS_WEBHOOK_SETUP.md](ZKTLS_WEBHOOK_SETUP.md)).

---

## Files to Change in v2

| File | Change |
|------|--------|
| `plugin-bancolombia/src/index.ts` | Replace full-body REVEAL with path-specific handlers; remove mock ZKP block |
| `backend/src/types.ts` | Remove `MockZkpClaim`; remove `mockZkp?` from `JsPresentation` |
| `backend/src/attestation/presentation-from-results.ts` | Remove `disclosedDataFromMockZkp()` |
| `backend/src/attestation/ingest.ts` | Remove `mockZkp` branch; route directly to `disclosedDataFromBancolombiaPresentation` |
| `app/src/Attest.tsx` | Update `extractThresholdClaim()` to read path-specific results |

---

## Acceptance Criteria

- [ ] `balanceResp.results` contains non-empty `value` for each path-specific handler
- [ ] `POST /attest` returns `201` without `mockZkp` in the presentation
- [ ] `POST /verify/:id` returns `isValid: true` with real balance extracted from revealed fields
- [ ] `MockZkpClaim` type and `disclosedDataFromMockZkp()` are deleted
- [ ] All 31 backend tests pass
- [ ] UI claim banner still shows correctly (using path-specific result values)
