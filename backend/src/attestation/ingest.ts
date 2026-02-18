/**
 * Ingest — IMPLEMENTATION.md §3.3.
 * Accept presentation + user_address; verify via adapter; build attestation; bind; save.
 */
import type { Attestation, DisclosedData } from "../types.js";
import { getNotaryPubKey } from "../config.js";
import { verifyPresentation } from "./verifier-adapter.js";
import { bindUserAddress } from "./bind.js";
import { saveAttestation, generateAttestationId } from "./storage.js";

export interface IngestOptions {
  /** Test double: resolve with disclosed data instead of running verifier. */
  mockVerify?: (presentation: Buffer) => Promise<DisclosedData>;
}

export async function ingest(
  presentation: Buffer,
  user_address: string,
  options: IngestOptions = {}
): Promise<Attestation> {
  let disclosed_data: DisclosedData;
  if (options.mockVerify) {
    disclosed_data = await options.mockVerify(presentation);
  } else {
    disclosed_data = await verifyPresentation(presentation);
  }

  const id = generateAttestationId();
  const timestamp = new Date().toISOString();
  const notaryPubKey = getNotaryPubKey();
  const att: Attestation = {
    id,
    user_address: "",
    timestamp,
    notary: {
      signature: "",
      public_key: notaryPubKey,
    },
    disclosed_data,
    status: "pending",
  };
  bindUserAddress(att, user_address);
  await saveAttestation(att);
  return att;
}
