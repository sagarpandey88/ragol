FROM node:20-alpine AS base
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

FROM node:20-alpine AS runner
RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --prod --frozen-lockfile

COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY packages/types ./packages/types

RUN mkdir -p /uploads

EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
