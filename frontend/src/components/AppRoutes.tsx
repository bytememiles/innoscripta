import type React from 'react';
import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { ArticlePage } from '../pages/ArticlePage';
// Page components
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SearchPage } from '../pages/SearchPage';
import { authService } from '../services/authService';
import { getCurrentUserAsync } from '../store/slices/authSlice';

import { ForgotPasswordPage } from './auth/ForgotPasswordPage';
// Auth components
import { LoginPage } from './auth/LoginPage';
import { RegisterPage } from './auth/RegisterPage';
import { AuthLayout } from './layout/AuthLayout';
// Layout components
import { MainLayout } from './layout/MainLayout';

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  return isAuthenticated ? <>{children}</> : <Navigate to='/login' replace />;
};

// Public route component (redirect to home if authenticated)
const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  return !isAuthenticated ? <>{children}</> : <Navigate to='/' replace />;
};

const AppRoutes: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Check if user is authenticated on app load
    if (authService.isAuthenticated() && !isAuthenticated && !isLoading) {
      dispatch(getCurrentUserAsync());
    }
  }, [dispatch, isAuthenticated, isLoading]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path='/login'
        element={
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        }
      />

      <Route
        path='/register'
        element={
          <PublicRoute>
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          </PublicRoute>
        }
      />

      <Route
        path='/forgot-password'
        element={
          <PublicRoute>
            <AuthLayout>
              <ForgotPasswordPage />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <MainLayout>
              <HomePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/search'
        element={
          <ProtectedRoute>
            <MainLayout>
              <SearchPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/article/:id'
        element={
          <ProtectedRoute>
            <MainLayout>
              <ArticlePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/profile'
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Page */}
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
