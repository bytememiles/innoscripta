import React, { createContext, useContext, useEffect, useState } from 'react';

// project imports
import { apiService } from '../services/api';
import type { LoginCredentials, RegisterCredentials, User } from '../types';

// ==============================|| AUTH TYPES ||============================== //

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

// ==============================|| AUTH UTILS ||============================== //

const setSession = (token?: string | null) => {
  if (token) {
    localStorage.setItem('auth_token', token);
    apiService.client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    delete apiService.client.defaults.headers.common.Authorization;
  }
};

const verifyToken = (token: string): boolean => {
  if (!token) return false;

  // For Laravel Sanctum tokens, we can't decode them like JWT
  // Instead, we'll validate them by checking if they have the correct format
  // Laravel Sanctum tokens typically have format: "id|hash"
  const tokenParts = token.split('|');
  const isValid = tokenParts.length === 2 && !!tokenParts[0] && !!tokenParts[1];

  return isValid;
};

// ==============================|| AUTH CONTEXT ||============================== //

const AuthContext = createContext<AuthContextType | null>(null);

// ==============================|| AUTH PROVIDER ||============================== //

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');

        if (token && userStr && verifyToken(token)) {
          setSession(token);

          try {
            const response = await apiService.get<{ data: { user: User } }>(
              '/user'
            );
            setUser(response.data.user);
            setIsAuthenticated(true);
          } catch (error) {
            // Don't immediately clear auth data on API failure
            // Instead, try to use the stored user data
            try {
              const storedUser = JSON.parse(userStr);
              setUser(storedUser);
              setIsAuthenticated(true);
            } catch (parseError) {
              // Only clear auth data if we can't parse the stored user
              setSession(null);
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        } else {
          setSession(null);
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        setSession(null);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiService.post<{
      data: { user: User; token: string };
    }>('/login', credentials);
    const { user: userData, token } = response.data;

    setSession(token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const register = async (credentials: RegisterCredentials) => {
    const response = await apiService.post<{
      data: { user: User; token: string };
    }>('/register', credentials);
    const { user: userData, token } = response.data;

    setSession(token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    apiService.post('/logout').catch(() => {
      // Ignore logout errors
    });

    setSession(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==============================|| AUTH HOOK ||============================== //

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
