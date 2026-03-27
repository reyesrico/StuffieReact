/**
 * API Client - Axios instance with pre-configured headers
 * 
 * Supports both RestDB and Codehooks backends via config.ts
 * All API calls should go through this client for consistent headers
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import config from '../config/api';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: config.server,
  headers: config.headers,
  timeout: 30000, // 30 second timeout
});

// Request interceptor for logging and token handling
apiClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    // Add timestamp for debugging
    if (import.meta.env.DEV) {
      console.debug(`[API] ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
    }
    return requestConfig;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        // Unauthorized - could trigger logout
        console.error('[API] Unauthorized request');
      } else if (status === 429) {
        // Rate limited
        console.error('[API] Rate limit exceeded');
      } else if (status >= 500) {
        // Server error
        console.error('[API] Server error:', status);
      }
    } else if (error.request) {
      // Network error
      console.error('[API] Network error - no response received');
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
