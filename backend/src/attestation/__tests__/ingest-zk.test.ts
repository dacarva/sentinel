/**
 * Integration tests for ingestZkPresentation.
 *
 * Uses a pre-generated proof fixture. Verifies that:
 * - A valid ZK presentation is stored as an attestation with no raw balance.
 * - An invalid ZK proof is rejected.
 */
import { describe, test, expect, beforeAll, afterAll, mock } from "bun:test";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { tmpdir } from "os";
import type { JsPresentationWithZk, TlsnWebhookPayload } from "../../types.js";
import { ingestZkPresentation } from "../ingest.js";

let dataDir: string;

beforeAll(() => {
  dataDir = mkdtempSync(join(tmpdir(), "sentinel-zkingest-"));
  process.env.DATA_DIR = dataDir;
});

afterAll(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

const CIRCUIT_DIR = resolve(import.meta.dirname, "../../../../circuit/target");

const FIXTURE_COMMITMENT = "4f191a8f64561e2420c09730eeefe76f523f6e3a021a4db2846f15e6e7907524";
const FIXTURE_THRESHOLD = 1_000_000;

function getValidProofHex(): string {
  const proofPath = resolve(CIRCUIT_DIR, "proof");
  if (!existsSync(proofPath)) {
    throw new Error(`Proof fixture not found: ${proofPath}`);
  }
  return readFileSync(proofPath).toString("hex");
}

const SAMPLE_RESULTS = [
  { type: "RECV", part: "BODY", action: "REVEAL",
    params: { type: "json", path: "data.accounts[0].currency" }, value: "COP" },
  { type: "RECV", part: "BODY", action: "REVEAL",
    params: { type: "json", path: "data.accounts[0].number" }, value: "1234567890" },
];

const USER_ADDRESS = "0x1111111111111111111111111111111111111111";

describe("ingestZkPresentation", () => {
  test("valid ZK presentation stores attestation without raw balance", async () => {
    const proofHex = getValidProofHex();
    const presentation: JsPresentationWithZk = {
      results: SAMPLE_RESULTS,
      bank: "bancolombia",
      zkProof: {
        proof: proofHex,
        publicInputs: {
          commitment: FIXTURE_COMMITMENT,
          threshold: FIXTURE_THRESHOLD,
        },
      },
    };

    const att = await ingestZkPresentation(presentation, USER_ADDRESS);

    expect(att.id).toBeDefined();
    expect(att.user_address).toBe(USER_ADDRESS);
    expect(att.proof_type).toBe("v3_zk");
    expect(att.status).toBe("pending");

    // Must NOT contain raw balance
    expect((att.disclosed_data as any).balance).toBeUndefined();

    // Must contain ZK fields
    const zk = att.disclosed_data as any;
    expect(zk.commitment).toBe(FIXTURE_COMMITMENT);
    expect(zk.threshold).toBe(FIXTURE_THRESHOLD);
    expect(zk.balance_proof).toBe(proofHex);
    expect(zk.currency).toBe("COP");
    expect(zk.account_id_hash).toBeDefined();
  }, 30_000);

  test("valid ZK presentation with webhook populates proof_origin", async () => {
    const proofHex = getValidProofHex();
    const presentation: JsPresentationWithZk = {
      results: SAMPLE_RESULTS,
      bank: "bancolombia",
      zkProof: {
        proof: proofHex,
        publicInputs: { commitment: FIXTURE_COMMITMENT, threshold: FIXTURE_THRESHOLD },
      },
    };
    const webhook: TlsnWebhookPayload = {
      server_name: "canalpersonas-ext.apps.bancolombia.com",
      results: [],
      session: { id: "sess-zk-test" },
      transcript: {
        sent: [1, 2, 3], recv: [4, 5, 6],
        sent_length: 3, recv_length: 3,
      },
    };

    const att = await ingestZkPresentation(presentation, USER_ADDRESS, webhook);

    expect(att.proof_origin).toBeDefined();
    expect(att.proof_origin?.server_name).toBe("canalpersonas-ext.apps.bancolombia.com");
    expect(att.proof_origin?.session_id).toBe("sess-zk-test");
  }, 30_000);

  test("invalid ZK proof throws", async () => {
    const presentation: JsPresentationWithZk = {
      results: SAMPLE_RESULTS,
      bank: "bancolombia",
      zkProof: {
        proof: "deadbeef", // invalid proof
        publicInputs: { commitment: FIXTURE_COMMITMENT, threshold: FIXTURE_THRESHOLD },
      },
    };

    await expect(
      ingestZkPresentation(presentation, USER_ADDRESS)
    ).rejects.toThrow("ZK balance proof verification failed");
  }, 15_000);
});
