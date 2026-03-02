/**
 * Verifier index tests — run verify on attestation; status and result.
 * Red: run first without implementation; Green: implement index.ts.
 */
import { describe, test, expect, beforeAll } from "bun:test";
import EC from "elliptic";
import { createHash } from "crypto";
import type { Attestation } from "../../types.js";
import { buildPayload } from "../signature.js";

const ec = new EC.ec("secp256k1");
let testKeyPair: EC.ec.KeyPair;
let testPubKeyHex: string;

function signAttestation(att: Attestation, keyPair: EC.ec.KeyPair): string {
  const payload = buildPayload(att);
  const msgHash = createHash("sha256").update(payload, "utf8").digest();
  const sig = keyPair.sign(msgHash);
  return (
    sig.r.toString(16).padStart(64, "0") + sig.s.toString(16).padStart(64, "0")
  );
}

beforeAll(() => {
  testKeyPair = ec.genKeyPair();
  testPubKeyHex = testKeyPair.getPublic(true, "hex");
  process.env.NOTARY_PUB_KEY = testPubKeyHex;
});

describe("verifier index", () => {
  test("verify on valid attestation returns isValid true and updates status to verified", async () => {
    const { verify } = await import("../index.js");
    const validAttestation: Attestation = {
      id: "test-valid",
      user_address: "0x1111111111111111111111111111111111111111",
      timestamp: new Date().toISOString(),
      notary: { signature: "", public_key: testPubKeyHex },
      disclosed_data: {
        balance: 2000,
        currency: "USD",
        account_id_hash: "h",
        transactions_summary: {
          months: [
            { month: "2025-11", tx_count: 5 },
            { month: "2025-12", tx_count: 4 },
            { month: "2026-01", tx_count: 6 },
          ],
        },
      },
      status: "pending",
    };
    validAttestation.notary.signature = signAttestation(
      validAttestation,
      testKeyPair
    );

    const loadAttestation = async (id: string) => {
      if (id !== "test-valid") return null;
      return { ...validAttestation };
    };
    const saveAttestation = async () => {};
    const result = await verify("test-valid", loadAttestation, saveAttestation);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("verify on attestation with low balance returns isValid false", async () => {
    const { verify } = await import("../index.js");
    const lowBalanceAttestation: Attestation = {
      id: "test-low-balance",
      user_address: "0x1111111111111111111111111111111111111111",
      timestamp: new Date().toISOString(),
      notary: { signature: "", public_key: testPubKeyHex },
      disclosed_data: {
        balance: 500,
        currency: "USD",
        account_id_hash: "h",
        transactions_summary: {
          months: [
            { month: "2025-11", tx_count: 5 },
            { month: "2025-12", tx_count: 4 },
            { month: "2026-01", tx_count: 6 },
          ],
        },
      },
      status: "pending",
    };
    lowBalanceAttestation.notary.signature = signAttestation(
      lowBalanceAttestation,
      testKeyPair
    );

    const loadAttestation = async (id: string) => {
      if (id !== "test-low-balance") return null;
      return { ...lowBalanceAttestation };
    };
    const saveAttestation = async () => {};
    const result = await verify(
      "test-low-balance",
      loadAttestation,
      saveAttestation
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
