import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000,
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response || error);
    
    // Handle different error scenarios
    if (!error.response) {
      // Network error - backend not running
      toast.error('Cannot connect to server. Please check if backend is running on port 8000.');
      console.error('Backend not reachable. Start backend with: uvicorn app.main:app --reload');
    } else if (error.response.status === 401) {
      // Unauthorized - token expired or invalid
      const msg = error.response.data?.detail || 'Session expired. Please login again.';
      toast.error(msg);
      
      // Clear tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response.status === 400) {
      // Bad request - validation error
      const msg = error.response.data?.detail || 'Invalid request';
      toast.error(msg);
    } else if (error.response.status === 500) {
      // Server error
      toast.error('Server error. Please try again later.');
      console.error('Server Error:', error.response.data);
    } else {
      // Other errors
      const msg = error.response.data?.detail || 'Something went wrong';
      toast.error(msg);
    }
    
    return Promise.reject(error);
  }
);

export default api;
