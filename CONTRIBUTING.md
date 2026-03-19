# Contributing to Sentinel

Thank you for your interest in contributing to Sentinel.

## Prerequisites

- **Bun** v1.0+ — package management, test runner, and server runtime ([install](https://bun.sh/docs/installation))
- **Nargo** — Noir CLI for compiling ZK circuits ([install](https://noir-lang.org/docs/getting_started/installation/))
- **Barretenberg CLI (bb)** — proving backend for verifying ZK proofs ([install](https://github.com/AztecProtocol/barretenberg#installation))
- **TLSNotary Browser Extension** — required for E2E testing ([Chrome Web Store](https://chromewebstore.google.com/detail/gcfkkledipjgbkdbimfpijgbkhajiaaph))

## Getting Started

```bash
git clone https://github.com/your-org/sentinel.git
cd sentinel
bun install
bun test
```

## Development Workflow

1. **Branch from main**: `git checkout -b feat/your-feature-name`
2. **Make changes**: Follow the code style guidelines below
3. **Run tests**: `bun test` — all tests must pass before submitting a PR
4. **Submit a PR**: Open a pull request against `main` with a clear description of the change

### Running the full stack locally

```bash
# Start the backend API (port 3000)
bun run sentinel:start

# Start the web app (port 5173)
bun run app:dev

# Start the mock bank HTTPS server (port 3443) — for local TLSNotary sessions
bun run bank:start
```

See [docs/MANUAL_TESTING.md](docs/MANUAL_TESTING.md) for end-to-end test scenarios.

## Code Style

- **TypeScript strict mode** — all code must be strict-compatible with no implicit `any`
- **ESM modules only** — no CommonJS (`require`/`module.exports`)
- **Prettier** — format on save; run `bun run app:lint` to check the frontend
- **Bun** for build, test, and run — not Node/npm

## Project Structure

The codebase is a Bun workspaces monorepo. See the [docs/](docs/) directory for architecture and implementation guides:

- [docs/architecture.md](docs/architecture.md) — System architecture overview
- [docs/ZK_CIRCUITS.md](docs/ZK_CIRCUITS.md) — Noir ZK circuit documentation
- [docs/ZKTLS_WEBHOOK_SETUP.md](docs/ZKTLS_WEBHOOK_SETUP.md) — Webhook architecture
- [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) — Production configuration

## Reporting Issues

Please use [GitHub Issues](../../issues) for bug reports and feature requests. For security vulnerabilities, see [SECURITY.md](SECURITY.md).
