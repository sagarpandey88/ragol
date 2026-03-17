import { useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages: ChatMessage[];
  sending?: boolean;
}

export function ChatWindow({ messages, sending }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-8">
          Ask a question about your documents...
        </p>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {sending && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-500 animate-pulse">
            Thinking...
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
