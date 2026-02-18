/**
 * Configuration — IMPLEMENTATION.md §5.
 * Env vars with defaults for balance threshold, consistency, and paths.
 */
import type { VerificationConfig } from "./types.js";

function envNumber(key: string, defaultValue: number): number {
  const v = process.env[key];
  if (v === undefined || v === "") return defaultValue;
  const n = Number(v);
  if (!Number.isFinite(n)) return defaultValue;
  return n;
}

function envString(key: string, defaultValue: string): string {
  const v = process.env[key];
  if (v === undefined || v === "") return defaultValue;
  return v;
}

export function getVerificationConfig(): VerificationConfig {
  return {
    balanceThreshold: envNumber("BALANCE_THRESHOLD", 1000),
    minTxPerMonth: envNumber("MIN_TX_PER_MONTH", 3),
    consistencyMonths: envNumber("CONSISTENCY_MONTHS", 3),
  };
}

export const BANK_BASE_URL = envString("BANK_BASE_URL", "https://localhost:3443");

/** Directory for attestation JSON files (relative to cwd or absolute). */
export const DATA_DIR = envString("DATA_DIR", "data");

/** Data dir (read at call time so tests can override env). */
export function getDataDir(): string {
  return envString("DATA_DIR", "data");
}

/** Path to TLSNotary Rust verifier binary (optional). */
export const VERIFIER_BINARY = envString("VERIFIER_BINARY", "");

const DEFAULT_NOTARY_PUB_KEY =
  "02a1b2c3d4e5f60718293645564738495060717283940515263748596071829304";

/** Notary public key hex for signature verification (secp256k1). */
export const NOTARY_PUB_KEY = envString("NOTARY_PUB_KEY", DEFAULT_NOTARY_PUB_KEY);

/** Notary public key (read at call time so tests can override env). */
export function getNotaryPubKey(): string {
  return envString("NOTARY_PUB_KEY", DEFAULT_NOTARY_PUB_KEY);
}
