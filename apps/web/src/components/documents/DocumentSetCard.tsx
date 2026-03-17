import { Link } from 'react-router-dom';
import { DocumentSet } from '../../types';
import { FolderOpen, Trash2 } from 'lucide-react';

interface Props {
  set: DocumentSet;
  onDelete?: (id: number) => void;
}

export function DocumentSetCard({ set, onDelete }: Props) {
  return (
    <div className="border rounded-lg p-4 flex items-start justify-between hover:shadow-sm transition-shadow">
      <Link to={`/document-sets/${set.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <FolderOpen className="text-indigo-600 shrink-0" size={24} />
        <div className="min-w-0">
          <p className="font-medium truncate">{set.name}</p>
          {set.description && <p className="text-sm text-gray-500 truncate">{set.description}</p>}
          <p className="text-xs text-gray-400 mt-1">{new Date(set.created_at).toLocaleDateString()}</p>
        </div>
      </Link>
      {onDelete && (
        <button
          onClick={() => onDelete(set.id)}
          className="text-red-400 hover:text-red-600 ml-3 shrink-0"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}
