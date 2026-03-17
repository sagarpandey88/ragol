import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { ChatWindow } from '../components/chat/ChatWindow';
import { ChatInput } from '../components/chat/ChatInput';
import { ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { messages, session, sending, sendMessage } = useChat(sessionId ? Number(sessionId) : null);

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-semibold truncate">{session?.title ?? 'Chat'}</h2>
      </div>
      <ChatWindow messages={messages} sending={sending} />
      <ChatInput onSend={sendMessage} disabled={sending} />
    </div>
  );
}
