# ── Stage 1: build the React/Vite web app ────────────────────────────────────
FROM node:20-alpine AS web-builder
RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web

WORKDIR /app/apps/web
RUN pnpm build

# ── Stage 2: compile the TypeScript API ──────────────────────────────────────
FROM node:20-alpine AS api-builder
RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY packages/types ./packages/types
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN pnpm build

# ── Stage 3: production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --prod --frozen-lockfile

COPY --from=api-builder /app/apps/api/dist ./apps/api/dist
COPY packages/types ./packages/types

# Web static assets served by Express
COPY --from=web-builder /app/apps/web/dist ./apps/api/public

EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
