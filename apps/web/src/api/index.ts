import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export default api;

// Auth
export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Document sets
export const documentSetsApi = {
  list: () => api.get('/document-sets'),
  get: (id: number) => api.get(`/document-sets/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post('/document-sets', data),
  delete: (id: number) => api.delete(`/document-sets/${id}`),
};

// Documents
export const documentsApi = {
  upload: (setId: number, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return api.post(`/document-sets/${setId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Chat
export const chatApi = {
  createSession: (data: { documentSetId: number; title?: string }) =>
    api.post('/chat-sessions', data),
  listSessions: () => api.get('/chat-sessions'),
  getSession: (id: number) => api.get(`/chat-sessions/${id}`),
  deleteSession: (id: number) => api.delete(`/chat-sessions/${id}`),
  getMessages: (id: number) => api.get(`/chat-sessions/${id}/messages`),
  sendMessage: (id: number, content: string) =>
    api.post(`/chat-sessions/${id}/messages`, { content }),
};
