import { Router, Request, Response } from 'express';
import path from 'path';
import { authenticateJWT } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { getDocumentSetById } from '../db/queries/documentSets';
import { createDocument, getDocumentById, updateDocumentStatus } from '../db/queries/documents';
import { parseFile } from '../services/parser';
import { chunkText } from '../services/chunker';
import { embedTexts } from '../services/embedder';
import { upsertVectors } from '../services/pinecone';


const router = Router({ mergeParams: true });
router.use(authenticateJWT);

// POST /api/document-sets/:setId/documents
router.post('/', upload.array('files', 20), async (req: Request, res: Response): Promise<void> => {
  const setId = Number(req.params.setId);
  const docSet = await getDocumentSetById(setId, req.user!.id);
  if (!docSet) {
    res.status(404).json({ error: 'Document set not found' });
    return;
  }

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }

  const created = await Promise.all(
    files.map((f) =>
      createDocument(
        setId,
        req.user!.id,
        f.originalname,
        f.buffer,
        path.extname(f.originalname).toLowerCase().replace('.', '')
      )
    )
  );

  // Kick off vectorization asynchronously (pass the in-memory buffer directly)
  for (let i = 0; i < created.length; i++) {
    const doc = created[i];
    const buffer = files[i].buffer;
    vectorizeDocument(doc.id, req.user!.id, docSet.id, buffer, doc.file_type).catch((err) => {
      console.error(`Vectorization failed for doc ${doc.id}:`, err);
      updateDocumentStatus(doc.id, 'error').catch(() => {});
    });
  }

  res.status(201).json(created);
});

// GET /api/document-sets/:setId/documents/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const doc = await getDocumentById(Number(req.params.id), req.user!.id);
  if (!doc) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(doc);
});

async function vectorizeDocument(
  documentId: number,
  userId: number,
  documentSetId: number,
  fileData: Buffer,
  fileType: string
): Promise<void> {
  await updateDocumentStatus(documentId, 'processing');

  const text = await parseFile(fileData, fileType);
  const chunks = chunkText(text);
  const embeddings = await embedTexts(chunks);

  const vectors = chunks.map((chunk, i) => ({
    id: `doc-${documentId}-chunk-${i}`,
    values: embeddings[i],
    metadata: { documentId, documentSetId, chunkIndex: i, text: chunk },
  }));

  await upsertVectors(userId, vectors);
  await updateDocumentStatus(documentId, 'done', chunks.length);
}

export default router;
