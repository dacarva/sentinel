/**
 * ZK proof verifier — verifies Barretenberg UltraHonk proofs using the bb CLI.
 *
 * The verification key (vk) is loaded from circuit/target/vk (committed artifact).
 * Proof and VK are written to temp files, verified via subprocess, then cleaned up.
 */
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, writeFile, rm } from "fs/promises";
import { join, resolve } from "path";
import { tmpdir } from "os";
import { existsSync } from "fs";

const execFileAsync = promisify(execFile);

/** Resolve path to the compiled verification key relative to this file or the monorepo root. */
function resolveVkPath(): string {
  // When running from the backend package (dev or prod), find the monorepo root.
  // __dirname is backend/src/verifier/ (or backend/dist/verifier/ after build).
  const candidates = [
    resolve(import.meta.dirname, "../../../circuit/target/vk"),
    resolve(process.cwd(), "circuit/target/vk"),
    resolve(process.cwd(), "../circuit/target/vk"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error(
    `ZK verification key not found. Expected at circuit/target/vk. ` +
    `Run: cd circuit && bb write_vk -b target/balance_threshold.json -o target/`
  );
}

/**
 * Verify a Barretenberg UltraHonk proof produced by the balance_threshold circuit.
 *
 * @param proofHex  - Hex-encoded proof bytes (from zkProof.proof)
 * @param publicInputs - Public inputs used in the proof
 * @returns true if proof is valid, false otherwise
 */
export async function verifyBalanceProof(
  proofHex: string,
  publicInputs: { commitment: string; threshold: number }
): Promise<boolean> {
  const vkPath = resolveVkPath();

  const dir = await mkdtemp(join(tmpdir(), "sentinel-zkverify-"));
  // Keep the proof on disk so you can replay bb verify manually after a failure.
  // Set ZK_KEEP_PROOF=false to re-enable automatic cleanup.
  const keepProof = process.env.ZK_KEEP_PROOF !== "false";

  try {
    if (!proofHex || proofHex.length === 0) {
      return false;
    }

    const rawBuf = Buffer.from(proofHex, "hex");
    let proofFileBuf: Buffer;

    // If the buffer already looks like a bb proof file
    // ([u32 BE count][count × 32-byte elements]), use it as-is.
    if (rawBuf.length >= 4) {
      const elementCount = rawBuf.readUInt32BE(0);
      if (4 + elementCount * 32 === rawBuf.length) {
        proofFileBuf = rawBuf;
      } else {
        proofFileBuf = buildProofFileFromBody(rawBuf, publicInputs);
      }
    } else {
      proofFileBuf = buildProofFileFromBody(rawBuf, publicInputs);
    }

    const proofPath = join(dir, "proof");
    await writeFile(proofPath, proofFileBuf);

    // Run bb verify with UltraHonk scheme (required — default scheme is not ultra_honk)
    const bbBin = process.env.BB_BIN ?? "bb";
    const args = ["verify", "-s", "ultra_honk", "-k", vkPath, "-p", proofPath];

    const { stdout, stderr } = await execFileAsync(bbBin, args);

    const output = (stdout + stderr).toLowerCase();
    const verified = output.includes("proof verified successfully");
    return verified;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("failed") || msg.includes("invalid") || msg.includes("error")) {
      return false;
    }
    throw e;
  } finally {
    if (!keepProof) {
      await rm(dir, { recursive: true, force: true });
    }
  }
}

function buildProofFileFromBody(
  proofBody: Buffer,
  publicInputs: { commitment: string; threshold: number }
): Buffer {
  // bb verify -s ultra_honk expects the proof file in the same format bb prove writes:
  //   [u32 BE: total element count][element_count × 32 bytes]
  // where the first 33 elements are the public inputs (commitment[0..31] + threshold)
  // and the remaining elements are the proof body.
  // bb.js generateProof returns ONLY the proof body (without the count header or public
  // inputs), so we must prepend them before writing to disk.
  const commitmentBytes = Buffer.from(publicInputs.commitment, "hex"); // 32 bytes
  const numPublicInputs = 33; // commitment[0..31] (32 × u8) + threshold (1 × u64)
  const proofElementCount = proofBody.length / 32;
  const totalElements = numPublicInputs + proofElementCount;

  // 4-byte big-endian count header
  const header = Buffer.alloc(4);
  header.writeUInt32BE(totalElements, 0);

  // commitment: each of the 32 bytes as a 32-byte BE field element (0x00...00XX)
  const piCommitment = Buffer.alloc(32 * 32, 0);
  for (let i = 0; i < 32; i++) {
    piCommitment[i * 32 + 31] = commitmentBytes[i];
  }

  // threshold: u64 as a 32-byte BE field element
  const piThreshold = Buffer.alloc(32, 0);
  piThreshold.writeBigUInt64BE(BigInt(publicInputs.threshold), 24); // last 8 bytes

  return Buffer.concat([header, piCommitment, piThreshold, proofBody]);
}
