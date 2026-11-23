import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('mediflow_jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // If a request to /api returns HTML (such as an SPA fallback on Vercel), treat as backend offline
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype') || response.data.trim().startsWith('<html'))
    ) {
      const error = new Error('Backend offline: received HTML instead of JSON from API');
      (error as any).response = { status: 503, data: { message: 'Backend service offline' } };
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('mediflow_jwt');
      sessionStorage.removeItem('mediflow_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
