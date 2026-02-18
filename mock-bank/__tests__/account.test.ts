/**
 * Account route tests — IMPLEMENTATION.md §1 Mock Bank API.
 * GET /account/balance and GET /account/transactions require JWT.
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const BASE = "https://localhost:3443";
let server: { stop: () => void } | null = null;
let validToken: string = "";

beforeAll(async () => {
  const { startMockBank } = await import("../server");
  server = await startMockBank(3443);
  const login = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "user_pass", password: "sentinel123" }),
    // @ts-expect-error Bun fetch allows tls
    tls: { rejectUnauthorized: false },
  });
  const data = (await login.json()) as { token?: string };
  validToken = data.token!;
});

afterAll(() => {
  if (server) server.stop();
});

const tls = { rejectUnauthorized: false } as const;

describe("GET /account/balance", () => {
  test("with valid JWT returns 200 and balance object", async () => {
    const res = await fetch(`${BASE}/account/balance`, {
      headers: { Authorization: `Bearer ${validToken}` },
      // @ts-expect-error Bun fetch allows tls
      tls,
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      account_id?: string;
      balance?: number;
      currency?: string;
      last_updated?: string;
    };
    expect(body.account_id).toBeDefined();
    expect(typeof body.balance).toBe("number");
    expect(body.currency).toBe("USD");
    expect(body.last_updated).toBeDefined();
  });

  test("without Authorization returns 401", async () => {
    const res = await fetch(`${BASE}/account/balance`, {
      // @ts-expect-error Bun fetch allows tls
      tls,
    });
    expect(res.status).toBe(401);
  });
});

describe("GET /account/transactions", () => {
  test("with valid JWT returns 200 and transaction list", async () => {
    const res = await fetch(`${BASE}/account/transactions`, {
      headers: { Authorization: `Bearer ${validToken}` },
      // @ts-expect-error Bun fetch allows tls
      tls,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    body.forEach((tx: { date?: string; amount?: number; type?: string; description?: string }) => {
      expect(tx.date).toBeDefined();
      expect(typeof tx.amount).toBe("number");
      expect(["credit", "debit"]).toContain(tx.type);
      expect(tx.description).toBeDefined();
    });
  });

  test("without Authorization returns 401", async () => {
    const res = await fetch(`${BASE}/account/transactions`, {
      // @ts-expect-error Bun fetch allows tls
      tls,
    });
    expect(res.status).toBe(401);
  });
});
