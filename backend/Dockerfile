FROM oven/bun:1.1 AS deps

WORKDIR /app

# Install production dependencies for the backend
COPY package.json ./
RUN bun install --production

FROM ubuntu:24.04 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DEBIAN_FRONTEND=noninteractive

# Install runtime deps
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Install noir
RUN curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash && \
    /root/.nargo/bin/noirup --version 1.0.0-beta.3

ENV PATH="/root/.nargo/bin:$PATH"

# Install bb v0.82.2
RUN curl -L https://raw.githubusercontent.com/AztecProtocol/aztec-packages/refs/heads/next/barretenberg/bbup/install | bash && \
    /root/.bb/bbup --version 0.82.2

ENV PATH="/root/.bb:$PATH"   

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy backend source code
COPY . .

EXPOSE 3000

CMD ["bun", "run", "src/server.ts"]
