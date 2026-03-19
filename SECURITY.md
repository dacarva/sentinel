# Security Policy

## Reporting Vulnerabilities

**Do NOT open a public GitHub issue for security vulnerabilities.**

Please report security vulnerabilities by email to the maintainers. Include:
- A description of the vulnerability and its potential impact
- Steps to reproduce (proof of concept, if available)
- Any suggested mitigations

We will acknowledge receipt within 72 hours and aim to provide a resolution timeline within 7 days.

## Scope

The following areas are in scope for security reports:

- **Attestation forgery**: Any way to produce a valid attestation without a legitimate TLS session
- **Webhook authentication bypass**: Bypassing HMAC or legacy secret validation
- **Signature verification weaknesses**: Flaws in secp256k1 ECDSA signing or verification
- **ZK proof soundness**: Ability to create a valid ZK proof for a false statement
- **Credential exposure**: Any path that leaks bank credentials or private keys

Out of scope:
- The mock bank server (`mock-bank/`) — it is a development-only testing fixture
- Denial-of-service attacks without security impact
- Issues requiring physical access to the machine

## Development Defaults

The repository ships with placeholder secrets clearly marked `CHANGE_ME_...`. These are **not real secrets** and are intentionally obvious:

| Variable | Default | Status |
|----------|---------|--------|
| `NOTARY_PRIV_KEY` | `CHANGE_ME_SET_A_REAL_SECP256K1_PRIVATE_KEY_IN_NOTARY_PRIV_KEY_ENV_VAR` | Placeholder only — server warns at startup |
| `TLSN_WEBHOOK_SECRET` | `CHANGE_ME_SET_WEBHOOK_SECRET` | Placeholder only — server warns at startup |
| Mock bank keypair | `CHANGE_ME_SET_REAL_SECP256K1_*` | Dev fixture, never used in production |

Before deploying to production, generate real keys and set them as environment variables. See [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) for guidance.

## Response Timeline

| Severity | Target Response |
|----------|----------------|
| Critical | 24 hours |
| High | 72 hours |
| Medium / Low | 7 days |

## Known Limitations (Development Mode)

- Filesystem storage (`DATA_DIR=data`) has no access controls — use PostgreSQL in production
- `REQUIRE_WEBHOOK=false` disables webhook verification — never disable in production
- The mock bank uses a self-signed TLS certificate — do not use in production environments
