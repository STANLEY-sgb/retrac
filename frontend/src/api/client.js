import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('retrac_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 Unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if session expired
      if (!window.location.pathname.startsWith('/login') && window.location.pathname !== '/') {
        localStorage.removeItem('retrac_token');
        localStorage.removeItem('retrac_user');
        window.location.href = '/login?session=expired';
      }
    }
    const errorMsg = error.response?.data?.message || error.message || 'An error occurred connecting to ReTrac server';
    return Promise.reject(new Error(errorMsg));
  }
);

export default api;
