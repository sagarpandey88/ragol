import { Document } from '../../types';
import { FileText, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  documents: Document[];
}

const statusIcon = {
  pending: <Clock size={16} className="text-gray-400" />,
  processing: <Loader2 size={16} className="text-indigo-500 animate-spin" />,
  done: <CheckCircle size={16} className="text-green-500" />,
  error: <AlertTriangle size={16} className="text-red-500" />,
};

export function DocumentList({ documents }: Props) {
  if (documents.length === 0) {
    return <p className="text-sm text-gray-400">No documents yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li key={doc.id} className="flex items-center gap-3 border rounded p-3 text-sm">
          <FileText size={18} className="text-gray-400 shrink-0" />
          <span className="flex-1 truncate">{doc.original_name}</span>
          <span className="text-xs text-gray-400 uppercase">{doc.file_type}</span>
          <span title={doc.status}>{statusIcon[doc.status]}</span>
          {doc.chunk_count != null && (
            <span className="text-xs text-gray-400">{doc.chunk_count} chunks</span>
          )}
        </li>
      ))}
    </ul>
  );
}
