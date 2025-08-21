import type React from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getCurrentUserAsync } from '../../store/slices/authSlice';

interface GuardProps {
  children: React.ReactNode;
}

// ==============================|| AUTH GUARD ||============================== //

const AuthGuard: React.FC<GuardProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user, token } = useAppSelector(
    state => state.auth
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      // If we have a token but no user, try to get current user
      if (token && !user && !isLoading) {
        try {
          await dispatch(getCurrentUserAsync()).unwrap();
        } catch (error) {
          // Token is invalid, will redirect to login below
          console.error('Failed to get current user:', error);
        }
      }
    };

    initAuth();
  }, [dispatch, token, user, isLoading]);

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname + location.search,
        },
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard;
