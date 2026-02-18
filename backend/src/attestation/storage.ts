/**
 * Attestation storage — IMPLEMENTATION.md §3.3.
 * Save/load attestations under data/attestations/<id>.json; UUID v4 for new ids.
 */
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import type { Attestation } from "../types.js";
import { getDataDir } from "../config.js";
import { randomUUID } from "crypto";

const ATTESTATIONS_DIR = "attestations";

function attestationsPath(): string {
  return join(getDataDir(), ATTESTATIONS_DIR);
}

function filePath(id: string): string {
  return join(attestationsPath(), `${id}.json`);
}

export async function saveAttestation(att: Attestation): Promise<void> {
  const dir = attestationsPath();
  await mkdir(dir, { recursive: true });
  await writeFile(filePath(att.id), JSON.stringify(att, null, 2), "utf8");
}

export async function loadAttestation(
  id: string
): Promise<Attestation | null> {
  try {
    const data = await readFile(filePath(id), "utf8");
    return JSON.parse(data) as Attestation;
  } catch {
    return null;
  }
}

export function generateAttestationId(): string {
  return randomUUID();
}
