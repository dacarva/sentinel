import { createHash } from "crypto";
import type { TlsnWebhookPayload, TlsnHandlerResult } from "../types.js";

const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface StoredWebhook {
  payload: TlsnWebhookPayload;
  receivedAt: number;
}

const store = new Map<string, StoredWebhook>();

/** Hash a results array — used as the store key (one entry per webhook/session). */
function hashResults(results: TlsnHandlerResult[]): string {
  const canonical = JSON.stringify(
    [...results].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  );
  return createHash("sha256").update(canonical).digest("hex");
}

export function storeWebhook(payload: TlsnWebhookPayload): void {
  const key = hashResults(payload.results as TlsnHandlerResult[]);
  store.set(key, { payload, receivedAt: Date.now() });
}

/**
 * Subset matching: iterate all stored webhooks and return the first one whose
 * every result appears in clientResults. Works for both single and two-call flows.
 */
export function lookupWebhook(clientResults: TlsnHandlerResult[]): TlsnWebhookPayload | null {
  const clientSet = new Set(clientResults.map((r) => JSON.stringify(r)));
  for (const [key, entry] of store.entries()) {
    if (Date.now() - entry.receivedAt > TTL_MS) {
      store.delete(key);
      continue;
    }
    const allMatch = entry.payload.results.every((r) =>
      clientSet.has(JSON.stringify(r as TlsnHandlerResult))
    );
    if (allMatch) return entry.payload;
  }
  return null;
}
