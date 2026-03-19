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

const CHANGE_ME_NOTARY_PRIV_KEY =
  "CHANGE_ME_SET_A_REAL_SECP256K1_PRIVATE_KEY_IN_NOTARY_PRIV_KEY_ENV_VAR";

/** Notary private key hex for signing attestations (secp256k1). */
export function getNotaryPrivKey(): string {
  const key = envString("NOTARY_PRIV_KEY", CHANGE_ME_NOTARY_PRIV_KEY);
  if (key === CHANGE_ME_NOTARY_PRIV_KEY || key.startsWith("CHANGE_ME")) {
    console.warn(
      "\n⚠️  WARNING: NOTARY_PRIV_KEY is not set. Using a placeholder — attestations will fail.\n" +
      "   Generate a real secp256k1 private key and set NOTARY_PRIV_KEY in your environment.\n"
    );
  }
  return key;
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

/** Shared secret for validating TLSN verifier webhook requests. */
export function getTlsnWebhookSecret(): string {
  const secret = envString("TLSN_WEBHOOK_SECRET", "CHANGE_ME_SET_WEBHOOK_SECRET");
  if (secret === "CHANGE_ME_SET_WEBHOOK_SECRET" || secret.startsWith("CHANGE_ME")) {
    console.warn(
      "\n⚠️  WARNING: TLSN_WEBHOOK_SECRET is not set. Using a placeholder — webhook auth will fail in production.\n" +
      "   Set TLSN_WEBHOOK_SECRET to a strong random string in your environment.\n"
    );
  }
  return secret;
}

/** Whether to require webhook verification for JS presentations (can be disabled for tests). */
export function requireWebhookVerification(): boolean {
  const val = process.env.REQUIRE_WEBHOOK;
  if (val === undefined || val === "") return true;
  return val.toLowerCase() !== "false";
}
