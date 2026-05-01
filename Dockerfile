FROM node:22-alpine

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/

RUN npm ci

# Copy source
COPY packages/shared/ ./packages/shared/
COPY backend/ ./backend/

# Build shared package so the backend can import @laf/shared
RUN npm run build --workspace=packages/shared

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "/app/node_modules/.bin/tsx", "backend/src/server.ts"]
