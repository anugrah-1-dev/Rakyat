import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ruangwarga_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url?.startsWith('/admin/')) {
      localStorage.removeItem('ruangwarga_token');
      localStorage.removeItem('ruangwarga_admin');
      window.dispatchEvent(new Event('admin-session-expired'));
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (error, fallback = 'Terjadi kesalahan. Silakan coba lagi.') =>
  error.response?.data?.message || error.message || fallback;

export default api;
