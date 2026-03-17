import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth';
import {
  createDocumentSet,
  getDocumentSetsByUser,
  getDocumentSetById,
  deleteDocumentSet,
} from '../db/queries/documentSets';
import { getDocumentsBySet } from '../db/queries/documents';

const router = Router();
router.use(authenticateJWT);

// POST /api/document-sets
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body as { name?: string; description?: string };
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const set = await createDocumentSet(req.user!.id, name, description ?? null);
  res.status(201).json(set);
});

// GET /api/document-sets
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const sets = await getDocumentSetsByUser(req.user!.id);
  res.json(sets);
});

// GET /api/document-sets/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const set = await getDocumentSetById(Number(req.params.id), req.user!.id);
  if (!set) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const documents = await getDocumentsBySet(set.id, req.user!.id);
  res.json({ ...set, documents });
});

// DELETE /api/document-sets/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  await deleteDocumentSet(Number(req.params.id), req.user!.id);
  res.status(204).end();
});

export default router;
