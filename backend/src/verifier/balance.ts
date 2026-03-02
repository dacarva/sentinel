/**
 * Balance check — IMPLEMENTATION.md §3.4.
 * Throws if data.balance < config.balanceThreshold.
 */
import type { DisclosedData, VerificationConfig } from "../types.js";

export function checkBalance(
  data: DisclosedData,
  config: VerificationConfig
): void {
  if (data.balance < config.balanceThreshold) {
    throw new Error(
      `Balance ${data.balance} below threshold ${config.balanceThreshold}`
    );
  }
}
