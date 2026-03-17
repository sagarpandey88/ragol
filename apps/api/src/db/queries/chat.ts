import pool from '../pool';
import { ChatSession, ChatMessage } from '@ragol/types';

export async function createChatSession(userId: number, documentSetId: number, title: string): Promise<ChatSession> {
  const { rows } = await pool.query<ChatSession>(
    `INSERT INTO chat_sessions (user_id, document_set_id, title) VALUES ($1, $2, $3) RETURNING *`,
    [userId, documentSetId, title]
  );
  return rows[0];
}

export async function getChatSessionsByUser(userId: number): Promise<ChatSession[]> {
  const { rows } = await pool.query<ChatSession>(
    'SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

export async function getChatSessionById(id: number, userId: number): Promise<ChatSession | null> {
  const { rows } = await pool.query<ChatSession>(
    'SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return rows[0] ?? null;
}

export async function deleteChatSession(id: number, userId: number): Promise<void> {
  await pool.query('DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2', [id, userId]);
}

export async function getMessagesBySession(chatSessionId: number): Promise<ChatMessage[]> {
  const { rows } = await pool.query<ChatMessage>(
    'SELECT * FROM chat_messages WHERE chat_session_id = $1 ORDER BY created_at ASC',
    [chatSessionId]
  );
  return rows;
}

export async function insertMessage(
  chatSessionId: number,
  role: ChatMessage['role'],
  content: string
): Promise<ChatMessage> {
  const { rows } = await pool.query<ChatMessage>(
    `INSERT INTO chat_messages (chat_session_id, role, content) VALUES ($1, $2, $3) RETURNING *`,
    [chatSessionId, role, content]
  );
  return rows[0];
}

export async function getRecentMessages(chatSessionId: number, limit = 10): Promise<ChatMessage[]> {
  const { rows } = await pool.query<ChatMessage>(
    `SELECT * FROM (
       SELECT * FROM chat_messages WHERE chat_session_id = $1 ORDER BY created_at DESC LIMIT $2
     ) sub ORDER BY created_at ASC`,
    [chatSessionId, limit]
  );
  return rows;
}
