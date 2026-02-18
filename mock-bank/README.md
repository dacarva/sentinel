# Mock Bank

HTTPS mock bank API for the zkTLS attestation engine (Project Sentinel). It simulates a bank that exposes login and account endpoints over TLS, used for development and tests. See [docs/plan/zktls/IMPLEMENTATION.md](../docs/plan/zktls/IMPLEMENTATION.md) for the full plan.

## Prerequisites

- [Bun](https://bun.sh) (runtime and package manager)
- OpenSSL (for generating TLS certificates)

## Setup

From the **repository root**:

```bash
# Install dependencies
bun install

# Generate self-signed TLS certificates (required before first run)
bash mock-bank/certs/generate.sh
```

Certificates are written to `mock-bank/certs/server.key` and `mock-bank/certs/server.cert`. These files are gitignored.

## Running the server

From the repository root:

```bash
bun run bank:start
```

Or directly:

```bash
bun run mock-bank/server.ts
```

By default the server listens on **https://localhost:3443**. Use the `PORT` environment variable to change the port:

```bash
PORT=8443 bun run bank:start
```

Use `Ctrl+C` to stop the server.

## API Reference

All responses use `application/json`. TLS is required (HTTPS).

### POST `/auth/login`

Authenticates a user and returns a JWT.

| Aspect    | Details |
| --------- | ------- |
| Auth      | None    |
| Body      | JSON    |

**Request**

```json
{
  "username": "user_pass",
  "password": "sentinel123"
}
```

**Response (200 OK)**

```json
{
  "token": "eyJ...",
  "expires_in": 3600
}
```

**Error (401 Unauthorized)**

```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Username or password incorrect"
}
```

---

### GET `/account/balance`

Returns the current balance and account metadata for the authenticated user.

| Aspect | Details                    |
| ------ | -------------------------- |
| Auth   | Required: `Authorization: Bearer <token>` |

**Response (200 OK)**

```json
{
  "account_id": "ACC-001",
  "balance": 25000,
  "currency": "USD",
  "last_updated": "2026-02-18T12:00:00Z"
}
```

**Error (401)** — Missing or invalid JWT.

---

### GET `/account/transactions`

Returns transaction history for the last 4 months for the authenticated user.

| Aspect | Details                    |
| ------ | -------------------------- |
| Auth   | Required: `Authorization: Bearer <token>` |

**Response (200 OK)** — Array of transactions:

```json
[
  {
    "date": "2025-11-01",
    "amount": 100,
    "type": "credit",
    "description": "Deposit"
  },
  {
    "date": "2025-11-15",
    "amount": 50,
    "type": "debit",
    "description": "Transfer"
  }
]
```

Each `type` is either `"credit"` or `"debit"`.

**Error (401)** — Missing or invalid JWT.

---

## Test users

Data is read from `mock-bank/data/users.json`. Three users are predefined for testing attestation and verification flows:

| Username          | Password     | Purpose / profile                          |
| ----------------- | ------------ | ------------------------------------------- |
| `user_pass`       | `sentinel123`| Pass: sufficient balance and activity       |
| `FailBalance`     | `sentinel123`| Fails balance threshold checks              |
| `FailConsistency` | `sentinel123`| Fails consistency (activity) checks         |

All three share the same password. Use the JWT from `POST /auth/login` in the `Authorization` header for `/account/*` requests.

**Example (with TLS verification disabled for localhost):**

```bash
# Get token
TOKEN=$(curl -sk -X POST https://localhost:3443/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user_pass","password":"sentinel123"}' \
  | jq -r .token)

# Get balance
curl -sk -H "Authorization: Bearer $TOKEN" https://localhost:3443/account/balance
```

For more manual test commands, see **[CURL.md](./CURL.md)**.

## Running tests

From the repository root:

```bash
bun test
```

To run only mock-bank tests:

```bash
bun test mock-bank
```

Tests start the mock bank server on port 3443, run requests against it, and shut the server down afterward.

## Project layout

```
mock-bank/
├── README.md           # This file
├── server.ts           # HTTPS server entry point
├── certs/
│   ├── generate.sh    # Script to create server.key and server.cert
│   └── notary-key.ts  # Notary key pair (for future attestation/verifier use)
├── data/
│   └── users.json     # Static user and account data
├── routes/
│   ├── auth.ts        # POST /auth/login
│   └── account.ts     # GET /account/balance, GET /account/transactions
└── __tests__/
    ├── auth.test.ts   # Login tests
    └── account.test.ts # Balance and transactions tests
```

## Error format

All API errors use this shape (see IMPLEMENTATION.md §4):

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "details": {}
}
```
