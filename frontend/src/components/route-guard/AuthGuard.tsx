import type React from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import { ROUTES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

interface GuardProps {
  children: React.ReactNode;
}

// ==============================|| AUTH GUARD ||============================== //

const AuthGuard: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigate(ROUTES.LOGIN, {
        state: {
          from: location.pathname + location.search,
        },
        replace: true,
      });
    }
  }, [
    isAuthenticated,
    isInitialized,
    navigate,
    location.pathname,
    location.search,
  ]);

  // Show loading while initializing authentication
  if (!isInitialized) {
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
