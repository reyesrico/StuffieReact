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

// Request interceptor — inject JWT from localStorage on every request
apiClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    try {
      const session = localStorage.getItem('stuffie-session');
      if (session) {
        const { accessToken } = JSON.parse(session);
        if (accessToken) {
          requestConfig.headers['X-Stuffie-Auth'] = accessToken;
        }
      }
    } catch {
      // malformed session — ignore, let the request proceed unauthenticated
    }
    if (import.meta.env.DEV) {
      console.debug(`[API] ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
    }
    return requestConfig;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor — auto-logout on 401 (expired or invalid token)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Token expired or invalid — clear session and reload to login
        localStorage.removeItem('stuffie-user');
        localStorage.removeItem('stuffie-session');
        localStorage.removeItem('username');
        localStorage.removeItem('stuffie-cache');
        // Only redirect if not already on the login page
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      } else if (status === 429) {
        console.error('[API] Rate limit exceeded');
      } else if (status >= 500) {
        console.error('[API] Server error:', status);
      }
    } else if (error.request) {
      console.error('[API] Network error - no response received');
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
