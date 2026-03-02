/**
 * HMAC webhook verification tests
 */
import { describe, it, expect } from "bun:test";
import { computeWebhookHmac, verifyWebhookHmac } from "../webhook-hmac.js";

const SECRET = "test-secret-key";
const BODY = JSON.stringify({ server_name: "test.com", results: [] });

describe("webhook-hmac", () => {
  it("valid HMAC and fresh timestamp should verify", () => {
    const now = Math.floor(Date.now() / 1000);
    const timestamp = String(now);
    const signature = computeWebhookHmac(SECRET, timestamp, BODY);
    const result = verifyWebhookHmac(SECRET, signature, timestamp, BODY);
    expect(result.ok).toBe(true);
  });

  it("wrong HMAC should fail verification", () => {
    const now = Math.floor(Date.now() / 1000);
    const timestamp = String(now);
    const wrongSignature = "0".repeat(64);
    const result = verifyWebhookHmac(SECRET, wrongSignature, timestamp, BODY);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid signature");
  });

  it("expired timestamp (7 minutes old) should fail", () => {
    const oldTs = Math.floor(Date.now() / 1000) - 7 * 60;
    const timestamp = String(oldTs);
    const signature = computeWebhookHmac(SECRET, timestamp, BODY);
    const result = verifyWebhookHmac(SECRET, signature, timestamp, BODY);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("timestamp out of window");
  });

  it("future timestamp (7 minutes ahead) should fail", () => {
    const futureTs = Math.floor(Date.now() / 1000) + 7 * 60;
    const timestamp = String(futureTs);
    const signature = computeWebhookHmac(SECRET, timestamp, BODY);
    const result = verifyWebhookHmac(SECRET, signature, timestamp, BODY);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("timestamp out of window");
  });

  it("non-numeric timestamp should fail", () => {
    const timestamp = "not-a-number";
    const signature = "0".repeat(64);
    const result = verifyWebhookHmac(SECRET, signature, timestamp, BODY);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid timestamp");
  });
});
