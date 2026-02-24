/**
 * Map JS plugin prove() results to DisclosedData for ingest.
 * Used when presentation is the new format { results: ProofResultItem[] }.
 */
import { createHash } from "crypto";
import type { DisclosedData, JsPresentation, ProofResultItem, TransactionSummary } from "../types.js";

function findResultByPath(results: ProofResultItem[], path: string): string | undefined {
  // Preferred: newer plugins set params.path explicitly.
  const byParams = results.find(
    (x) => x.part === "BODY" && x.params?.path === path
  );
  if (byParams?.value !== undefined) return byParams.value;

  // Fallback for legacy plugins that only emit raw BODY lines like:
  // { part: "BODY", value: "\"balance\":25000" }
  const candidate = results.find(
    (x) => x.part === "BODY" && typeof x.value === "string" && x.value.includes(`"${path}"`)
  );
  if (!candidate) return undefined;

  const text = candidate.value as string;
  const re = new RegExp(`"${path}"\\s*:\\s*("([^"]*)"|[^,}\\s]+)`);
  const match = text.match(re);
  if (!match) return undefined;

  // If the value is a quoted string, return the inner part; otherwise return the token as-is.
  if (match[2] !== undefined) return match[2];
  return match[1];
}

function buildTransactionsSummary(results: ProofResultItem[]): TransactionSummary {
  const raw = findResultByPath(results, "transactions");
  if (!raw) return { months: [] };
  try {
    const arr = JSON.parse(raw) as Array<{ date?: string }>;
    if (!Array.isArray(arr)) return { months: [] };
    const byMonth = new Map<string, number>();
    for (const t of arr) {
      const date = t?.date;
      if (typeof date === "string" && date.length >= 7) {
        const month = date.slice(0, 7);
        byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
      }
    }
    const months = Array.from(byMonth.entries())
      .map(([month, tx_count]) => ({ month, tx_count }))
      .sort((a, b) => a.month.localeCompare(b.month));
    return { months };
  } catch {
    return { months: [] };
  }
}

/**
 * Convert JS plugin presentation (results array) to DisclosedData.
 * Expects at least results with params.path 'balance' and 'currency'.
 * account_id is optional; if present it is hashed for account_id_hash.
 */
export function disclosedDataFromJsPresentation(presentation: JsPresentation): DisclosedData {
  const results = presentation.results ?? [];
  const balanceStr = findResultByPath(results, "balance");
  const currencyStr = findResultByPath(results, "currency");
  const accountIdStr = findResultByPath(results, "account_id");

  if (balanceStr === undefined || balanceStr === "")
    throw new Error("presentation missing balance");
  if (currencyStr === undefined || currencyStr === "")
    throw new Error("presentation missing currency");

  const balance = Number(balanceStr);
  if (Number.isNaN(balance)) throw new Error("invalid balance in presentation");

  const account_id_hash = accountIdStr
    ? createHash("sha256").update(accountIdStr).digest("hex")
    : createHash("sha256").update("").digest("hex");

  const transactions_summary = buildTransactionsSummary(results);

  return {
    balance,
    currency: String(currencyStr).trim(),
    account_id_hash,
    transactions_summary,
  };
}
