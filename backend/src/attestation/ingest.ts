/**
 * Ingest — IMPLEMENTATION.md §3.3.
 * Accept presentation + user_address; verify via adapter; build attestation; bind; save.
 */
import type { Attestation, DisclosedData, ZkDisclosedData, JsPresentation, JsPresentationWithZk, TlsnWebhookPayload, ProofOrigin } from "../types.js";
import { getNotaryPubKey, getNotaryPrivKey } from "../config.js";
import { buildPayload } from "../verifier/signature.js";
import { verifyPresentation } from "./verifier-adapter.js";
import { disclosedDataFromJsPresentation, disclosedDataFromBancolombiaPresentation } from "./presentation-from-results.js";
import { bindUserAddress } from "./bind.js";
import { saveAttestation, generateAttestationId } from "./storage.js";
import { verifyBalanceProof } from "../verifier/zkproof.js";
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

function buildAttestation(
  disclosed_data: DisclosedData | ZkDisclosedData,
  user_address: string,
  proof_type?: "v2_reveal" | "v3_zk"
): Attestation {
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
    proof_type,
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
    presentation.bank === 'bancolombia'
      ? disclosedDataFromBancolombiaPresentation(presentation)
      : disclosedDataFromJsPresentation(presentation);
  const att = buildAttestation(disclosed_data, user_address, "v2_reveal");
  if (webhook) {
    att.proof_origin = buildProofOrigin(webhook);
  }
  att.notary.signature = signPayload(att, getNotaryPrivKey());
  await saveAttestation(att);
  return att;
}

/**
 * Ingest a v3 ZK presentation.
 * Verifies the Noir balance proof, stores commitment + proof — never the raw balance.
 * Optionally binds webhook payload for TLS session provenance.
 */
export async function ingestZkPresentation(
  presentation: JsPresentationWithZk,
  user_address: string,
  webhook?: TlsnWebhookPayload
): Promise<Attestation> {
  const { zkProof } = presentation;

  // Verify the Noir proof before storing anything
  const proofValid = await verifyBalanceProof(zkProof.proof, zkProof.publicInputs);
  if (!proofValid) {
    throw new Error("ZK balance proof verification failed");
  }

  // Extract still-revealed fields (currency + account_id_hash) from the TLS results.
  // These are non-sensitive and remain in the attestation for identity binding.
  let currency = "COP";
  let account_id_hash = createHash("sha256").update("").digest("hex");
  try {
    const revealedData =
      presentation.bank === "bancolombia"
        ? disclosedDataFromBancolombiaPresentation(presentation)
        : disclosedDataFromJsPresentation(presentation);
    currency = revealedData.currency;
    account_id_hash = revealedData.account_id_hash;
  } catch {
    // If extraction fails (e.g. balance missing), currency/account_id_hash stay as defaults.
    // The ZK proof itself provides the balance guarantee.
  }

  const disclosed_data: ZkDisclosedData = {
    commitment: zkProof.publicInputs.commitment,
    threshold: zkProof.publicInputs.threshold,
    currency,
    account_id_hash,
    balance_proof: zkProof.proof,
  };

  const att = buildAttestation(disclosed_data, user_address, "v3_zk");
  if (webhook) {
    att.proof_origin = buildProofOrigin(webhook);
  }
  att.notary.signature = signPayload(att, getNotaryPrivKey());
  await saveAttestation(att);
  return att;
}
