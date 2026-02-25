/**
 * HMAC utilities for webhook authentication — IMPLEMENTATION.md §3.2.
 * Provides signature verification with timestamp replay protection.
 */
import { createHmac, timingSafeEqual } from "crypto";

const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Compute HMAC-SHA256 signature of timestamped body.
 * Used by TLSNotary verifier to sign webhook payloads.
 */
export function computeWebhookHmac(secret: string, timestamp: string, bodyString: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${bodyString}`).digest("hex");
}

/**
 * Verify webhook HMAC signature including timestamp freshness check.
 * Returns { ok: true } if valid, { ok: false, reason } otherwise.
 */
export function verifyWebhookHmac(
  secret: string,
  signature: string,
  timestamp: string,
  bodyString: string
): { ok: boolean; reason?: string } {
  const tsMs = Number(timestamp) * 1000;
  if (!Number.isFinite(tsMs)) return { ok: false, reason: "invalid timestamp" };
  if (Math.abs(Date.now() - tsMs) > TIMESTAMP_TOLERANCE_MS)
    return { ok: false, reason: "timestamp out of window" };

  const expected = computeWebhookHmac(secret, timestamp, bodyString);
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== actualBuf.length) return { ok: false, reason: "invalid signature" };

  return timingSafeEqual(expectedBuf, actualBuf) ? { ok: true } : { ok: false, reason: "invalid signature" };
}
