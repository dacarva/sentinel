/**
 * Notary signature verification — IMPLEMENTATION.md §3.4.
 * Verifies notary.signature with elliptic secp256k1 against canonical payload.
 */
import type { Attestation } from "../types.js";
import EC from "elliptic";
import { createHash } from "crypto";

const ec = new EC.ec("secp256k1");

/** Canonical payload that was signed (must match prover/notary side). */
export function buildPayload(att: Attestation): string {
  return JSON.stringify({
    id: att.id,
    user_address: att.user_address,
    timestamp: att.timestamp,
    disclosed_data: att.disclosed_data,
  });
}

function hashPayload(payload: string): Buffer {
  return createHash("sha256").update(payload, "utf8").digest();
}

/**
 * Verify attestation's notary signature using the given public key hex.
 * Returns true if valid, false if tampered or invalid.
 */
export function verifySignature(
  attestation: Attestation,
  publicKeyHex: string
): boolean {
  const payload = buildPayload(attestation);
  const msgHash = hashPayload(payload);
  const key = ec.keyFromPublic(publicKeyHex, "hex");
  const sigHex = attestation.notary.signature;
  if (!sigHex || sigHex.length !== 128) return false;
  const r = sigHex.slice(0, 64);
  const s = sigHex.slice(64, 128);
  try {
    return key.verify(msgHash, { r, s });
  } catch {
    return false;
  }
}
