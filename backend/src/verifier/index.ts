/**
 * Verifier index — IMPLEMENTATION.md §3.4.
 * Load attestation, run signature → balance → consistency; update status and persist.
 */
import type { Attestation, VerificationResult } from "../types.js";
import { getVerificationConfig, getNotaryPubKey } from "../config.js";
import { verifySignature } from "./signature.js";
import { checkBalance } from "./balance.js";
import { checkConsistency } from "./consistency.js";

export type LoadAttestation = (id: string) => Promise<Attestation | null>;
export type SaveAttestation = (att: Attestation) => Promise<void>;

export async function verify(
  id: string,
  loadAttestation: LoadAttestation,
  saveAttestation: SaveAttestation
): Promise<VerificationResult> {
  const att = await loadAttestation(id);
  if (!att) {
    return {
      isValid: false,
      errors: ["Attestation not found"],
      timestamp: new Date().toISOString(),
    };
  }

  const config = getVerificationConfig();
  const notaryPubKey = getNotaryPubKey();
  const errors: string[] = [];

  if (!verifySignature(att, notaryPubKey)) {
    errors.push("Invalid notary signature");
  }

  if (att.proof_type === "v3_zk") {
    // ZK attestation: balance proof was verified at ingest time.
    // Skip arithmetic balance/consistency checks — the ZK proof is the guarantee.
  } else {
    try {
      checkBalance(att.disclosed_data as import("../types.js").DisclosedData, config);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
    try {
      checkConsistency(att.disclosed_data as import("../types.js").DisclosedData, config);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  const isValid = errors.length === 0;
  att.status = isValid ? "verified" : "failed";
  att.errors = errors.length ? errors : undefined;
  await saveAttestation(att);

  return {
    isValid,
    errors,
    timestamp: new Date().toISOString(),
  };
}
