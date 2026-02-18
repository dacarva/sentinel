/**
 * Ingest tests — accept presentation + user_address; verify via adapter; build attestation; bind; save.
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import type { DisclosedData } from "../../types.js";
import { ingest } from "../ingest.js";

let dataDir: string;

beforeAll(() => {
  dataDir = mkdtempSync(join(tmpdir(), "sentinel-ingest-"));
  process.env.DATA_DIR = dataDir;
});

afterAll(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

describe("ingest", () => {
  test("valid user_address + mock verifier returning valid data → 201-style attestation stored with bound user_address", async () => {
    const disclosedData: DisclosedData = {
      balance: 2000,
      currency: "USD",
      account_id_hash: "h",
      transactions_summary: { months: [{ month: "2026-01", tx_count: 5 }] },
    };
    const att = await ingest(Buffer.from("fake-presentation"), "0x1111111111111111111111111111111111111111", {
      mockVerify: async () => disclosedData,
    });
    expect(att.id).toBeDefined();
    expect(att.user_address).toBe("0x1111111111111111111111111111111111111111");
    expect(att.status).toBe("pending");
    expect(att.disclosed_data.balance).toBe(2000);
  });

  test("invalid user_address throws", async () => {
    const disclosedData: DisclosedData = {
      balance: 2000,
      currency: "USD",
      account_id_hash: "h",
      transactions_summary: { months: [] },
    };
    await expect(
      ingest(Buffer.from("fake"), "bad-address", {
        mockVerify: async () => disclosedData,
      })
    ).rejects.toThrow();
  });

  test("verifier failure throws", async () => {
    await expect(
      ingest(Buffer.from("fake"), "0x1111111111111111111111111111111111111111", {
        mockVerify: async () => {
          throw new Error("Verification failed");
        },
      })
    ).rejects.toThrow();
  });
});
