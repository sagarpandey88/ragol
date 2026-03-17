import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../api';
import { ChatMessage, ChatSession } from '../types';

export function useChat(sessionId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    chatApi.getSession(sessionId).then((r) => setSession(r.data));
    chatApi.getMessages(sessionId).then((r) => setMessages(r.data));
  }, [sessionId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId) return;
      setSending(true);
      try {
        // Optimistically add user message
        const tempUserMsg: ChatMessage = {
          id: Date.now(),
          chat_session_id: sessionId,
          role: 'user',
          content,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempUserMsg]);
        const r = await chatApi.sendMessage(sessionId, content);
        const assistantMsg: ChatMessage = {
          id: Date.now() + 1,
          chat_session_id: sessionId,
          role: 'assistant',
          content: r.data.answer,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } finally {
        setSending(false);
      }
    },
    [sessionId]
  );

  return { messages, session, sending, sendMessage };
}
