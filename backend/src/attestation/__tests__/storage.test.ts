/**
 * Storage tests — save and load attestation; 404 on missing id.
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import type { Attestation } from "../../types.js";
import { saveAttestation, loadAttestation } from "../storage.js";

let dataDir: string;

beforeAll(() => {
  dataDir = mkdtempSync(join(tmpdir(), "sentinel-storage-"));
  process.env.DATA_DIR = dataDir;
});

afterAll(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

describe("storage", () => {
  test("save then load returns same data", async () => {
    const att: Attestation = {
      id: "test-id-1",
      user_address: "0x1111111111111111111111111111111111111111",
      timestamp: new Date().toISOString(),
      notary: { signature: "sig", public_key: "pk" },
      disclosed_data: {
        balance: 1000,
        currency: "USD",
        account_id_hash: "h",
        transactions_summary: { months: [] },
      },
      status: "pending",
    };
    await saveAttestation(att);
    const loaded = await loadAttestation("test-id-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe(att.id);
    expect(loaded!.user_address).toBe(att.user_address);
    expect(loaded!.disclosed_data.balance).toBe(1000);
  });

  test("load non-existent id returns null", async () => {
    const loaded = await loadAttestation("non-existent-id");
    expect(loaded).toBeNull();
  });
});
