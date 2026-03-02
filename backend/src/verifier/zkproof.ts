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

  try {
    // Write proof bytes to temp file
    const proofBuf = Buffer.from(proofHex, "hex");
    const proofPath = join(dir, "proof");
    await writeFile(proofPath, proofBuf);

    // Run bb verify
    const bbBin = process.env.BB_BIN ?? "bb";
    const { stdout, stderr } = await execFileAsync(bbBin, [
      "verify",
      "-k", vkPath,
      "-p", proofPath,
    ]);

    const output = (stdout + stderr).toLowerCase();
    return output.includes("proof verified successfully");
  } catch (e) {
    // bb exits non-zero on invalid proof
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("failed") || msg.includes("invalid") || msg.includes("error")) {
      return false;
    }
    throw e;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
