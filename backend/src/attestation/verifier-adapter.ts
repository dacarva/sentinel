/**
 * Verifier-adapter — IMPLEMENTATION.md §3.3.
 * Invoke Rust verifier (or configurable command); parse stdout to DisclosedData.
 */
import { spawn } from "child_process";
import type { DisclosedData } from "../types.js";

export interface VerifierAdapterOptions {
  verifierCommand?: string;
  verifierArgs?: string[];
}

/**
 * Verify presentation blob via external verifier command.
 * Writes presentation to stdin, reads JSON (DisclosedData) from stdout.
 * Throws on non-zero exit or invalid output.
 */
export async function verifyPresentation(
  presentation: Buffer,
  options: VerifierAdapterOptions = {}
): Promise<DisclosedData> {
  const cmd = options.verifierCommand ?? process.execPath;
  const args = options.verifierArgs ?? [];
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", () => {});
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Verifier exited with code ${code}`));
        return;
      }
      try {
        const data = JSON.parse(stdout.trim()) as DisclosedData;
        if (
          typeof data.balance !== "number" ||
          typeof data.currency !== "string" ||
          !data.transactions_summary
        ) {
          reject(new Error("Invalid verifier output: missing required fields"));
          return;
        }
        resolve(data);
      } catch (e) {
        reject(new Error(`Invalid verifier output: ${e}`));
      }
    });
    child.stdin.write(presentation, (err) => {
      if (err) reject(err);
      else child.stdin.end();
    });
  });
}
