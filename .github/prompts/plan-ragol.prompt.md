# Plan: RAG Chat App (ragol)

## Stack
- Frontend: React + Vite (SPA)
- Backend: Express.js
- DB: Postgres (raw SQL, no ORM)
- Vector DB: Pinecone (shared index, namespace per user)
- LLM: Azure OpenAI
- Embeddings: sentence-transformers/all-MiniLM-L6-v2 via @xenova/transformers in Express
- Auth: Passport.js (local + Google OAuth + Microsoft OAuth), JWT in httpOnly cookie
- File Storage: Local disk (Docker volume)
- Docs supported: PDF, DOCX, TXT, MD, CSV, Excel
- Chat scope: per user + per document-set (sessions)
- Deployment: Docker Compose
- Monorepo: pnpm workspaces

---

## Project Structure

```
ragol/
├── apps/
│   ├── web/          # React Vite SPA
│   └── api/          # Express.js backend
├── packages/
│   └── types/        # Shared TypeScript types (optional)
├── docker-compose.yml
├── docker-compose.dev.yml
├── pnpm-workspace.yaml
└── package.json
```

---

## Phase 1: Monorepo Scaffold

1. Init pnpm workspace: `pnpm-workspace.yaml` pointing to `apps/*` and `packages/*`
2. Root `package.json` with workspaces config
3. `apps/api/` — Express TypeScript project (tsconfig, package.json, src/)
4. `apps/web/` — Vite + React + TypeScript scaffold
5. `packages/types/` — shared TS type definitions (User, Document, ChatSession, Message)
6. `.env.example` files for both api and web
7. Root `.gitignore`

---

## Phase 2: Database (Postgres, raw SQL)

Schema (migration files in `apps/api/src/db/migrations/`):

| Table | Key Columns |
|---|---|
| users | id, email, name, password_hash (nullable), provider (local/google/microsoft), provider_id (nullable), created_at |
| document_sets | id, user_id, name, description, created_at |
| documents | id, document_set_id, user_id, original_name, file_path, file_type, status (pending/processing/done/error), chunk_count, created_at |
| chat_sessions | id, user_id, document_set_id, title, created_at |
| chat_messages | id, chat_session_id, role (user/assistant), content, created_at |

- `apps/api/src/db/pool.ts` — `pg` Pool instance from env vars
- `apps/api/src/db/migrate.ts` — run SQL migration files on startup
- All queries as raw SQL functions in `apps/api/src/db/queries/*.ts`

---

## Phase 3: Auth (Passport.js + JWT)

- `passport-local` (bcrypt passwords), `passport-google-oauth20`, `passport-microsoft`
- On successful auth: sign JWT (`jsonwebtoken`), set as httpOnly + SameSite cookie
- `authenticateJWT` middleware reads cookie, verifies token, attaches `req.user`
- Endpoints:
  - POST `/api/auth/register`
  - POST `/api/auth/login`
  - GET `/api/auth/google` + `/api/auth/google/callback`
  - GET `/api/auth/microsoft` + `/api/auth/microsoft/callback`
  - POST `/api/auth/logout` (clear cookie)
  - GET `/api/auth/me`

---

## Phase 4: Document Upload & Vectorization

### Upload
- `multer` middleware, store to Docker volume (`/uploads`)
- POST `/api/document-sets` — create set
- POST `/api/document-sets/:id/documents` — upload file(s)
- Multer file filter: pdf, docx, txt, md, csv, xlsx

### Parsing (in `apps/api/src/services/parser.ts`)
- PDF: `pdf-parse`
- DOCX: `mammoth`
- CSV: `csv-parse`
- Excel: `xlsx`
- TXT/MD: `fs.readFile`

### Chunking (in `apps/api/src/services/chunker.ts`)
- Fixed-size chunks: 512 tokens, 50-token overlap
- Use `gpt-tokenizer` or simple word-count split

### Embedding (in `apps/api/src/services/embedder.ts`)
- Load `@xenova/transformers` pipeline once at startup
- Model: `sentence-transformers/all-MiniLM-L6-v2` (384-dim)
- Process chunks in batches

### Pinecone Upsert (in `apps/api/src/services/pinecone.ts`)
- `@pinecone-database/pinecone`
- Namespace: `user-{userId}`
- Metadata per vector: `{ documentId, documentSetId, chunkIndex, text }`
- Upsert in batches of 100

### Status updates: documents.status updated as pipeline progresses

---

## Phase 5: RAG Chat

### Endpoints
- POST `/api/chat-sessions` — create session (requires documentSetId)
- GET `/api/chat-sessions` — list user's sessions
- GET `/api/chat-sessions/:id` — session detail
- GET `/api/chat-sessions/:id/messages` — history
- POST `/api/chat-sessions/:id/messages` — send message (RAG + store)
- DELETE `/api/chat-sessions/:id`

### RAG pipeline (in `apps/api/src/services/rag.ts`)
1. Embed user query with same HuggingFace model
2. Query Pinecone in namespace `user-{userId}`, filter `documentSetId`
3. Retrieve top-5 chunks
4. Build prompt: system + context chunks + last N messages (10) + user message
5. Call Azure OpenAI chat completion (streaming via SSE or non-streaming first)
6. Save user message + assistant response to `chat_messages`
7. Return response

---

## Phase 6: Express API Structure

```
apps/api/src/
├── index.ts              # app entry, connect DB, load passport
├── routes/
│   ├── auth.ts
│   ├── documentSets.ts
│   ├── documents.ts
│   └── chat.ts
├── middleware/
│   ├── auth.ts           # authenticateJWT
│   └── upload.ts         # multer config
├── services/
│   ├── parser.ts
│   ├── chunker.ts
│   ├── embedder.ts
│   ├── pinecone.ts
│   └── rag.ts
├── db/
│   ├── pool.ts
│   ├── migrate.ts
│   └── queries/
│       ├── users.ts
│       ├── documentSets.ts
│       ├── documents.ts
│       └── chat.ts
└── config/
    └── passport.ts
```

Key libs: express, cors, helmet, morgan, cookie-parser, passport, passport-local, passport-google-oauth20, passport-microsoft, jsonwebtoken, bcryptjs, multer, @xenova/transformers, @pinecone-database/pinecone, openai, pdf-parse, mammoth, csv-parse, xlsx, pg

---

## Phase 7: React Frontend

### Pages / Routes
| Route | Component | Description |
|---|---|---|
| `/` | `HomePage` | Landing with features + "Get Started" CTA |
| `/auth` | `AuthPage` | Login + Register tabs, OAuth buttons |
| `/dashboard` | `DashboardPage` | Document sets list, create set |
| `/document-sets/:id` | `DocumentSetPage` | Upload docs, view docs, start/list chat sessions |
| `/chat/:sessionId` | `ChatPage` | Chat interface |

### Frontend Structure
```
apps/web/src/
├── main.tsx
├── App.tsx           # routes (react-router-dom v6)
├── pages/
│   ├── HomePage.tsx
│   ├── AuthPage.tsx
│   ├── DashboardPage.tsx
│   ├── DocumentSetPage.tsx
│   └── ChatPage.tsx
├── components/
│   ├── layout/       # Navbar, Sidebar
│   ├── auth/         # LoginForm, RegisterForm, OAuthButtons
│   ├── documents/    # DocumentSetCard, DocumentUploader, DocumentList
│   └── chat/         # ChatWindow, MessageBubble, ChatInput
├── hooks/            # useAuth, useDocumentSets, useChat
├── api/              # axios instance + typed API calls
└── types/            # mirrored from packages/types
```

Key libs: react-router-dom, @tanstack/react-query, axios, tailwindcss, shadcn/ui (optional), react-markdown, react-dropzone, lucide-react

---

## Phase 8: Docker Compose

Services:
- `postgres` — postgres:16-alpine, volume for data
- `api` — Node 20, builds from `apps/api`, mounts uploads volume
- `web` — Node 20 (dev) or nginx (prod), builds from `apps/web`

Volumes:
- `postgres_data`
- `uploads_data` (mounted to api at `/uploads`)

Networks: internal bridge

Two compose files:
- `docker-compose.yml` — production (nginx for web)
- `docker-compose.dev.yml` — dev with hot reload

---

## Verification Steps

1. `docker compose up` starts all 3 services cleanly
2. `GET /api/health` returns 200
3. Register with local credentials → JWT cookie set, `GET /api/auth/me` returns user
4. Google OAuth redirect flow completes → user created in DB
5. Create document set → appears in dashboard
6. Upload a PDF → document status transitions to `done`, vectors visible in Pinecone console
7. Create chat session → send message → RAG response returned, message stored in DB
8. Chat history persists on page refresh
9. Logout clears cookie, protected routes return 401

---

## Decisions
- No ORM (raw pg queries), no Zod or schema validation library
- Single Pinecone index, namespace = `user-{userId}`; metadata filter on `documentSetId` at query time
- Embeddings run in-process via @xenova/transformers WASM (no Python service)
- JWT in httpOnly cookie (not localStorage) for XSS protection
- File uploads stored on local Docker volume (not S3)
- Azure OpenAI env vars as placeholders (AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT)
- Passport OAuth callbacks redirect to frontend with JWT already set in cookie
- Streaming: initial implementation non-streaming; SSE streaming can be added later

## Out of Scope
- Multi-tenancy / organizations
- Role-based access control
- Document re-vectorization / updates
- Payment / usage limits
- Email verification
