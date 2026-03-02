# Mock Bank server for zkCredit attestation.
# Runs plain HTTP — TLS is terminated by the platform (Render, GCloud, etc.)
# which provides a trusted certificate. For local dev, run with certs present
# to get HTTPS on port 3443.
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

# PORT is set by the platform (Render uses 10000, GCloud varies).
# Defaults to 3000 if not set.
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "server.ts"]
