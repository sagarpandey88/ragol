# Ragol — RAG Chat Application

A full-stack RAG (Retrieval-Augmented Generation) chat app that lets users upload documents and chat with them using AI.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL (raw SQL, no ORM) |
| Vector DB | Pinecone (namespace per user) |
| LLM | Azure OpenAI |
| Embeddings | `@xenova/transformers` (all-MiniLM-L6-v2, in-process) |
| Auth | Passport.js (local + Google OAuth + Microsoft OAuth), JWT in httpOnly cookie |
| File Storage | Local Docker volume |
| Package Manager | pnpm workspaces (monorepo) |

## Quick Start

### Prerequisites
- Node.js 20+, pnpm 9+
- Docker & Docker Compose
- Pinecone account + index
- Azure OpenAI deployment

### Development

```bash
# 1. Copy env files and fill in secrets
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 2. Install dependencies
pnpm install

# 3. Start Postgres
docker compose -f docker-compose.dev.yml up postgres -d

# 4. Start API (auto-runs migrations)
cd apps/api && pnpm dev

# 5. Start web (separate terminal)
cd apps/web && pnpm dev
```

### Production

```bash
docker compose up --build
```

Web served on port 80, API on port 3000.

## Project Structure

```
ragol/
├── apps/
│   ├── api/          # Express.js backend
│   └── web/          # React Vite SPA
├── packages/
│   └── types/        # Shared TypeScript types
├── docker-compose.yml        # Production
└── docker-compose.dev.yml    # Development
```

## Environment Variables (apps/api/.env)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_INDEX` | Pinecone index name |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint |
| `AZURE_OPENAI_KEY` | Azure OpenAI key |
| `AZURE_OPENAI_DEPLOYMENT` | Azure deployment name |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` | Microsoft OAuth (optional) |

## Verification

1. `GET /api/health` → `{ "status": "ok" }`
2. Register → JWT cookie set → `GET /api/auth/me` returns user
3. Create document set → upload PDF → status transitions to `done`
4. Create chat session → send message → RAG response returned
A RAG based app
