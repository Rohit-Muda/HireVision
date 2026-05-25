import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 300000, // 5 min for video uploads + Gemini File API processing
});

// Attach Firebase token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hv_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hv_token');
      localStorage.removeItem('hv_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
