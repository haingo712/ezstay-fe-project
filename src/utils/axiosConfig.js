// src/utils/axiosConfig.js - Axios Configuration for EZStay Backend
import axios from 'axios';

// API Gateway URL - All requests go through this single endpoint  
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "https://localhost:7000";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('ezstay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('🔐 Unauthorized access, clearing token...');
      localStorage.removeItem('ezstay_token');
      localStorage.removeItem('ezstay_user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;