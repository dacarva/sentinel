/**
 * Configuration — IMPLEMENTATION.md §5.
 * Env vars with defaults for balance threshold, consistency, and paths.
 */
import type { VerificationConfig } from "./types.js";
import EC from "elliptic";

const _ec = new EC.ec("secp256k1");

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

const DEFAULT_NOTARY_PRIV_KEY =
  "a1b2c3d4e5f607182936455647384950607172839405152637485960718293041";

/** Notary private key hex for signing attestations (secp256k1). */
export function getNotaryPrivKey(): string {
  return envString("NOTARY_PRIV_KEY", DEFAULT_NOTARY_PRIV_KEY);
}

/** Notary public key (read at call time so tests can override env).
 *  When NOTARY_PUB_KEY is not set, derives it from the private key so they
 *  always form a valid secp256k1 key pair.
 */
export function getNotaryPubKey(): string {
  const envKey = process.env["NOTARY_PUB_KEY"];
  if (envKey) return envKey;
  return _ec.keyFromPrivate(getNotaryPrivKey(), "hex").getPublic(true, "hex");
}

/** Exported constant — kept for backwards-compat but prefer getNotaryPubKey(). */
export const NOTARY_PUB_KEY = getNotaryPubKey();
