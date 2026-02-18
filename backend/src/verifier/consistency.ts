/**
 * Consistency check — IMPLEMENTATION.md §3.4.
 * For last config.consistencyMonths months, enforce tx_count >= config.minTxPerMonth.
 */
import type { DisclosedData, VerificationConfig } from "../types.js";

export function checkConsistency(
  data: DisclosedData,
  config: VerificationConfig
): void {
  const months = data.transactions_summary?.months ?? [];
  const toCheck = months.slice(-config.consistencyMonths);
  const min = config.minTxPerMonth;
  for (const m of toCheck) {
    if (m.tx_count < min) {
      throw new Error(
        `Month ${m.month} has ${m.tx_count} transactions, required >= ${min}`
      );
    }
  }
}
