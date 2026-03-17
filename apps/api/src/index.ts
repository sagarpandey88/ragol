import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import { runMigrations } from './db/migrate';
import authRouter from './routes/auth';
import documentSetsRouter from './routes/documentSets';
import documentsRouter from './routes/documents';
import chatRouter from './routes/chat';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Security & utility middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/document-sets', documentSetsRouter);
app.use('/api/document-sets/:setId/documents', documentsRouter);
app.use('/api/chat-sessions', chatRouter);

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function main() {
  await runMigrations();
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
