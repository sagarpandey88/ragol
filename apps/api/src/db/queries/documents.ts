import pool from '../pool';
import { Document } from '@ragol/types';

export async function createDocument(
  documentSetId: number,
  userId: number,
  originalName: string,
  fileData: Buffer,
  fileType: string
): Promise<Document> {
  const { rows } = await pool.query<Document>(
    `INSERT INTO documents (document_set_id, user_id, original_name, file_data, file_type)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, document_set_id, user_id, original_name, file_type, status, chunk_count, created_at`,
    [documentSetId, userId, originalName, fileData, fileType]
  );
  return rows[0];
}

export async function getDocumentFileData(id: number, userId: number): Promise<Buffer | null> {
  const { rows } = await pool.query<{ file_data: Buffer }>(
    'SELECT file_data FROM documents WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return rows[0]?.file_data ?? null;
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
