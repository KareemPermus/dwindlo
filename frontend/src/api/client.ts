import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const timersApi = {
  list: () => apiClient.get('/api/timers'),
  create: (data: { title: string; duration_seconds: number }) =>
    apiClient.post('/api/timers', data),
  get: (id: number) => apiClient.get(`/api/timers/${id}`),
  update: (id: number, data: Partial<{ title: string; duration_seconds: number; status: string }>) =>
    apiClient.put(`/api/timers/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/timers/${id}`),
};

export default apiClient;