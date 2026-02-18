/**
 * Verifier-adapter tests — invoke Rust verifier; parse output to DisclosedData.
 * (1) Stub returns success + JSON → adapter returns verified disclosed data.
 * (2) Verifier fails or invalid data → adapter throws.
 */
import { describe, test, expect } from "bun:test";
import { verifyPresentation } from "../verifier-adapter.js";

describe("verifier-adapter", () => {
  test("when verifier command returns success and valid JSON, returns disclosed data", async () => {
    // Use a stub script that echoes JSON to stdout and exits 0
    const stubScript = `
      const data = {
        balance: 2000,
        currency: "USD",
        account_id_hash: "h1",
        transactions_summary: { months: [{ month: "2026-01", tx_count: 5 }] }
      };
      console.log(JSON.stringify(data));
    `;
    const bin = process.execPath;
    const args = ["-e", stubScript];
    const result = await verifyPresentation(Buffer.from("fake-presentation"), {
      verifierCommand: bin,
      verifierArgs: args,
    });
    expect(result.balance).toBe(2000);
    expect(result.currency).toBe("USD");
    expect(result.transactions_summary.months).toHaveLength(1);
  });

  test("when verifier command exits non-zero, throws", async () => {
    const bin = process.execPath;
    const args = ["-e", "process.exit(1)"];
    await expect(
      verifyPresentation(Buffer.from("fake"), {
        verifierCommand: bin,
        verifierArgs: args,
      })
    ).rejects.toThrow();
  });

  test("when verifier outputs invalid JSON, throws", async () => {
    const bin = process.execPath;
    const args = ["-e", "console.log('not json')"];
    await expect(
      verifyPresentation(Buffer.from("fake"), {
        verifierCommand: bin,
        verifierArgs: args,
      })
    ).rejects.toThrow();
  });
});
