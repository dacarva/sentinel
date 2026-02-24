# Mock Bank Prover — TypeScript Plugin

A TypeScript TLSN plugin that proves Mock Bank balance and account data for zkCredit attestation. It can target the local Mock Bank (`https://localhost:3443`) or a shared instance (e.g. ngrok URL).

## Overview

This package:
- Proves Mock Bank `/account/balance` (and optionally transactions) via TLSNotary
- Opens the Mock Bank login page; after login, captures auth and runs `prove()` with selective reveal (balance, currency, account_id)
- Builds to `build/ts-plugin-sample.js`; the repo root script `bun run plugin:build` also copies it to `app/public/ts-plugin-sample.js` so the app can serve it

## Quick Start

### Build

From the plugin directory:

```bash
bun run build
# or: npm run build
```

This bundles the plugin into `build/ts-plugin-sample.js` (from package name `@tlsn/ts-plugin-sample`).

From repo root, use:

```bash
bun run plugin:build
```

That builds the plugin and copies `plugin/build/ts-plugin-sample.js` to `app/public/ts-plugin-sample.js`. The app loads it from `/ts-plugin-sample.js` (or `VITE_TLSN_PLUGIN_URL`).

### Development Mode

```bash
npm run dev
```

Watches for changes and rebuilds automatically.

### Type Checking

```bash
npm run typecheck
```

Runs TypeScript type checking without emitting files.

## Build-time configuration

Set these env vars when building (e.g. for ngrok or production):

- `VERIFIER_URL` — Verifier base URL (default `http://localhost:7047`)
- `PROXY_URL` — WebSocket proxy URL (default `ws://localhost:7047/proxy`)
- `MOCK_BANK_URL` — Mock Bank base URL (default `https://localhost:3443`). For a shared demo use an ngrok URL (e.g. `https://xxxx.ngrok-free.app`).

Example:

```bash
MOCK_BANK_URL=https://your-ngrok-url.ngrok-free.app bun run build
```

## Project Structure

```
plugin/
├── package.json          # Dependencies and build scripts
├── tsconfig.json         # TypeScript compiler configuration
├── build-wrapper.cjs     # Custom build script (esbuild + defines)
├── src/
│   ├── index.ts          # Mock Bank plugin implementation
│   ├── config.ts         # Plugin configuration (host, requests, urls)
│   └── components/       # UI components (overlay, button, etc.)
├── build/
│   ├── ts-plugin-sample.js   # Bundled plugin
│   └── ts-plugin-sample.js.map
└── README.md
```

## TypeScript Features

### Type Imports

Import types from the plugin SDK for compile-time checking:

```typescript
import type {
  PluginConfig,
  RequestPermission,
  Handler,
  InterceptedRequestHeader,
  DomJson,
} from '@tlsn/plugin-sdk';
```

### Plugin Config Type Safety

The Mock Bank plugin config uses `__MOCK_BANK_URL__` (injected at build time) for host and urls:

```typescript
const config: PluginConfig = {
  name: 'Mock Bank Prover',
  description: 'This plugin will prove your Mock Bank balance for zkCredit attestation.',
  requests: [
    { method: 'GET', host: mockBankHost(), pathname: '/account/balance', verifierUrl: __VERIFIER_URL__ },
    { method: 'GET', host: mockBankHost(), pathname: '/account/transactions', verifierUrl: __VERIFIER_URL__ },
  ],
  urls: [__MOCK_BANK_URL__ + '/*'],
};
```

### Plugin API Globals

The plugin execution environment (QuickJS sandbox) provides these globals:

```typescript
// Declare types for globals injected by the sandbox
declare function div(options?: DomOptions, children?: DomJson[]): DomJson;
declare function button(options?: DomOptions, children?: DomJson[]): DomJson;
declare function openWindow(url: string, options?: {...}): Promise<{...}>;
declare function useEffect(callback: () => void, deps: any[]): void;
declare function useHeaders(filter: (headers: InterceptedRequestHeader[]) => InterceptedRequestHeader[]): InterceptedRequestHeader[];
declare function useState<T>(key: string, defaultValue: T): T;
declare function setState<T>(key: string, value: T): void;
declare function prove(requestOptions: {...}, proverOptions: {...}): Promise<any>;
declare function done(result?: any): void;
```

### Type-Safe Handlers

```typescript
const handlers: Handler[] = [
  {
    type: 'SENT',
    part: 'START_LINE',
    action: 'REVEAL',
  },
  {
    type: 'RECV',
    part: 'BODY',
    action: 'REVEAL',
    params: {
      type: 'json',
      path: 'screen_name',
    },
  },
];
```

## Key Differences from JavaScript

### 1. Type Annotations

```typescript
// JavaScript
function onClick() {
  const isRequestPending = useState('isRequestPending', false);
  // ...
}

// TypeScript
async function onClick(): Promise<void> {
  const isRequestPending = useState<boolean>('isRequestPending', false);
  // ...
}
```

### 2. Interface Compliance

TypeScript ensures your config matches the `PluginConfig` interface:

```typescript
const config: PluginConfig = {
  name: 'X Profile Prover',           // ✓ Required
  description: 'Proves X profile',    // ✓ Required
  version: '0.1.0',                    // ✓ Optional
  requests: [...],                     // ✓ Optional
  urls: [...],                         // ✓ Optional
  // TypeScript will error if required fields are missing!
};
```

### 3. Compile-Time Errors

```typescript
// This will error at compile time:
const handler: Handler = {
  type: 'INVALID',  // ❌ Type '"INVALID"' is not assignable to type 'HandlerType'
  part: 'BODY',
  action: 'REVEAL',
};

// This will pass:
const handler: Handler = {
  type: 'RECV',     // ✓ Valid HandlerType
  part: 'BODY',
  action: 'REVEAL',
};
```

## Build Configuration

### Build Tool: esbuild + Custom Wrapper

The plugin uses **esbuild** with a custom build wrapper:
- **Single file output:** All code bundled into one file
- **ES Module format:** Standard `export default` statement
- **No external imports:** All dependencies bundled inline
- **Zero runtime SDK dependency:** Handler types are string unions (no runtime imports needed)
- **Source maps:** Generated for debugging (`build/index.js.map`)
- **Fast builds:** ~10ms typical build time

The build wrapper (`build-wrapper.cjs`) derives the output filename from `package.json` `name` and runs esbuild.

### TypeScript Config (`tsconfig.json`)

TypeScript is used for type checking only (`npm run typecheck`):
- **Target:** ES2020 (modern browser features)
- **Strict:** Full type checking enabled
- **Global types:** Includes SDK globals for plugin API functions

## Loading in Extension

After building, the compiled plugin can be loaded in the TLSN extension:

1. Build the plugin: `npm run build`
2. The output is `build/<name>.js` with clean ES module export:
   ```javascript
   export default {
     main,
     onClick,
     expandUI,
     minimizeUI,
     config,
   };
   ```
3. Load and execute in the extension:
   ```javascript
   const pluginCode = fs.readFileSync('build/ts-plugin-sample.js', 'utf8');
   const plugin = await sandbox.eval(pluginCode);
   // plugin = { main, onClick, expandUI, minimizeUI, config }
   ```
4. The plugin executes with full type safety verified at compile time

**Output Characteristics:**
- ✅ Single file with `export default` statement
- ✅ No external imports (all dependencies bundled)
- ✅ Zero runtime SDK dependency (types are string unions)
- ✅ ES Module format
- ✅ Matches JavaScript plugin structure

## Comparison with JavaScript Plugin

See `packages/demo/generated/twitter.js` for the equivalent JavaScript implementation.

**Advantages of TypeScript:**
- Compile-time type checking
- IDE autocomplete and IntelliSense
- Catches errors before runtime
- Better documentation via types
- Refactoring safety

**Trade-offs:**
- Requires build step
- Slightly more verbose (type annotations)
- Need to maintain type declarations

## Development Tips

### 1. Use Type Inference

TypeScript can infer many types:

```typescript
// Explicit (verbose)
const header: InterceptedRequestHeader | undefined = useHeaders(...)[0];

// Inferred (cleaner)
const [header] = useHeaders(...);  // Type inferred from useHeaders return type
```

### 2. Use `satisfies` for Config

```typescript
// Good: Type-checked but allows literal types
requests: [
  {
    method: 'GET',
    host: 'api.x.com',
    // ...
  } satisfies RequestPermission,
]

// Also good: Full type annotation
const request: RequestPermission = {
  method: 'GET',
  // ...
};
```

### 3. Enable Strict Mode

Keep `"strict": true` in `tsconfig.json` for maximum type safety.

### 4. Check Build Errors

```bash
npm run build

# Check for type errors without building
npx tsc --noEmit
```

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Plugin SDK Types](../plugin-sdk/src/types.ts)
- [JavaScript Plugin Example](../demo/generated/twitter.js)
- [TLSN Extension Docs](../../CLAUDE.md)

## License

MIT
