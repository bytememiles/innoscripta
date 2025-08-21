import { jwtDecode } from 'jwt-decode';

import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types';

import { apiService } from './api';

// JWT payload interface
interface JwtPayload {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: any;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );

    // Store token and user in localStorage
    if (response.data.token) {
      apiService.setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      credentials
    );

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
    const response =
      await apiService.post<ApiResponse<AuthResponse>>('/auth/refresh');

    if (response.data.token) {
      apiService.setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>(
      '/auth/forgot-password',
      { email }
    );
    return response.data;
  }

  async resetPassword(
    token: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }
    );
    return response.data;
  }

  async verifyEmail(id: string, hash: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>(
      `/email/verify/${id}/${hash}`
    );
    return response.data;
  }

  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>(
      '/email/verification-notification'
    );
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

  // Check if user is authenticated (including token expiration check)
  isAuthenticated(): boolean {
    const hasToken = !!apiService.getAuthToken();
    const hasUser = !!this.getStoredUser();
    const tokenValid = !this.isTokenExpired();

    return hasToken && hasUser && tokenValid;
  }

  // Remove auth token and user data
  removeAuthToken(): void {
    apiService.removeAuthToken();
    localStorage.removeItem('user');
  }

  // Check if token is expired using jwt-decode
  isTokenExpired(): boolean {
    const token = this.getAuthToken();
    if (!token) return true;

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      // Check if token has expiration claim
      if (!decoded.exp) {
        console.warn('JWT token does not contain expiration claim');
        return false; // Assume valid if no exp claim
      }

      // Convert exp from seconds to milliseconds and compare with current time
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();

      // Add a small buffer (30 seconds) to account for clock skew
      const bufferTime = 30 * 1000;

      return currentTime >= expirationTime - bufferTime;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return true; // Treat invalid tokens as expired
    }
  }

  // Get token expiration date (useful for debugging or UI display)
  getTokenExpirationDate(): Date | null {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      if (!decoded.exp) {
        return null;
      }

      return new Date(decoded.exp * 1000);
    } catch (error) {
      console.error('Error decoding JWT token for expiration date:', error);
      return null;
    }
  }

  // Get remaining time before token expires (in milliseconds)
  getTokenTimeRemaining(): number {
    const expirationDate = this.getTokenExpirationDate();
    if (!expirationDate) return 0;

    const remaining = expirationDate.getTime() - Date.now();
    return Math.max(0, remaining);
  }

  // Validate current session
  async validateSession(): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) return false;

      // Check if token is expired
      if (this.isTokenExpired()) {
        this.removeAuthToken();
        return false;
      }

      // Verify token with server
      await this.getCurrentUser();
      return true;
    } catch (error) {
      this.removeAuthToken();
      return false;
    }
  }
}

export const authService = new AuthService();
