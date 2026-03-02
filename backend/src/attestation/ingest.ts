/**
 * Ingest — IMPLEMENTATION.md §3.3.
 * Accept presentation + user_address; verify via adapter; build attestation; bind; save.
 */
import type { Attestation, DisclosedData, JsPresentation, TlsnWebhookPayload, ProofOrigin } from "../types.js";
import { getNotaryPubKey, getNotaryPrivKey } from "../config.js";
import { buildPayload } from "../verifier/signature.js";
import { verifyPresentation } from "./verifier-adapter.js";
import { disclosedDataFromJsPresentation, disclosedDataFromBancolombiaPresentation, disclosedDataFromMockZkp } from "./presentation-from-results.js";
import { bindUserAddress } from "./bind.js";
import { saveAttestation, generateAttestationId } from "./storage.js";
import EC from "elliptic";
import { createHash } from "crypto";

export interface IngestOptions {
  /** Test double: resolve with disclosed data instead of running verifier. */
  mockVerify?: (presentation: Buffer) => Promise<DisclosedData>;
}

function signPayload(att: Attestation, privKeyHex: string): string {
  const ec = new EC.ec("secp256k1");
  const key = ec.keyFromPrivate(privKeyHex, "hex");
  const payload = buildPayload(att);
  const msgHash = createHash("sha256").update(payload, "utf8").digest();
  const sig = key.sign(msgHash);
  return sig.r.toString("hex").padStart(64, "0") + sig.s.toString("hex").padStart(64, "0");
}

function buildAttestation(disclosed_data: DisclosedData, user_address: string): Attestation {
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
  att.notary.signature = "";
  return att;
}

/**
 * Build ProofOrigin from TLSNotary webhook payload.
 * Computes transcript_hash from the canonical transcript descriptor.
 */
export function buildProofOrigin(webhook: TlsnWebhookPayload): ProofOrigin {
  const recvBuf = Buffer.from(webhook.transcript.recv);
  const recvSha256 = createHash("sha256").update(recvBuf).digest("hex");
  const descriptor = JSON.stringify({
    sent_length: webhook.transcript.sent_length,
    recv_length: webhook.transcript.recv_length,
    recv_sha256: recvSha256,
  });
  const transcript_hash = createHash("sha256").update(descriptor, "utf8").digest("hex");
  return {
    server_name: webhook.server_name,
    session_id: webhook.session.id,
    transcript_hash,
  };
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
  const att = buildAttestation(disclosed_data, user_address);
  att.notary.signature = signPayload(att, getNotaryPrivKey());
  await saveAttestation(att);
  return att;
}

/**
 * Ingest from JS plugin presentation (prove() results).
 * Maps results to DisclosedData and saves attestation.
 * Optionally binds webhook payload to create proof_origin.
 */
export async function ingestFromJsPresentation(
  presentation: JsPresentation,
  user_address: string,
  webhook?: TlsnWebhookPayload
): Promise<Attestation> {
  const disclosed_data =
    presentation.mockZkp
      ? disclosedDataFromMockZkp(presentation.mockZkp)
      : presentation.bank === 'bancolombia'
        ? disclosedDataFromBancolombiaPresentation(presentation)
        : disclosedDataFromJsPresentation(presentation);
  const att = buildAttestation(disclosed_data, user_address);
  if (webhook) {
    att.proof_origin = buildProofOrigin(webhook);
  }
  att.notary.signature = signPayload(att, getNotaryPrivKey());
  await saveAttestation(att);
  return att;
}
