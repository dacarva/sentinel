# Mock Bank — cURL manual testing

Use these commands to hit the mock bank API by hand. Run the server first: `bun run bank:start` (from repo root).

**Base URL:** `https://localhost:3443`  
**Options:** `-s` (silent), `-k` (allow self-signed cert), `-X` method, `-H` headers, `-d` body.

---

## 1. Login (get JWT)

**Valid credentials**

```bash
curl -sk -X POST https://localhost:3443/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user_pass","password":"sentinel123"}'
```

Expected: `200` with `{"token":"eyJ...","expires_in":3600}`.

**Invalid password (expect 401)**

```bash
curl -sk -X POST https://localhost:3443/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user_pass","password":"wrong"}'
```

Expected: `401` with `{"error":"INVALID_CREDENTIALS","message":"Username or password incorrect"}`.

---

## 2. Save token and call account endpoints

**Get a token into a variable**

```bash
TOKEN=$(curl -sk -X POST https://localhost:3443/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user_pass","password":"sentinel123"}' \
  | jq -r .token)
```

(If you don’t have `jq`, use the raw JSON and copy the `token` value into `TOKEN`.)

**Balance**

```bash
curl -sk -H "Authorization: Bearer $TOKEN" https://localhost:3443/account/balance
```

Expected: `200` with `account_id`, `balance`, `currency`, `last_updated`.

**Transactions**

```bash
curl -sk -H "Authorization: Bearer $TOKEN" https://localhost:3443/account/transactions
```

Expected: `200` with a JSON array of `{ date, amount, type, description }`.

---

## 3. Auth errors (no or bad token)

**No Authorization header**

```bash
curl -sk https://localhost:3443/account/balance
```

Expected: `401`.

**Invalid token**

```bash
curl -sk -H "Authorization: Bearer invalid.jwt.here" https://localhost:3443/account/balance
```

Expected: `401`.

---

## 4. Other test users

Same password for all: `sentinel123`.

| User             | Use case        |
|------------------|-----------------|
| `user_pass`      | Normal flow     |
| `FailBalance`    | Low balance     |
| `FailConsistency`| Low activity    |

Example for `FailBalance`:

```bash
TOKEN=$(curl -sk -X POST https://localhost:3443/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"FailBalance","password":"sentinel123"}' \
  | jq -r .token)
curl -sk -H "Authorization: Bearer $TOKEN" https://localhost:3443/account/balance
```

---

## 5. One-liner flow (login → balance → transactions)

```bash
TOKEN=$(curl -sk -X POST https://localhost:3443/auth/login -H "Content-Type: application/json" -d '{"username":"user_pass","password":"sentinel123"}' | jq -r .token) && \
echo "=== Balance ===" && curl -sk -H "Authorization: Bearer $TOKEN" https://localhost:3443/account/balance | jq && \
echo "=== Transactions ===" && curl -sk -H "Authorization: Bearer $TOKEN" https://localhost:3443/account/transactions | jq
```

Requires `jq`. Without `jq`, drop the `| jq` parts to see raw JSON.
