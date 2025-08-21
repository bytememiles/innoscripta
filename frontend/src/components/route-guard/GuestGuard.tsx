import type React from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../hooks/redux';

interface GuardProps {
  children: React.ReactNode;
}

// ==============================|| GUEST GUARD ||============================== //

const GuestGuard: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      // Navigate to intended destination or home
      const from = (location.state as any)?.from || '/';
      navigate(from, {
        state: { from: null },
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Don't render anything while loading
  if (isLoading) return null;

  // Only render children if not authenticated
  return !isAuthenticated ? <>{children}</> : null;
};

export default GuestGuard;
