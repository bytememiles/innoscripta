import type React from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AUTH_REDIRECTS, ROUTES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

interface GuardProps {
  children: React.ReactNode;
}

// ==============================|| GUEST GUARD ||============================== //

const GuestGuard: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only redirect if user is already authenticated and we're not in the middle of a login/register process
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      // Check if we're coming from a successful auth process
      // If not, then redirect (this handles cases where user manually navigates to auth pages)
      const isFromAuthProcess = location.state?.fromAuthProcess;

      if (!isFromAuthProcess) {
        // Navigate to intended destination or app
        const from =
          (location.state as any)?.from || AUTH_REDIRECTS.DEFAULT_AUTHENTICATED;
        navigate(from, {
          state: { from: null },
          replace: true,
        });
      }
    }
  }, [isAuthenticated, isInitialized, navigate, location.state]);

  // Don't render anything while initializing
  if (!isInitialized) return null;

  // Only render children if not authenticated
  return !isAuthenticated ? <>{children}</> : null;
};

export default GuestGuard;
