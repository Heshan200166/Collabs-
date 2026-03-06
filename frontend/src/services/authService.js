import axios from 'axios';

const API_URL = '/api/auth';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  register: async (name, email, password) => {
    const response = await api.post('/register', { name, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

export default authService;
