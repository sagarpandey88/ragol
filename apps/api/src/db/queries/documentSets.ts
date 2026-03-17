import pool from '../pool';
import { DocumentSet } from '@ragol/types';

export async function createDocumentSet(userId: number, name: string, description: string | null): Promise<DocumentSet> {
  const { rows } = await pool.query<DocumentSet>(
    `INSERT INTO document_sets (user_id, name, description) VALUES ($1, $2, $3) RETURNING *`,
    [userId, name, description]
  );
  return rows[0];
}

export async function getDocumentSetsByUser(userId: number): Promise<DocumentSet[]> {
  const { rows } = await pool.query<DocumentSet>(
    'SELECT * FROM document_sets WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

export async function getDocumentSetById(id: number, userId: number): Promise<DocumentSet | null> {
  const { rows } = await pool.query<DocumentSet>(
    'SELECT * FROM document_sets WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return rows[0] ?? null;
}

export async function deleteDocumentSet(id: number, userId: number): Promise<void> {
  await pool.query('DELETE FROM document_sets WHERE id = $1 AND user_id = $2', [id, userId]);
}
