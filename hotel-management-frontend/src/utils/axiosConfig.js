// src/utils/axiosConfig.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// ✅ Create a singleton instance
let apiInstance = null;

const getApiInstance = () => {
  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request Interceptor
    apiInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`🔑 Token: ${token.substring(0, 30)}...`);
        } else {
          console.log('❌ No token found');
        }
        console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    apiInstance.interceptors.response.use(
      (response) => {
        console.log(`📥 ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('❌ Response error:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('username');
          toast.error('Session expired. Please login again.');
          window.location.href = '/';
        }
        
        if (error.response?.status === 403) {
          toast.error('You do not have permission to perform this action.');
        }
        
        if (error.code === 'ECONNABORTED') {
          toast.error('Request timeout. Please try again.');
        }
        
        if (error.response?.status === 500) {
          toast.error('Server error. Please try again later.');
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  return apiInstance;
};

const api = getApiInstance();
export default api;