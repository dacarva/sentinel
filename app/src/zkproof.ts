/**
 * Browser-side ZK proof generation for the balance threshold circuit.
 *
 * Uses @noir-lang/noir_js (witness generation) + @aztec/bb.js (UltraHonk proving)
 * to generate a proof that balance > threshold without revealing the balance.
 *
 * Commitment scheme: sha256(balance_le_bytes || blinder)
 * where balance_le_bytes is the 8-byte little-endian encoding of floor(balance).
 */
import { Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend } from '@aztec/bb.js';

export interface ZkProofPayload {
  proof: string;
  publicInputs: {
    commitment: string;
    threshold: number;
  };
}

/** sha256(balance_le_bytes || blinder) using Web Crypto API. */
async function computeCommitment(balance: bigint, blinder: Uint8Array): Promise<Uint8Array> {
  const preimage = new Uint8Array(24);
  for (let i = 0; i < 8; i++) {
    preimage[i] = Number((balance >> BigInt(i * 8)) & 0xffn);
  }
  preimage.set(blinder, 8);
  const hashBuffer = await crypto.subtle.digest('SHA-256', preimage);
  return new Uint8Array(hashBuffer);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a ZK proof that floor(balance) > threshold.
 *
 * @param balanceStr - Balance as a string (e.g. "8481134.26" or "2000000")
 * @param threshold  - Public threshold (e.g. 1_000_000)
 * @returns ZkProofPayload with hex-encoded proof and public inputs
 */
export async function generateBalanceProof(
  balanceStr: string,
  threshold: number = 1_000_000
): Promise<ZkProofPayload> {
  // Truncate to whole pesos (floor)
  const balance = BigInt(Math.floor(Number(balanceStr)));

  if (balance <= BigInt(threshold)) {
    throw new Error(`Balance ${balance} does not exceed threshold ${threshold}`);
  }

  // Random 16-byte blinder
  const blinder = crypto.getRandomValues(new Uint8Array(16));

  // Compute commitment
  const commitment = await computeCommitment(balance, blinder);

  // Load circuit (served from app/public/circuit.json)
  const circuitResp = await fetch('/circuit.json');
  if (!circuitResp.ok) {
    throw new Error(`Failed to load circuit: ${circuitResp.status}`);
  }
  const circuit = await circuitResp.json();

  // Generate witness + proof
  const backend = new UltraHonkBackend(circuit.bytecode);
  const noir = new Noir(circuit);

  const inputs = {
    balance: balance.toString(),
    blinder: Array.from(blinder),
    commitment: Array.from(commitment),
    threshold: threshold.toString(),
  };

  const { witness } = await noir.execute(inputs);
  const { proof } = await backend.generateProof(witness);

  return {
    proof: toHex(proof),
    publicInputs: {
      commitment: toHex(commitment),
      threshold,
    },
  };
}
