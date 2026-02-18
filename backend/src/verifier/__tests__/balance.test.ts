/**
 * Balance verifier tests — IMPLEMENTATION.md §6.
 * Red: run first without implementation; Green: implement balance.ts.
 */
import { describe, test, expect } from "bun:test";
import { checkBalance } from "../balance.js";
import type { DisclosedData, VerificationConfig } from "../../types.js";

const config: VerificationConfig = {
  balanceThreshold: 1000,
  minTxPerMonth: 3,
  consistencyMonths: 3,
};

describe("balance verifier", () => {
  test("balance above threshold passes (no throw)", () => {
    const data: DisclosedData = {
      balance: 2000,
      currency: "USD",
      account_id_hash: "hash",
      transactions_summary: { months: [] },
    };
    expect(() => checkBalance(data, config)).not.toThrow();
  });

  test("balance below threshold fails (throws or returns error)", () => {
    const data: DisclosedData = {
      balance: 500,
      currency: "USD",
      account_id_hash: "hash",
      transactions_summary: { months: [] },
    };
    expect(() => checkBalance(data, config)).toThrow();
  });
});
