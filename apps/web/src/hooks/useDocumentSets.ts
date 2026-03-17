import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentSetsApi, documentsApi } from '../api';
import { DocumentSet } from '../types';

export function useDocumentSets() {
  return useQuery<DocumentSet[]>({
    queryKey: ['document-sets'],
    queryFn: () => documentSetsApi.list().then((r) => r.data),
  });
}

export function useDocumentSet(id: number) {
  return useQuery({
    queryKey: ['document-sets', id],
    queryFn: () => documentSetsApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateDocumentSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      documentSetsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['document-sets'] }),
  });
}

export function useUploadDocuments(setId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => documentsApi.upload(setId, files).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['document-sets', setId] }),
  });
}
