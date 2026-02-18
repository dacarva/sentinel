# zkCredit App — Minimal TLSNotary client

Vite + React app that proves mock bank data in the browser with the TLSNotary extension and submits the proof to the Sentinel backend.

## Quick start

```bash
bun run dev
# or from repo root: bun run app:dev
```

Open the app (e.g. http://localhost:5173), enter your wallet address (0x + 40 hex) and optionally bank credentials, then click **Prove with TLSNotary**.

## TLSNotary client setup

To run the full flow (browser → TLSNotary → Mock Bank → backend) you need:

1. **TLSN browser extension**  
   Install from [Chrome Web Store](https://chromewebstore.google.com/detail/gcfkkledipjbgdbimfpijgbkhajiaaph) or [releases](https://github.com/tlsnotary/tlsn-extension/releases). Open the extension and go to **Options**.

2. **WebSocket proxy** (browsers can’t open TCP to localhost)  
   - Install [wstcp](https://github.com/sile/wstcp): `cargo install wstcp`  
   - Start Mock Bank: from repo root `bun run bank:start` (HTTPS on port 3443)  
   - Run proxy: `wstcp --bind-addr 127.0.0.1:55688 localhost:3443`  
   - In the extension Options, set **Proxy API** to `ws://localhost:55688`

3. **Notary server**  
   In extension Options, set **Notary API** to either:  
   - Hosted: `https://notary.pse.dev/v0.1.0-alpha.12`  
   - Local: `http://localhost:7047` (run from [tlsn](https://github.com/tlsnotary/tlsn): `cargo run --release --bin notary-server`)

4. **Mock Bank plugin**  
   The app calls `client.runPlugin(pluginUrl, params)`. You must build the Mock Bank plugin (from [tlsn-plugin-boilerplate](https://github.com/tlsnotary/tlsn-plugin-boilerplate)) and either put `mock-bank-plugin.wasm` in `app/public/` or set `VITE_TLSN_PLUGIN_URL` in `.env`. See `app/public/mock-bank-plugin.readme.txt`.

5. **Sentinel backend** (for POST /attest)  
   Set `VITE_SENTINEL_API` in `.env` (default `http://localhost:3000`). The backend must be running and CORS-enabled for the app origin.

## Environment

Copy `.env.example` to `.env` and adjust:

- `VITE_SENTINEL_API` — Sentinel API base URL  
- `VITE_TLSN_PLUGIN_URL` — URL of the Mock Bank plugin WASM (default `/mock-bank-plugin.wasm`)

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
