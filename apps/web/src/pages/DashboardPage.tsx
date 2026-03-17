import { useState } from 'react';
import { useDocumentSets, useCreateDocumentSet } from '../hooks/useDocumentSets';
import { DocumentSetCard } from '../components/documents/DocumentSetCard';
import { documentSetsApi } from '../api';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { data: sets = [], isLoading } = useDocumentSets();
  const createSet = useCreateDocumentSet();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSet.mutateAsync({ name, description: description || undefined });
    setShowForm(false);
    setName('');
    setDescription('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document set?')) return;
    await documentSetsApi.delete(id);
    qc.invalidateQueries({ queryKey: ['document-sets'] });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Document Sets</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          <Plus size={16} />
          New Set
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border rounded-xl p-5 mb-6 space-y-3 bg-gray-50">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
              Create
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border px-4 py-2 rounded text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : sets.length === 0 ? (
        <p className="text-gray-400 text-sm">No document sets yet. Create one to get started.</p>
      ) : (
        <div className="space-y-3">
          {sets.map((set) => (
            <DocumentSetCard key={set.id} set={set} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
