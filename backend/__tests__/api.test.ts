/**
 * Sentinel API integration tests — POST /attest, GET /attest/:id, POST /verify/:id.
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import type { DisclosedData } from "../src/types.js";

const BASE = "http://localhost:3000";
let server: { stop: () => void } | null = null;
let dataDir: string;

beforeAll(async () => {
  dataDir = mkdtempSync(join(tmpdir(), "sentinel-api-"));
  process.env.DATA_DIR = dataDir;
  // Disable webhook requirement so JS presentation tests don't depend on a running TLSNotary verifier.
  process.env.REQUIRE_WEBHOOK = "false";
  const { startServer } = await import("../src/server.js");
  server = await startServer(3000);
});

afterAll(() => {
  if (server) server.stop();
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
});

describe("Sentinel API", () => {
  test("POST /attest with valid user_address + presentation (test double) returns 201 with attestation_id and status", async () => {
    const res = await fetch(`${BASE}/attest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_address: "0x1111111111111111111111111111111111111111",
        presentation: Buffer.from("test-double").toString("base64"),
        _mockDisclosed: {
          balance: 2000,
          currency: "USD",
          account_id_hash: "h",
          transactions_summary: { months: [{ month: "2026-01", tx_count: 5 }] },
        } as DisclosedData,
      }),
    });
    expect(res.status).toBe(201);
    const data = (await res.json()) as { attestation_id?: string; status?: string };
    expect(data.attestation_id).toBeDefined();
    expect(data.status).toBe("pending");
  });

  test("GET /attest/:id returns 200 with attestation", async () => {
    const createRes = await fetch(`${BASE}/attest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_address: "0x2222222222222222222222222222222222222222",
        presentation: Buffer.from("get-test").toString("base64"),
        _mockDisclosed: {
          balance: 3000,
          currency: "USD",
          account_id_hash: "h2",
          transactions_summary: { months: [] },
        } as DisclosedData,
      }),
    });
    const createData = (await createRes.json()) as { attestation_id: string };
    const id = createData.attestation_id;
    const getRes = await fetch(`${BASE}/attest/${id}`);
    expect(getRes.status).toBe(200);
    const att = (await getRes.json()) as { id: string; user_address: string };
    expect(att.id).toBe(id);
    expect(att.user_address).toBe("0x2222222222222222222222222222222222222222");
  });

  test("GET /attest/:id with non-existent id returns 404", async () => {
    const res = await fetch(`${BASE}/attest/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });

  test("POST /verify/:id returns 200 with VerificationResult", async () => {
    const createRes = await fetch(`${BASE}/attest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_address: "0x3333333333333333333333333333333333333333",
        presentation: Buffer.from("verify-test").toString("base64"),
        _mockDisclosed: {
          balance: 500,
          currency: "USD",
          account_id_hash: "h3",
          transactions_summary: { months: [] },
        } as DisclosedData,
      }),
    });
    const createData = (await createRes.json()) as { attestation_id: string };
    const verifyRes = await fetch(`${BASE}/verify/${createData.attestation_id}`, {
      method: "POST",
    });
    expect(verifyRes.status).toBe(200);
    const result = (await verifyRes.json()) as { isValid: boolean; errors: string[] };
    expect(typeof result.isValid).toBe("boolean");
    expect(Array.isArray(result.errors)).toBe(true);
  });

  test("POST /attest with missing user_address returns 400 and error shape", async () => {
    const res = await fetch(`${BASE}/attest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presentation: "YQ==" }),
    });
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error?: string; message?: string };
    expect(data.error).toBeDefined();
    expect(data.message).toBeDefined();
  });

  test("POST /attest with missing presentation returns 400", async () => {
    const res = await fetch(`${BASE}/attest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_address: "0x1111111111111111111111111111111111111111" }),
    });
    expect(res.status).toBe(400);
  });

  test("POST /attest with JS presentation (results) returns 201", async () => {
    const res = await fetch(`${BASE}/attest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_address: "0x4444444444444444444444444444444444444444",
        presentation: {
          results: [
            { type: "RECV", part: "BODY", action: "REVEAL", params: { path: "balance" }, value: "10000" },
            { type: "RECV", part: "BODY", action: "REVEAL", params: { path: "currency" }, value: "USD" },
          ],
        },
      }),
    });
    expect(res.status).toBe(201);
    const data = (await res.json()) as { attestation_id?: string; status?: string };
    expect(data.attestation_id).toBeDefined();
    expect(data.status).toBe("pending");
  });
});
