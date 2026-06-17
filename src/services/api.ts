import axios, { AxiosInstance, AxiosError } from 'axios';
import mockApi from './mockApi';

const API_URL =
  (import.meta as any).env?.VITE_API_URL ||
  'https://septicservice.onrender.com/api';

const USE_MOCK_API = (() => {
  const env = (import.meta as any).env;
  const explicit = env?.VITE_USE_MOCK_API;
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;

  // In local dev, default to mock API when backend URL is not configured.
  return Boolean(env?.DEV && !env?.VITE_API_URL);
})();

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // send cookies
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Response interceptors

    this.client.interceptors.response.use(
      (response) => {
        const contentType = String(response.headers?.['content-type'] || '').toLowerCase();
        const isHtmlResponse = contentType.includes('text/html');
        const requestUrl = response.config?.url || '';

        // If dev server returns index.html for /api/*, treat it as backend unavailable.
        if (requestUrl.includes('/api') && isHtmlResponse) {
          return Promise.reject(new Error('API backend is unavailable or proxy is not configured'));
        }

        return response;
      },
      (error: AxiosError) => {
        const requestUrl = error.config?.url || '';
        const isAuthRequest = requestUrl.includes('/auth/request-code') || requestUrl.includes('/auth/verify-code');

        if (error.response?.status === 401 && !isAuthRequest && window.location.pathname !== '/login') {
          // If unauthorized, redirect to login (server should clear cookie)
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
  // No local token stored; server manages HttpOnly cookie

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return ((response.data as any)?.data ?? response.data) as T;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return ((response.data as any)?.data ?? response.data) as T;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return ((response.data as any)?.data ?? response.data) as T;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return ((response.data as any)?.data ?? response.data) as T;
  }
}

const normalizeApiResponse = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
};

const createMockAdapter = () => ({
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await mockApi.get<any>(url, params);
    return normalizeApiResponse<T>(response);
  },
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await mockApi.post<any>(url, data);
    return normalizeApiResponse<T>(response);
  },
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await mockApi.put<any>(url, data);
    return normalizeApiResponse<T>(response);
  },
  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await mockApi.delete<any>(url, config);
    return normalizeApiResponse<T>(response);
  },
});

const api = USE_MOCK_API ? createMockAdapter() : new ApiService();

export default api;
