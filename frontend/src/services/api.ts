import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
};

// Targets service
export const targetsService = {
  list: () => api.get('/targets/'),
  get: (id: number) => api.get(`/targets/${id}`),
  create: (data: { name: string; url: string; description?: string }) =>
    api.post('/targets/', data),
  update: (id: number, data: { name?: string; url?: string; description?: string }) =>
    api.put(`/targets/${id}`, data),
  delete: (id: number) => api.delete(`/targets/${id}`),
};

// Scans service
export const scansService = {
  list: () => api.get('/scans/'),
  get: (id: number) => api.get(`/scans/${id}`),
  create: (data: { name: string; scan_type: string; target_id: number }) =>
    api.post('/scans/', data),
  update: (id: number, data: { status?: string; results?: string }) =>
    api.put(`/scans/${id}`, data),
  delete: (id: number) => api.delete(`/scans/${id}`),
};

// Vulnerabilities service
export const vulnerabilitiesService = {
  list: () => api.get('/vulnerabilities/'),
  get: (id: number) => api.get(`/vulnerabilities/${id}`),
  create: (data: any) => api.post('/vulnerabilities/', data),
  update: (id: number, data: any) => api.put(`/vulnerabilities/${id}`, data),
  delete: (id: number) => api.delete(`/vulnerabilities/${id}`),
};
