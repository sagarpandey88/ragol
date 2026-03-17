import pool from '../pool';
import { Document } from '@ragol/types';

export async function createDocument(
  documentSetId: number,
  userId: number,
  originalName: string,
  filePath: string,
  fileType: string
): Promise<Document> {
  const { rows } = await pool.query<Document>(
    `INSERT INTO documents (document_set_id, user_id, original_name, file_path, file_type)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [documentSetId, userId, originalName, filePath, fileType]
  );
  return rows[0];
}

export async function getDocumentsBySet(documentSetId: number, userId: number): Promise<Document[]> {
  const { rows } = await pool.query<Document>(
    'SELECT * FROM documents WHERE document_set_id = $1 AND user_id = $2 ORDER BY created_at ASC',
    [documentSetId, userId]
  );
  return rows;
}

export async function getDocumentById(id: number, userId: number): Promise<Document | null> {
  const { rows } = await pool.query<Document>(
    'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return rows[0] ?? null;
}

export async function updateDocumentStatus(
  id: number,
  status: Document['status'],
  chunkCount?: number
): Promise<void> {
  await pool.query(
    'UPDATE documents SET status = $1, chunk_count = COALESCE($2, chunk_count) WHERE id = $3',
    [status, chunkCount ?? null, id]
  );
}
