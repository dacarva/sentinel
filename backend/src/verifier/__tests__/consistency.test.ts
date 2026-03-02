/**
 * Consistency verifier tests — IMPLEMENTATION.md §6.
 * Red: run first without implementation; Green: implement consistency.ts.
 */
import { describe, test, expect } from "bun:test";
import { checkConsistency } from "../consistency.js";
import type { DisclosedData, VerificationConfig } from "../../types.js";

const config: VerificationConfig = {
  balanceThreshold: 1000,
  minTxPerMonth: 3,
  consistencyMonths: 3,
};

describe("consistency verifier", () => {
  test("all months meet min tx count passes", () => {
    const data: DisclosedData = {
      balance: 2000,
      currency: "USD",
      account_id_hash: "hash",
      transactions_summary: {
        months: [
          { month: "2025-11", tx_count: 5 },
          { month: "2025-12", tx_count: 4 },
          { month: "2026-01", tx_count: 6 },
        ],
      },
    };
    expect(() => checkConsistency(data, config)).not.toThrow();
  });

  test("one month below min fails", () => {
    const data: DisclosedData = {
      balance: 2000,
      currency: "USD",
      account_id_hash: "hash",
      transactions_summary: {
        months: [
          { month: "2025-11", tx_count: 5 },
          { month: "2025-12", tx_count: 1 },
          { month: "2026-01", tx_count: 6 },
        ],
      },
    };
    expect(() => checkConsistency(data, config)).toThrow();
  });

  test("boundary (tx_count === minTxPerMonth) passes", () => {
    const data: DisclosedData = {
      balance: 2000,
      currency: "USD",
      account_id_hash: "hash",
      transactions_summary: {
        months: [
          { month: "2025-11", tx_count: 3 },
          { month: "2025-12", tx_count: 3 },
          { month: "2026-01", tx_count: 3 },
        ],
      },
    };
    expect(() => checkConsistency(data, config)).not.toThrow();
  });
});
