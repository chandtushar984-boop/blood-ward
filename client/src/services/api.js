import axios from 'axios';

// Centralized Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Required for HttpOnly cookie authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling 401 errors (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // For genuine protected API 401s (excluding initial session checks or login attempts),
      // notify application context to transition smoothly to logged-out state
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/auth/me') && !requestUrl.includes('/auth/login')) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bloodward:session-expired'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
