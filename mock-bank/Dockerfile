# Mock Bank HTTPS server for zkCredit attestation.
# TLS certificates are not generated at build time; the deployment must provide
# certs/server.key and certs/server.cert (e.g. via volume mount into /app/certs).
FROM oven/bun:1-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json ./
RUN bun install

# Application code and data
COPY server.ts cookie-parser.d.ts ./
COPY routes ./routes
COPY data ./data
COPY certs/notary-key.ts certs/

EXPOSE 3443

ENV PORT=3443

CMD ["bun", "run", "server.ts"]
