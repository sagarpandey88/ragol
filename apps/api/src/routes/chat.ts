import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth';
import {
  createChatSession,
  getChatSessionsByUser,
  getChatSessionById,
  deleteChatSession,
  getMessagesBySession,
} from '../db/queries/chat';
import { getDocumentSetById } from '../db/queries/documentSets';
import { runRAG } from '../services/rag';

const router = Router();
router.use(authenticateJWT);

// POST /api/chat-sessions
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { documentSetId, title } = req.body as { documentSetId?: number; title?: string };
  if (!documentSetId) {
    res.status(400).json({ error: 'documentSetId is required' });
    return;
  }
  const docSet = await getDocumentSetById(documentSetId, req.user!.id);
  if (!docSet) {
    res.status(404).json({ error: 'Document set not found' });
    return;
  }
  const session = await createChatSession(req.user!.id, documentSetId, title ?? 'New Chat');
  res.status(201).json(session);
});

// GET /api/chat-sessions
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const sessions = await getChatSessionsByUser(req.user!.id);
  res.json(sessions);
});

// GET /api/chat-sessions/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const session = await getChatSessionById(Number(req.params.id), req.user!.id);
  if (!session) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(session);
});

// GET /api/chat-sessions/:id/messages
router.get('/:id/messages', async (req: Request, res: Response): Promise<void> => {
  const session = await getChatSessionById(Number(req.params.id), req.user!.id);
  if (!session) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const messages = await getMessagesBySession(session.id);
  res.json(messages);
});

// POST /api/chat-sessions/:id/messages
router.post('/:id/messages', async (req: Request, res: Response): Promise<void> => {
  const session = await getChatSessionById(Number(req.params.id), req.user!.id);
  if (!session) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const { content } = req.body as { content?: string };
  if (!content) {
    res.status(400).json({ error: 'content is required' });
    return;
  }
  try {
    const answer = await runRAG(req.user!.id, session.document_set_id, session.id, content);
    res.json({ answer });
  } catch (err) {
    console.error('runRAG error', err);
    res.status(500).json({ error: 'Failed to generate answer' });
  }
});

// DELETE /api/chat-sessions/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  await deleteChatSession(Number(req.params.id), req.user!.id);
  res.status(204).end();
});

export default router;
