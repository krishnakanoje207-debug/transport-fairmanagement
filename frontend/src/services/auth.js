import api from './api';

export const refreshToken = async () => {
  try {
    const res = await api.post('/auth/refresh');
    const { access_token } = res.data;
    localStorage.setItem('access_token', access_token);
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    return access_token;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!localStorage.getItem('access_token');

export const getToken = () => localStorage.getItem('access_token');
