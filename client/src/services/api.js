import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/v1';

// Setup axios with base config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, logout and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const authAPI = {
  register: async (name, email, password) => {
    console.log('API: Sending register request', { name, email, password: '***' });
    const response = await api.post('/auth/register', { name, email, password });
    console.log('API: Register response', response.data);
    return response.data;
  },
  
  login: async (email, password) => {
    console.log('API: Sending login request', { email, password: '***' });
    const response = await api.post('/auth/login', { email, password });
    console.log('API: Login response', response.data);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Prompt CRUD endpoints
export const promptsAPI = {
  getAll: async () => {
    const response = await api.get('/prompts');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/prompts/${id}`);
    return response.data;
  },
  
  create: async (promptData) => {
    const response = await api.post('/prompts', promptData);
    return response.data;
  },
  
  update: async (id, promptData) => {
    const response = await api.put(`/prompts/${id}`, promptData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/prompts/${id}`);
    return response.data;
  },
  
  markAsDownloaded: async (id) => {
    const response = await api.post(`/prompts/${id}/download`);
    return response.data;
  },
};

// AI feature endpoints
export const aiAPI = {
  chat: async (message, conversationHistory = []) => {
    const response = await api.post('/ai/chat', { 
      message, 
      conversationHistory 
    });
    return response.data;
  },
  
  enhance: async (prompt) => {
    const response = await api.post('/ai/enhance', { prompt });
    return response.data;
  },
  
  generate: async (description) => {
    const response = await api.post('/ai/generate', { description });
    return response.data;
  },
};

// Marketplace endpoints
export const marketplaceAPI = {
  getAll: async () => {
    const response = await api.get('/packs');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/packs/${id}`);
    return response.data;
  },
  
  install: async (id) => {
    const response = await api.post(`/packs/${id}/install`);
    return response.data;
  },
  
  search: async (query) => {
    const response = await api.get('/packs/search', { 
      params: { q: query } 
    });
    return response.data;
  },
};

export default api;
