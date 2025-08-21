import { apiService } from './api';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
  ApiResponse
} from '../types';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    
    // Store token and user in localStorage
    if (response.data.token) {
      apiService.setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
    
    // Store token and user in localStorage
    if (response.data.token) {
      apiService.setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we should clear local storage
      console.error('Logout error:', error);
    } finally {
      apiService.removeAuthToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>('/auth/user');
    return response.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/refresh');
    
    if (response.data.token) {
      apiService.setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, email: string, password: string, passwordConfirmation: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  }

  async verifyEmail(id: string, hash: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>(`/email/verify/${id}/${hash}`);
    return response.data;
  }

  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>('/email/verification-notification');
    return response.data;
  }

  // Get stored user from localStorage
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
  }

  // Get current auth token
  getAuthToken(): string | null {
    return apiService.getAuthToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!apiService.getAuthToken() && !!this.getStoredUser();
  }
}

export const authService = new AuthService();
