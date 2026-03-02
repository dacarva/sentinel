/**
 * Auth tests — IMPLEMENTATION.md §6 Testing Matrix.
 * - Valid Login: user_pass, sentinel123 → JWT Token + 200 OK
 * - Bad Password: user_pass, wrong → 401 Unauthorized
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const BASE = "https://localhost:3443";
let server: { stop: () => void } | null = null;

beforeAll(async () => {
  const { startMockBank } = await import("../server");
  server = await startMockBank(3443);
});

afterAll(() => {
  if (server) server.stop();
});

describe("Auth", () => {
  test("Valid Login returns JWT and 200 OK", async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "user_pass",
        password: "sentinel123",
      }),
      // @ts-expect-error Bun fetch allows tls
      tls: { rejectUnauthorized: false },
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { token?: string; expires_in?: number };
    expect(data.token).toBeDefined();
    expect(typeof data.token).toBe("string");
    expect(data.token!.length).toBeGreaterThan(10);
    expect(data.expires_in).toBe(3600);
  });

  test("Bad Password returns 401 Unauthorized", async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "user_pass",
        password: "wrong",
      }),
      // @ts-expect-error Bun fetch allows tls
      tls: { rejectUnauthorized: false },
    });
    expect(res.status).toBe(401);
    const data = (await res.json()) as { error?: string; message?: string };
    expect(data.error).toBe("INVALID_CREDENTIALS");
    expect(data.message?.toLowerCase()).toMatch(/username or password/);
  });
});
