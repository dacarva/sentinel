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

const LOGIN_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mock Bank — zkCredit</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 320px; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    p { color: #666; font-size: 0.875rem; margin-bottom: 1.25rem; }
    label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; }
    input { width: 100%; padding: 0.5rem; margin-bottom: 0.75rem; box-sizing: border-box; }
    button { width: 100%; padding: 0.6rem; background: #333; color: #fff; border: none; cursor: pointer; font-size: 0.9rem; }
    button:hover { background: #555; }
    .msg { margin-top: 1rem; padding: 0.5rem; font-size: 0.875rem; border-radius: 4px; }
    .msg.err { background: #fee; color: #c00; }
    .msg.ok { background: #efe; color: #060; }
  </style>
</head>
<body>
  <h1>Mock Bank</h1>
  <p>Sign in for zkCredit attestation. Use <code>user_pass</code> / <code>sentinel123</code> for testing.</p>
  <form id="login" method="post" action="/auth/login">
    <label for="username">Username</label>
    <input id="username" name="username" type="text" value="user_pass" autocomplete="username" required />
    <label for="password">Password</label>
    <input id="password" name="password" type="password" placeholder="e.g. sentinel123" autocomplete="current-password" required />
    <button type="submit">Sign in</button>
  </form>
  <div id="msg" class="msg" style="display:none;"></div>
  <script>
    document.getElementById('login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const msg = document.getElementById('msg');
      msg.style.display = 'none';
      try {
        const r = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.username.value, password: form.password.value })
        });
        const data = await r.json();
        if (r.ok) {
          msg.className = 'msg ok'; msg.textContent = 'Signed in. You can continue in the TLSN extension.';
        } else {
          msg.className = 'msg err'; msg.textContent = data.message || data.error || 'Login failed';
        }
      } catch (err) {
        msg.className = 'msg err'; msg.textContent = err.message || 'Request failed';
      }
      msg.style.display = 'block';
    });
  </script>
</body>
</html>
`;

export function startMockBank(port: number): Promise<{ stop: () => void }> {
  const app = express();
  app.use(express.json());
  app.get("/", (_req, res) => {
    res.type("html").send(LOGIN_HTML);
  });
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
