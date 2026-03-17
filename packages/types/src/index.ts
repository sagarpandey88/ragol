export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string | null;
  provider: 'local' | 'google' | 'microsoft';
  provider_id: string | null;
  created_at: Date;
}

export interface DocumentSet {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  created_at: Date;
}

export interface Document {
  id: number;
  document_set_id: number;
  user_id: number;
  original_name: string;
  file_path: string;
  file_type: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  chunk_count: number | null;
  created_at: Date;
}

export interface ChatSession {
  id: number;
  user_id: number;
  document_set_id: number;
  title: string;
  created_at: Date;
}

export interface ChatMessage {
  id: number;
  chat_session_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
}
