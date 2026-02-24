# Manual Testing Guide — zkCredit Attestation

This guide walks through manual test scenarios for the Mock Bank, Sentinel backend, and the minimal Attest client. Use it to verify behaviour before or after automated tests, and for end-to-end checks when the TLSNotary extension and plugin are in use.

---

## 1. Prerequisites

- **Bun** (or Node 18+) at repo root.
- **Optional for full E2E:** Rust toolchain (for `wstcp`), TLSN browser extension, Mock Bank TLSNotary plugin (JavaScript). How to install:

### 1.1 Optional: Install E2E prerequisites

| Component | How to install |
|-----------|----------------|
| **Rust toolchain** | [rustup.rs](https://rustup.rs): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (then restart the terminal). |
| **wstcp** (WebSocket proxy) | With Rust installed: `cargo install wstcp`. See [github.com/sile/wstcp](https://github.com/sile/wstcp). |
| **TLSN browser extension** | [Chrome Web Store](https://chromewebstore.google.com/detail/gcfkkledipjbgdbimfpijgbkhajiaaph) or [tlsn-extension releases](https://github.com/tlsnotary/tlsn-extension/releases). After install, open the extension → **Options** to set Proxy API and Notary API. |
| **Mock Bank plugin (JS)** | From repo root run `bun run plugin:build`. This builds the `plugin` workspace and copies `plugin/build/ts-plugin-sample.js` to `app/public/ts-plugin-sample.js`. The app fetches this and runs it via `window.tlsn.execCode(code)`. Set `VITE_TLSN_PLUGIN_URL` in `app/.env` to override the default `/ts-plugin-sample.js`. |

---

## 2. Mock Bank

The Mock Bank is an HTTPS server that exposes login and account endpoints. It is used by the Attest client (via TLSNotary) and can be exercised directly for auth and data checks.

### 2.1 Start the Mock Bank

From repo root:

```bash
bun run bank:start
```

Expected: server listens on `https://localhost:3443`. Opening `https://localhost:3443` in a browser shows a **login page** (username/password form) so the extension has a bank “frontend” to open; API routes remain at `/auth/login`, `/account/balance`, etc. Leave this terminal running.

### 2.2 Generate TLS certificates (first time only)

If the server fails with missing certs:

```bash
cd mock-bank/certs && bash generate.sh && cd ../..
```

### 2.2a Trust the certificate in the browser (Attest flow)

Mock Bank uses a **self-signed** certificate. When you open `https://localhost:3443` in Chrome (e.g. by clicking "Go to bank" in the TLSN extension), the browser shows **"Your connection is not private"** (`NET::ERR_CERT_AUTHORITY_INVALID`). Until you proceed, the extension will not treat the "Open Mock Bank" step as complete and the "Continue" (Enter credentials) button stays disabled.

**Do this once per browser/session:**

1. In the Chrome tab that opened to `https://localhost:3443`, click **Advanced**.
2. Click **Proceed to localhost (unsafe)**.
3. The Mock Bank **login page** should load (username/password form). You can sign in there for clarity, or go straight to the extension and click **Continue** (the plugin uses default or app-supplied credentials). The extension can then advance to "Enter credentials" and you can click **Continue**.

Optional: to avoid the warning entirely, install [mkcert](https://github.com/FiloSottile/mkcert), run `mkcert -install`, then generate certs with mkcert for `localhost` and replace `mock-bank/certs/server.cert` and `server.key` (and point the server at them). The OpenSSL-generated certs work fine once you proceed past the warning.

### 2.3 Test: Valid login

```bash
curl -k -s -X POST https://localhost:3443/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user_pass","password":"sentinel123"}' | jq
```

**Expected:** `200 OK`, JSON with `token` (JWT string) and `expires_in: 3600`.

### 2.4 Test: Invalid password

```bash
curl -k -s -w "\n%{http_code}" -X POST https://localhost:3443/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user_pass","password":"wrong"}'
```

**Expected:** `401`, body with `error: "INVALID_CREDENTIALS"` and message about username/password.

### 2.5 Test: Get balance (with JWT)

Use the token from step 2.3:

```bash
TOKEN="<paste_token_here>"
curl -k -s https://localhost:3443/account/balance \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected:** `200 OK`, JSON with `account_id`, `balance`, `currency`, `last_updated`. For user `user_pass`, balance is `25000`.

### 2.6 Test: Get transactions

```bash
curl -k -s https://localhost:3443/account/transactions \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected:** `200 OK`, array of transactions (e.g. dates, amounts, types, descriptions).

### 2.7 Test: Balance without auth

```bash
curl -k -s -w "\n%{http_code}" https://localhost:3443/account/balance
```

**Expected:** `401` (no `Authorization` header).

### 2.8 Test users (for attest/verify behaviour)

From `mock-bank/data/users.json`:

| Username       | Password     | Purpose                         |
|----------------|--------------|----------------------------------|
| `user_pass`    | `sentinel123`| Passes balance and consistency  |
| `FailBalance`  | `sentinel123`| Balance 500 (below default 1000)|
| `FailConsistency` | `sentinel123` | Few transactions (fails min tx) |

Use these in the Attest UI or in plugin params when testing verification outcomes.

---

## 3. Sentinel Backend (API)

The backend accepts attestations (presentation + `user_address`), stores them, and runs verification (signature, balance, consistency). Without a TLSNotary Rust verifier binary, use the **test double** (`_mockDisclosed`) for manual API tests.

### 3.1 Start the backend

From repo root (in a new terminal):

```bash
bun run sentinel:start
```

Expected: server listens on `http://localhost:3000`. Leave it running.

### 3.2 Test: POST /attest (test double)

Creates an attestation without a real TLSNotary proof by providing disclosed data directly:

```bash
curl -s -X POST http://localhost:3000/attest \
  -H "Content-Type: application/json" \
  -d '{
    "user_address": "0x1111111111111111111111111111111111111111",
    "presentation": "dGVzdA==",
    "_mockDisclosed": {
      "balance": 2000,
      "currency": "USD",
      "account_id_hash": "test-hash",
      "transactions_summary": {
        "months": [
          {"month": "2025-11", "tx_count": 5},
          {"month": "2025-12", "tx_count": 4},
          {"month": "2026-01", "tx_count": 6}
        ]
      }
    }
  }' | jq
```

**Expected:** `201 Created`, body with `attestation_id` (UUID) and `status: "pending"`. Copy `attestation_id` for the next steps.

### 3.3 Test: GET /attest/:id

Replace `<ATTESTATION_ID>` with the id from 3.2:

```bash
curl -s http://localhost:3000/attest/<ATTESTATION_ID> | jq
```

**Expected:** `200 OK`, full attestation JSON (`id`, `user_address`, `timestamp`, `notary`, `disclosed_data`, `status`).

### 3.4 Test: GET /attest/:id — not found

```bash
curl -s -w "\n%{http_code}" http://localhost:3000/attest/00000000-0000-0000-0000-000000000000
```

**Expected:** `404`, body with `error: "NOT_FOUND"` and `message: "Attestation not found"`.

### 3.5 Test: POST /verify/:id

Replace `<ATTESTATION_ID>` with the id from 3.2:

```bash
curl -s -X POST http://localhost:3000/verify/<ATTESTATION_ID> | jq
```

**Expected:** `200 OK`, body with `isValid` (boolean), `errors` (array), `timestamp`. For the attestation created with `_mockDisclosed` above (balance 2000, enough transactions), signature will not match the default notary key, so `isValid` may be `false` with an error about signature; if you use a properly signed fixture or adjust notary key, `isValid` can be `true`.

### 3.6 Test: POST /attest — missing user_address

```bash
curl -s -w "\n%{http_code}" -X POST http://localhost:3000/attest \
  -H "Content-Type: application/json" \
  -d '{"presentation": "dGVzdA=="}' | tail -5
```

**Expected:** `400`, body with `error: "BAD_REQUEST"` and message that `user_address` is required.

### 3.7 Test: POST /attest — missing presentation

```bash
curl -s -w "\n%{http_code}" -X POST http://localhost:3000/attest \
  -H "Content-Type: application/json" \
  -d '{"user_address": "0x1111111111111111111111111111111111111111"}' | tail -5
```

**Expected:** `400`, body with `error: "BAD_REQUEST"` and message that `presentation` is required.

### 3.8 Test: POST /attest — invalid user_address

```bash
curl -s -w "\n%{http_code}" -X POST http://localhost:3000/attest \
  -H "Content-Type: application/json" \
  -d '{
    "user_address": "0xshort",
    "presentation": "dGVzdA==",
    "_mockDisclosed": {
      "balance": 2000,
      "currency": "USD",
      "account_id_hash": "h",
      "transactions_summary": {"months": []}
    }
  }' | tail -5
```

**Expected:** `400`, message indicating `user_address` must be 42 characters (0x + 40 hex).

---

## 4. Verify CLI

From the `backend` directory (or via `bun run --filter backend verify -- <id>` from root):

```bash
cd backend
bun run verify -- <ATTESTATION_ID>
```

**Expected:** JSON printed with `isValid`, `errors`, `timestamp`. Exit code `0` if valid, `1` if invalid. Use an id from section 3.2.

---

## 5. Minimal Attest Client (Browser)

The app provides a single “Attest” screen: user address, optional bank username/password, and “Prove with TLSNotary” that uses the extension and plugin, then POSTs to the backend.

### 5.1 Start the app

From repo root:

```bash
bun run app:dev
```

Open the URL shown (e.g. `http://localhost:5173`) in a browser where the TLSN extension is installed.

### 5.2 Environment

Copy `app/.env.example` to `app/.env` and set:

- `VITE_SENTINEL_API` — backend base URL (default `http://localhost:3000`).
- `VITE_TLSN_PLUGIN_URL` — Mock Bank plugin JS URL (default `/ts-plugin-sample.js`).

### 5.3 Prerequisites for real TLSNotary flow

1. **TLSN extension** installed; in Options set Proxy API and Notary API (see [app/README.md](../app/README.md)).
2. **Mock Bank** running (`bun run bank:start`).
3. **wstcp** proxy: `wstcp --bind-addr 127.0.0.1:55688 localhost:3443`, Proxy API in extension set to `ws://localhost:55688`.
4. **Mock Bank plugin** built and served (e.g. `ts-plugin-sample.js` in `app/public/` or URL in `VITE_TLSN_PLUGIN_URL`).
5. **Sentinel backend** running and reachable at `VITE_SENTINEL_API`.

### 5.4 Manual test: UI and validation

1. Open the app; focus the Attest view.
2. Leave **user_address** empty and click **Prove with TLSNotary**.  
   **Expected:** Error message that `user_address` must be 0x + 40 hex characters.
3. Enter a short or invalid address (e.g. `0x1234`) and click again.  
   **Expected:** Same validation error.
4. Enter a valid address (e.g. `0x1111111111111111111111111111111111111111`).
5. Optionally enter **username** `user_pass` and **password** `sentinel123` (for the plugin; not sent to the backend).
6. Click **Prove with TLSNotary**.

**If extension/plugin/backend are not fully set up:**

- **Expected:** Error such as “TLSN extension not found”, or an execCode/plugin fetch error. This confirms the UI and client logic run; fix extension/plugin/backend as needed.

**If extension is missing:**

- **Expected:** “TLSN extension not found. Install the TLSNotary browser extension and reload.”

### 5.5 Manual test: Successful attest (full E2E)

With Mock Bank, wstcp, extension, plugin, and backend all running and configured:

1. Enter `user_address`: `0x1111111111111111111111111111111111111111`.
2. Enter username `user_pass`, password `sentinel123`.
3. Click **Prove with TLSNotary**.
4. Wait for “connecting” → “proving” → “submitting”.

**Expected:** Success message and an `attestation_id` shown. The app sends the JS plugin proof format (`presentation: { results }`) and the backend maps it to attestation data.

### 5.6 Manual test: Verify after attest

1. After a successful attest, copy the `attestation_id` from the UI.
2. Either:
   - Call `GET http://localhost:3000/attest/<id>` and `POST http://localhost:3000/verify/<id>` with curl (see 3.3 and 3.5), or  
   - Run `bun run verify -- <id>` from `backend/`.
3. **Expected:** Attestation is returned by GET; verify returns `VerificationResult` with `isValid` and `errors` (e.g. signature failure if notary key or format does not match).

---

## 6. End-to-End Checklist

Use this order for a full manual pass:

| Step | Action | Expected |
|------|--------|----------|
| 1 | Start Mock Bank | HTTPS on 3443 |
| 2 | Test Mock Bank login and balance (curl) | 200 + JWT; 200 + balance |
| 3 | Start Sentinel backend | HTTP on 3000 |
| 4 | POST /attest with _mockDisclosed (curl) | 201 + attestation_id |
| 5 | GET /attest/:id (curl) | 200 + attestation JSON |
| 6 | POST /verify/:id (curl) | 200 + VerificationResult |
| 7 | Run `bun run verify -- <id>` in backend | JSON + exit 0 or 1 |
| 8 | Start app; open Attest in browser | Form loads |
| 9 | Invalid user_address in UI | Error message |
| 10 | Valid address + Prove (with or without extension/plugin) | Success or clear error |

---

## 7. Troubleshooting

- **Mock Bank: “Missing TLS certs”** — Run `mock-bank/certs/generate.sh`.
- **Backend: “Presentation verification failed”** — Without a Rust verifier, use `_mockDisclosed` in POST /attest for manual API tests. For real proofs, the verifier must be configured and accept the client’s presentation format.
- **Client: “TLSN extension not found”** — Install the TLSNotary browser extension and reload the app tab.
- **Client: execCode or plugin load fails** — Ensure Mock Bank is running, wstcp proxy is running and set in extension Options, and the Mock Bank plugin JS is built and reachable at `VITE_TLSN_PLUGIN_URL` (default `/ts-plugin-sample.js`).
- **“tls connection failed” / “state error: must be in active state to close connection”** — The Mock Bank sets `Connection: keep-alive` so the prover can close the TLS connection cleanly; the plugin does not send `Connection: close`. Ensure the verifier and proxy (e.g. verifier Docker and wstcp proxy on 7047) are running and reachable. If you see verifier logs like "Expected text message for reveal_config, got: Close(None)", that usually means the extension closed the WebSocket after the prover failed—fix the prover/connection issue above first. If the error persists, try restarting the verifier/proxy or check version compatibility with the TLSNotary extension.
- **CORS errors** — Backend allows `*` origin; ensure `VITE_SENTINEL_API` matches the backend URL the browser uses.

---

## 8. Reference: Monorepo scripts

From repo root:

| Script | Command | Description |
|--------|---------|-------------|
| Mock Bank | `bun run bank:start` | HTTPS server on 3443 |
| Sentinel API | `bun run sentinel:start` | Backend on 3000 |
| App (dev) | `bun run app:dev` | Vite dev server (e.g. 5173) |
| Plugin build | `bun run plugin:build` | Build plugin and copy to app/public/ts-plugin-sample.js |
| Tests | `bun test` | All workspaces |
| Backend verify CLI | `bun run --filter backend verify -- <id>` | Verify attestation by id |
