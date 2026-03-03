/**
 * ZK proof verifier tests.
 *
 * Uses pre-generated test fixtures from circuit/target/:
 *   - proof: valid proof for balance=2_000_000, threshold=1_000_000
 *   - vk:    verification key
 *
 * Run: REQUIRE_WEBHOOK=false bun test backend/src/verifier/__tests__/zkproof.test.ts
 */
import { describe, test, expect, beforeAll } from "bun:test";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { verifyBalanceProof } from "../zkproof.js";

const CIRCUIT_DIR = resolve(import.meta.dirname, "../../../../circuit/target");

// Test public inputs matching the fixture proof generated with:
//   balance = 2_000_000, blinder = [1..16], commitment = sha256(balance_le || blinder)
const FIXTURE_COMMITMENT = "4f191a8f64561e2420c09730eeefe76f523f6e3a021a4db2846f15e6e7907524";
const FIXTURE_THRESHOLD = 1_000_000;

let validProofHex: string;

beforeAll(() => {
  const proofPath = resolve(CIRCUIT_DIR, "proof");
  if (!existsSync(proofPath)) {
    throw new Error(
      `Test fixture not found: ${proofPath}\n` +
      `Run: cd circuit && nargo execute && bb prove -b target/balance_threshold.json -w target/balance_threshold.gz -o target/`
    );
  }
  validProofHex = readFileSync(proofPath).toString("hex");
});

describe("verifyBalanceProof", () => {
  test("valid proof passes verification", async () => {
    const result = await verifyBalanceProof(validProofHex, {
      commitment: FIXTURE_COMMITMENT,
      threshold: FIXTURE_THRESHOLD,
    });
    expect(result).toBe(true);
  }, 30_000);

  test("tampered proof bytes fail verification", async () => {
    // Flip a byte in the middle of the proof
    const bytes = Buffer.from(validProofHex, "hex");
    bytes[100] = bytes[100] ^ 0xff;
    const tamperedHex = bytes.toString("hex");

    const result = await verifyBalanceProof(tamperedHex, {
      commitment: FIXTURE_COMMITMENT,
      threshold: FIXTURE_THRESHOLD,
    });
    expect(result).toBe(false);
  }, 30_000);

  test("empty proof hex returns false", async () => {
    const result = await verifyBalanceProof("", {
      commitment: FIXTURE_COMMITMENT,
      threshold: FIXTURE_THRESHOLD,
    });
    expect(result).toBe(false);
  }, 10_000);
});
