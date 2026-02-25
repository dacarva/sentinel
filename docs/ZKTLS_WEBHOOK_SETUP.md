# zkTLS Webhook Architecture — Local Dev Setup

This guide explains the TLSNotary verifier webhook architecture, why we use the deployed mock bank, and the full startup sequence for local development.

## Architecture Overview

The Sentinel zkTLS flow uses a local TLSNotary verifier to perform MPC-TLS against a real TLS server, then sends a webhook to the Sentinel backend to verify the proof independently. This prevents the client from fabricating proof data.

| Component | Location | Purpose |
|-----------|----------|---------|
| TLSNotary Extension | Chrome (v0.1.0-alpha.14) | Runs `prove()` in browser via plugin |
| TLSNotary Verifier | Local binary (port 7047) | MPC-TLS co-participant, sends webhooks after each session |
| Mock Bank | https://sentinel-d75o.onrender.com | Real TLS target with CA-signed cert (deployed on Render) |
| Sentinel Backend | localhost:3000 | Receives webhooks, stores proof, creates attestations |
| App | localhost:5173 | Frontend for wallet connection and proof submission |

## Why Not a Local Mock Bank?

The TLSNotary MPC-TLS protocol requires the target server to have a **valid CA-signed TLS certificate**. The local mock bank uses a self-signed certificate, which the verifier cannot attest to — it would fail TLS verification.

The deployed mock bank at **https://sentinel-d75o.onrender.com** has a valid certificate from Render's CA, allowing the verifier to perform proper TLS handshakes.

When you run the plugin locally:
1. Browser connects to the deployed mock bank
2. TLSNotary extension + local verifier perform MPC-TLS with that real TLS cert
3. Verifier witnesses the session and POSTs a webhook to `http://localhost:3000/webhook/tlsn`
4. Backend stores the webhook and matches it against client submissions

## External Prerequisites (One-Time Setup)

### 1. Build the TLSNotary Verifier

Clone and build the verifier from the `tlsn-extension` repository (not the main `tlsn` library repo):

```bash
git clone https://github.com/tlsnotary/tlsn-extension
cd tlsn-extension/packages/verifier
cargo build --release
# Binary: target/release/tlsn-verifier
```

### 2. Configure Verifier Webhooks

Create or edit `tlsn-extension/packages/verifier/config.yaml`:

```yaml
webhooks:
  "sentinel-d75o.onrender.com":
    url: "http://localhost:3000/webhook/tlsn"
    headers:
      X-TLSN-Secret: "dev-local-secret"
```

The key (`"sentinel-d75o.onrender.com"`) is the hostname the verifier witnesses during TLS. The verifier will POST to the `url` with the `headers` attached when that hostname is encountered.

### 3. Install TLSNotary Extension

1. Install the TLSNotary extension (v0.1.0-alpha.14 or later) in Chrome
2. Open extension options and set:
   - **Notary API URL**: `http://localhost:7047`
   - **Proxy API URL**: `ws://localhost:7047/proxy`

The verifier binary includes a built-in WebSocket proxy at `/proxy`, so no separate wstcp service is needed.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TLSN_WEBHOOK_SECRET` | `dev-local-secret` | Shared secret for X-TLSN-Secret header validation on `/webhook/tlsn` |
| `REQUIRE_WEBHOOK` | `true` | Set to `false` to disable webhook verification (useful for unit tests) |
| `NOTARY_PRIV_KEY` | (dev default) | secp256k1 private key for signing attestations |
| `PORT` | `3000` | Backend port |
| `DATA_DIR` | `data` | Directory for storing attestations |

## Local Startup Sequence

Once external prerequisites are done, start services in order:

### Terminal 1: TLSNotary Verifier

```bash
cd tlsn-extension/packages/verifier
./target/release/tlsn-verifier
```

Expected output:
```
TLSNotary Verifier running on localhost:7047
```

### Terminal 2: Sentinel Backend

```bash
cd sentinel
bun run sentinel:start
```

Expected output:
```
Sentinel API on http://localhost:3000
```

### Terminal 3: Sentinel App

```bash
cd sentinel
bun run app:dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local: http://localhost:5173
```

## How Webhook Matching Works

1. **prove() call #1** in plugin:
   - Browser extension calls `prove()` for `/account/balance`
   - Verifier performs MPC-TLS, witnesses `server_name: "sentinel-d75o.onrender.com"`
   - Verifier POSTs webhook #1 with balance/currency/account_id results

2. **prove() call #2** in plugin:
   - Plugin calls `prove()` for `/account/transactions`
   - Verifier performs another MPC-TLS session, witnesses same `server_name`
   - Verifier POSTs webhook #2 with transactions results

3. **Client submits merged proof**:
   - Plugin merges results: `[...balanceResults, ...txResults]`
   - App POSTs `/attest` with merged `presentation.results[]`

4. **Backend validates**:
   - Backend uses subset matching: finds any stored webhook whose results are **fully contained** in the client's merged array
   - If match found → webhook is valid, proceed with attestation
   - If no match → reject with `422 WEBHOOK_REQUIRED`

## Health Checks

Verify all services are running:

```bash
# Verifier health
curl http://localhost:7047/health

# Backend readiness
curl http://localhost:3000/attest -X OPTIONS

# App
open http://localhost:5173
```

## Testing the Webhook Flow

### Test 1: Webhook without secret (should be rejected)

```bash
curl -X POST http://localhost:3000/webhook/tlsn \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "sentinel-d75o.onrender.com",
    "results": [],
    "session": {"id": "test"},
    "transcript": {"sent": [], "recv": [], "sent_length": 0, "recv_length": 0}
  }'

# Expected: 401 UNAUTHORIZED
```

### Test 2: Webhook with correct secret (should be accepted)

```bash
curl -X POST http://localhost:3000/webhook/tlsn \
  -H "Content-Type: application/json" \
  -H "X-TLSN-Secret: dev-local-secret" \
  -d '{
    "server_name": "sentinel-d75o.onrender.com",
    "results": [
      {
        "type": "RECV",
        "part": "BODY",
        "action": "REVEAL",
        "params": {"type": "json", "path": "balance"},
        "value": "25000"
      }
    ],
    "session": {"id": "test-session"},
    "transcript": {"sent": [], "recv": [], "sent_length": 0, "recv_length": 0}
  }'

# Expected: 200 { "ok": true }
```

### Test 3: Attest without prior webhook (should be rejected)

```bash
curl -X POST http://localhost:3000/attest \
  -H "Content-Type: application/json" \
  -d '{
    "user_address": "0x1111111111111111111111111111111111111111",
    "presentation": {
      "results": [
        {
          "type": "RECV",
          "part": "BODY",
          "action": "REVEAL",
          "params": {"type": "json", "path": "balance"},
          "value": "25000"
        }
      ]
    }
  }'

# Expected: 422 WEBHOOK_REQUIRED
```

### Test 4: Run backend tests (webhook check disabled)

```bash
cd sentinel
REQUIRE_WEBHOOK=false bun test
```

This runs the full test suite without requiring webhook verification.

## End-to-End Manual Test

### Setup

All three services running as described in "Local Startup Sequence".

### Flow

1. **Browser**: Open http://localhost:5173
2. **UI**: Enter wallet address (any valid 0x... format)
3. **Click**: "Prove with TLSNotary"
4. **Extension**: Opens https://sentinel-d75o.onrender.com in new window
5. **Login**: Use credentials `user_pass` / `sentinel123`
6. **Prove**: Click "Prove" in the extension overlay
7. **Wait**: Both prove() calls complete (balance + transactions)
8. **Backend logs**: Should show two webhooks received:
   ```
   Webhook received: server_name=sentinel-d75o.onrender.com, results=[5 items]
   Webhook received: server_name=sentinel-d75o.onrender.com, results=[3 items]
   ```
9. **App UI**: Shows attestation_id in success state
10. **Verify**:
    ```bash
    curl -X POST http://localhost:3000/verify/<attestation_id> \
      -H "Content-Type: application/json" \
      -d '{}'

    # Expected: { "isValid": true, "errors": [] }
    ```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Verifier not found" | Check verifier is running (`./target/release/tlsn-verifier`), port 7047 is listening |
| "Extension not installed" | Install TLSNotary v0.1.0-alpha.14 from Chrome Web Store; reload app |
| "WEBHOOK_REQUIRED" error | Ensure verifier webhook config points to `http://localhost:3000/webhook/tlsn` with correct secret |
| "TLSN_SECRET mismatch" | Verify `config.yaml` has `X-TLSN-Secret: dev-local-secret` matching `TLSN_WEBHOOK_SECRET=dev-local-secret` in backend |
| Tests fail with "webhook" errors | Run tests with `REQUIRE_WEBHOOK=false bun test` |

## Production Upgrade Path

This local architecture uses:
- ✅ Real MPC-TLS sessions (witnessed by local verifier)
- ✅ Webhook-based proof reporting (prevents client forgery)
- ⚠️ Shared secret authentication (local network trust)
- ❌ Cryptographic signatures on webhooks

For production, upgrade to:
- Deploy verifier on secure infrastructure
- Use signed webhooks (HMAC-SHA256 or Ed25519)
- Use PSE's notary server (https://notary.pse.dev) for third-party proofs
- Store proofs in immutable attestation format (TLSNotary binary format)
