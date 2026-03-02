/**
 * Signature verifier tests — IMPLEMENTATION.md §6.
 * (1) Attestation signed with known notary key → verify returns true.
 * (2) Tampered payload (e.g. balance changed) → verify returns false.
 */
import { describe, test, expect } from "bun:test";
import { verifySignature, buildPayload } from "../signature.js";
import type { Attestation } from "../../types.js";
import EC from "elliptic";
import { createHash } from "crypto";

const ec = new EC.ec("secp256k1");

function hashPayload(payload: string): Buffer {
  return createHash("sha256").update(payload, "utf8").digest();
}

describe("signature verifier", () => {
  test("attestation signed with known notary key returns true", () => {
    const keyPair = ec.genKeyPair();
    const pubKeyHex = keyPair.getPublic(true, "hex"); // compressed

    const attestation: Attestation = {
      id: "test-id",
      user_address: "0x1111111111111111111111111111111111111111",
      timestamp: new Date().toISOString(),
      notary: { signature: "", public_key: pubKeyHex },
      disclosed_data: {
        balance: 2000,
        currency: "USD",
        account_id_hash: "h",
        transactions_summary: { months: [] },
      },
      status: "pending",
    };
    const payload = buildPayload(attestation);
    const msgHash = hashPayload(payload);
    const sig = keyPair.sign(msgHash);
    const sigHex =
      sig.r.toString(16, 64).padStart(64, "0") +
      sig.s.toString(16, 64).padStart(64, "0");
    attestation.notary.signature = sigHex;

    expect(verifySignature(attestation, pubKeyHex)).toBe(true);
  });

  test("tampered data (balance changed) returns false", () => {
    const keyPair = ec.genKeyPair();
    const pubKeyHex = keyPair.getPublic(true, "hex");

    const attestation: Attestation = {
      id: "test-id",
      user_address: "0x1111111111111111111111111111111111111111",
      timestamp: new Date().toISOString(),
      notary: { signature: "", public_key: pubKeyHex },
      disclosed_data: {
        balance: 2000,
        currency: "USD",
        account_id_hash: "h",
        transactions_summary: { months: [] },
      },
      status: "pending",
    };
    const payload = buildPayload(attestation);
    const msgHash = hashPayload(payload);
    const sig = keyPair.sign(msgHash);
    const sigHex =
      sig.r.toString(16, 64).padStart(64, "0") +
      sig.s.toString(16, 64).padStart(64, "0");
    attestation.notary.signature = sigHex;

    attestation.disclosed_data.balance = 9999; // tamper
    expect(verifySignature(attestation, pubKeyHex)).toBe(false);
  });

  test("attestation with proof_origin — signature covers TLS binding", () => {
    const keyPair = ec.genKeyPair();
    const pubKeyHex = keyPair.getPublic(true, "hex");

    const attestation: Attestation = {
      id: "test-id-with-tls",
      user_address: "0x1111111111111111111111111111111111111111",
      timestamp: new Date().toISOString(),
      notary: { signature: "", public_key: pubKeyHex },
      disclosed_data: {
        balance: 2000,
        currency: "USD",
        account_id_hash: "h",
        transactions_summary: { months: [] },
      },
      proof_origin: {
        server_name: "test.com",
        session_id: "sess-123",
        transcript_hash: "a".repeat(64),
      },
      status: "pending",
    };
    const payload = buildPayload(attestation);
    const msgHash = hashPayload(payload);
    const sig = keyPair.sign(msgHash);
    const sigHex =
      sig.r.toString(16, 64).padStart(64, "0") +
      sig.s.toString(16, 64).padStart(64, "0");
    attestation.notary.signature = sigHex;

    // Signature should verify with proof_origin present
    expect(verifySignature(attestation, pubKeyHex)).toBe(true);

    // Tampering proof_origin should fail verification
    attestation.proof_origin.server_name = "evil.com";
    expect(verifySignature(attestation, pubKeyHex)).toBe(false);
  });
});
