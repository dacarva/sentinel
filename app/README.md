# Sentinel App — TLSNotary client

Vite + React app that proves bank data in the browser with the TLSNotary extension and submits the proof to the Sentinel backend. Supports the **Bancolombia** plugin (and optional mock bank for local testing).

## Quick start

```bash
bun run dev
# or from repo root: bun run app:dev
```

Open the app (e.g. http://localhost:5173), enter your wallet address (0x + 40 hex), choose the bank (Bancolombia by default), then click **Prove with TLSNotary**.

## TLSNotary client setup

To run the full flow (browser → TLSNotary → Bank → backend) you need:

1. **TLSN browser extension**  
   Install from [Chrome Web Store](https://chromewebstore.google.com/detail/gcfkkledipjbgdbimfpijgbkhajiaaph) or [releases](https://github.com/tlsnotary/tlsn-extension/releases). Open the extension and go to **Options**.

2. **Notary / Proxy**  
   In extension Options, set **Notary API** and **Proxy API** to your TLSNotary verifier (e.g. `https://your-verifier.example.com` and `wss://your-verifier.example.com/proxy`). For local dev, use `http://localhost:7047` and `ws://localhost:7047/proxy` with a local verifier.

3. **Bancolombia plugin (JavaScript)**  
   The app loads the plugin from `/ts-plugin-bancolombia.js`. From repo root run **`bun run plugin:build`** to build the `plugin-bancolombia` workspace and copy the bundle to `app/public/ts-plugin-bancolombia.js`. The plugin is built with `VERIFIER_URL` and `PROXY_URL` (see `plugin-bancolombia/.env.example`); for local dev, set them in `plugin-bancolombia/.env`.

4. **Sentinel backend** (for POST /attest)  
   Set `VITE_SENTINEL_API` in `app/.env` (default `http://localhost:3000`). The backend must be running and CORS-enabled for the app origin.

5. **Mock Bank (optional, local only)**  
   For mock bank testing: from repo root `bun run bank:start` (HTTPS on 3443), run a WebSocket proxy (e.g. `wstcp`), and trust the self-signed cert when Chrome opens `https://localhost:3443`.

## Environment

Copy `app/.env.example` to `app/.env` and adjust:

- `VITE_SENTINEL_API` — Sentinel API base URL (default `http://localhost:3000`)
- `VITE_TLSN_PLUGIN_URL` — Default plugin JS URL (mock/sample)
- `VITE_TLSN_PLUGIN_BANCOLOMBIA_URL` — Bancolombia plugin JS URL (default `/ts-plugin-bancolombia.js`)

## Deploying to Vercel

The repo includes `vercel.json` so the build runs **`bun run app:build`** (plugin build + app build). Set these in **Vercel → Project Settings → Environment Variables** so the Bancolombia plugin is built with the correct verifier/proxy:

- `VERIFIER_URL` — e.g. `https://your-tlsn-verifier.example.com`
- `PROXY_URL` — e.g. `wss://your-tlsn-verifier.example.com/proxy`

---

*Stack: React + TypeScript + Vite. See [Vite](https://vite.dev) and [ESLint](https://eslint.org) docs for configuration.*
