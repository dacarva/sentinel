#!/usr/bin/env bun
/**
 * CLI: verify an attestation by id.
 * Usage: bun run verify -- <attestation_id>
 */
import { loadAttestation, saveAttestation } from "./attestation/storage.js";
import { verify } from "./verifier/index.js";

const id = process.argv[2];
if (!id) {
  console.error("Usage: bun run verify -- <attestation_id>");
  process.exit(1);
}

const result = await verify(id, loadAttestation, saveAttestation);
console.log(JSON.stringify(result, null, 2));
process.exit(result.isValid ? 0 : 1);
