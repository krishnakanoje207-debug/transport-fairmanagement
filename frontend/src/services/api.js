import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8001/api/v1',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Cannot connect to server. Is the backend running on port 8001?');
    } else if (error.response.status === 401) {
      const msg = error.response.data?.detail || 'Session expired. Please login again.';
      toast.error(msg);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    } else if (error.response.status === 403) {
      toast.error(error.response.data?.detail || 'Access denied');
    } else if (error.response.status === 400) {
      toast.error(error.response.data?.detail || 'Invalid request');
    } else if (error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(error.response.data?.detail || 'Something went wrong');
    }
    return Promise.reject(error);
  }
);

export default api;
