/**
 * Sentinel REST API — IMPLEMENTATION.md §3.5.
 * POST /attest, GET /attest/:id, POST /verify/:id.
 */
import express from "express";
import { ingest, ingestFromJsPresentation } from "./attestation/ingest.js";
import { loadAttestation, saveAttestation } from "./attestation/storage.js";
import { verify } from "./verifier/index.js";
import { storeWebhook, lookupWebhook } from "./attestation/webhook-store.js";
import { getTlsnWebhookSecret, requireWebhookVerification, getNotaryPubKey } from "./config.js";
import { verifyWebhookHmac } from "./attestation/webhook-hmac.js";
import type { DisclosedData, JsPresentation, TlsnWebhookPayload, TlsnHandlerResult } from "./types.js";

const app = express();

// Custom middleware to store raw body for HMAC validation
app.use(express.json({ limit: "10mb", verify: (req: any, _res, buf) => {
  req.rawBody = buf.toString("utf8");
} }));

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-TLSN-Secret, X-TLSN-Signature, X-TLSN-Timestamp"
  );
  next();
});

app.get("/notary/pubkey", (_req, res) => {
  res.json({
    public_key: getNotaryPubKey(),
    algorithm: "secp256k1",
    encoding: "compressed-hex",
  });
});

app.post("/webhook/tlsn", (req: any, res) => {
  const payload = req.body as TlsnWebhookPayload;
  const signature = req.headers["x-tlsn-signature"] as string | undefined;
  const timestamp = req.headers["x-tlsn-timestamp"] as string | undefined;
  const bodyString = req.rawBody || "";

  if (signature && timestamp) {
    const result = verifyWebhookHmac(getTlsnWebhookSecret(), signature, timestamp, bodyString);
    if (!result.ok) {
      res.status(401).json({ error: "UNAUTHORIZED", reason: result.reason });
      return;
    }
  } else {
    if (req.headers["x-tlsn-secret"] !== getTlsnWebhookSecret()) {
      res.status(401).json({ error: "UNAUTHORIZED" });
      return;
    }
  }

  if (!payload?.results || !payload?.server_name) {
    res.status(400).json({ error: "BAD_REQUEST", message: "Invalid webhook payload" });
    return;
  }
  storeWebhook(payload);
  res.status(200).json({ ok: true });
});

app.post("/attest", async (req, res) => {
  try {
    const { user_address, presentation, _mockDisclosed } = req.body as {
      user_address?: string;
      presentation?: string | JsPresentation;
      _mockDisclosed?: DisclosedData;
    };
    if (!user_address || typeof user_address !== "string") {
      res.status(400).json({
        error: "BAD_REQUEST",
        message: "user_address is required",
      });
      return;
    }
    if (presentation === undefined || presentation === null) {
      res.status(400).json({
        error: "BAD_REQUEST",
        message: "presentation is required",
      });
      return;
    }
    const isJsPresentation =
      typeof presentation === "object" &&
      presentation !== null &&
      Array.isArray((presentation as JsPresentation).results);
    if (isJsPresentation) {
      let webhook: TlsnWebhookPayload | undefined;
      if (requireWebhookVerification()) {
        const jsPres = presentation as JsPresentation;
        const found = lookupWebhook(jsPres.results as TlsnHandlerResult[]);
        if (!found) {
          res.status(422).json({
            error: "WEBHOOK_REQUIRED",
            message: "No verifier webhook received for this proof. Ensure the TLSNotary verifier is running and configured to POST to this backend.",
          });
          return;
        }
        webhook = found;
      }
      const att = await ingestFromJsPresentation(
        presentation as JsPresentation,
        user_address,
        webhook
      );
      res.status(201).json({
        attestation_id: att.id,
        status: att.status,
      });
      return;
    }
    const buf = Buffer.isBuffer(presentation)
      ? presentation
      : Buffer.from(String(presentation), "base64");
    const options =
      _mockDisclosed && typeof _mockDisclosed === "object"
        ? { mockVerify: async () => _mockDisclosed }
        : {};
    const att = await ingest(buf, user_address, options);
    res.status(201).json({
      attestation_id: att.id,
      status: att.status,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("user_address") || message.includes("42 characters")) {
      res.status(400).json({ error: "BAD_REQUEST", message });
      return;
    }
    res.status(422).json({
      error: "VERIFICATION_FAILED",
      message: "Presentation verification failed",
      details: { reason: message },
    });
  }
});

app.get("/attest/:id", async (req, res) => {
  const id = req.params.id;
  const att = await loadAttestation(id);
  if (!att) {
    res.status(404).json({ error: "NOT_FOUND", message: "Attestation not found" });
    return;
  }
  res.json(att);
});

app.get("/verify/:id", (_req, res) => {
  res.status(405).json({
    error: "METHOD_NOT_ALLOWED",
    message: "Use POST to verify an attestation",
  });
});

app.post("/verify/:id", async (req, res) => {
  const id = req.params.id;
  const att = await loadAttestation(id);
  if (!att) {
    res.status(404).json({ error: "NOT_FOUND", message: "Attestation not found" });
    return;
  }
  try {
    const result = await verify(id, loadAttestation, saveAttestation);
    res.json(result);
  } catch (e) {
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: e instanceof Error ? e.message : String(e),
    });
  }
});

export function startServer(port: number): Promise<{ stop: () => void }> {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve({
        stop: () => {
          server.close();
        },
      });
    });
  });
}

if (import.meta.main) {
  const port = Number(process.env.PORT) || 3000;
  startServer(port).then(({ stop }) => {
    console.log(`Sentinel API on http://localhost:${port}`);
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
  });
}
