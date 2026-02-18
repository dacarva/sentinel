/**
 * Mock Bank HTTPS server — IMPLEMENTATION.md §3.
 * Uses certs/server.key and certs/server.cert.
 */
import express from "express";
import https from "https";
import { readFileSync } from "fs";
import { join } from "path";
import authRoutes from "./routes/auth";
import accountRoutes from "./routes/account";

const certsDir = join(import.meta.dir ?? "", "certs");
const keyPath = join(certsDir, "server.key");
const certPath = join(certsDir, "server.cert");

export function startMockBank(port: number): Promise<{ stop: () => void }> {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);
  app.use("/account", accountRoutes);

  let key: Buffer;
  let cert: Buffer;
  try {
    key = readFileSync(keyPath);
    cert = readFileSync(certPath);
  } catch (e) {
    throw new Error(
      `Missing TLS certs. Run: bash mock-bank/certs/generate.sh (from repo root). Original: ${e}`
    );
  }

  const server = https.createServer({ key, cert }, app);

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve({
        stop: () => {
          server.close();
        },
      });
    });
  });
}

// When run directly: bun run mock-bank/server.ts
if (import.meta.main) {
  const port = Number(process.env.PORT) || 3443;
  startMockBank(port).then(({ stop }) => {
    console.log(`Mock Bank HTTPS on https://localhost:${port}`);
    process.on("SIGINT", () => {
      stop();
      process.exit(0);
    });
  });
}
