import axios from 'axios';
import Constants from 'expo-constants';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Update this with your backend URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or use AsyncStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;