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
    // Get token from localStorage (try both key names for compatibility)
    const token = localStorage.getItem('ezstay_token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Token found (${token.substring(0, 20)}...)`);
    } else {
      console.warn('⚠️ No token found in localStorage');
      console.log('Available keys:', Object.keys(localStorage));
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
      console.warn('🔐 Unauthorized access detected');
      const token = localStorage.getItem('ezstay_token') || localStorage.getItem('authToken');
      console.log('Token in localStorage:', token?.substring(0, 50));
      console.log('Response:', error.response?.data);
      
      // Clear all token variations
      localStorage.removeItem('ezstay_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('ezstay_user');
      localStorage.removeItem('userEmail');
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;