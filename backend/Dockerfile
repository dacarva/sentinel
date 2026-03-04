FROM oven/bun:1.1 AS deps

WORKDIR /app

# Install production dependencies for the backend
COPY package.json ./
RUN bun install --production

FROM oven/bun:1.1 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy backend source code
COPY . .

EXPOSE 3000

CMD ["bun", "run", "src/server.ts"]

