import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

import { ROUTES } from '../constants/routes';
import type { ApiError } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  public client: AxiosInstance; // Make client public for AuthContext access

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      config => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      error => {
        // Handle 401 unauthorized - don't redirect automatically
        // Let the components handle authentication errors themselves
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          // Remove automatic redirect to prevent page refresh
          // window.location.href = ROUTES.LOGIN;
        }

        // Transform error to our ApiError format with enhanced messages
        let errorMessage =
          error.response?.data?.message || error.message || 'An error occurred';

        // Provide more specific error messages for common status codes
        if (error.response?.status === 401) {
          errorMessage =
            'Invalid credentials. Please check your email and password.';
        } else if (error.response?.status === 422) {
          errorMessage = 'Validation error. Please check your input.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Resource not found.';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response?.status === 0 || !error.response) {
          errorMessage = 'Network error. Please check your connection.';
        }

        const apiError: ApiError = {
          message: errorMessage,
          errors: error.response?.data?.errors,
          status: error.response?.status,
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Set auth token
  setAuthToken(token: string): void {
    console.log('🔑 ApiService: Setting auth token:', !!token);
    localStorage.setItem('auth_token', token);

    // Verify storage
    const storedToken = localStorage.getItem('auth_token');
    console.log('🔑 ApiService: Token storage verification:', !!storedToken);
  }

  // Remove auth token
  removeAuthToken(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // Get current auth token
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const apiService = new ApiService();
export default apiService;
