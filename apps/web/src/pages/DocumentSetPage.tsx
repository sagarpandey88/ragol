import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentSet, useUploadDocuments } from '../hooks/useDocumentSets';
import { DocumentUploader } from '../components/documents/DocumentUploader';
import { DocumentList } from '../components/documents/DocumentList';
import { chatApi } from '../api';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Document } from '../types';

export default function DocumentSetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setId = Number(id);
  const { data, isLoading, refetch } = useDocumentSet(setId);
  const uploadMutation = useUploadDocuments(setId);

  const handleFiles = async (files: File[]) => {
    await uploadMutation.mutateAsync(files);
    refetch();
  };

  const handleStartChat = async () => {
    const r = await chatApi.createSession({ documentSetId: setId });
    navigate(`/chat/${r.data.id}`);
  };

  if (isLoading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (!data) return <div className="p-8 text-red-500">Document set not found.</div>;

  const documents: Document[] = data.documents ?? [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          {data.description && <p className="text-gray-500 text-sm mt-1">{data.description}</p>}
        </div>
        <button
          onClick={handleStartChat}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          <MessageSquare size={16} />
          New Chat
        </button>
      </div>

      <section className="mb-8">
        <h2 className="font-semibold mb-3">Upload Documents</h2>
        <DocumentUploader onFiles={handleFiles} uploading={uploadMutation.isPending} />
        {uploadMutation.isPending && <p className="text-sm text-indigo-500 mt-2">Uploading...</p>}
      </section>

      <section>
        <h2 className="font-semibold mb-3">Documents ({documents.length})</h2>
        <DocumentList documents={documents} />
      </section>
    </div>
  );
}
