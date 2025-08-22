import { lazy } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthLayout } from '../components/layout/AuthLayout';
import GuestGuard from '../components/route-guard/GuestGuard';
import Loadable from '../components/ui/Loadable';
import { ROUTES } from '../constants';

// ==============================|| LAZY LOADED AUTH COMPONENTS ||============================== //

const LoginPage = Loadable(lazy(() => import('../sections/auth/LoginPage')));

const RegisterPage = Loadable(
  lazy(() => import('../sections/auth/RegisterPage'))
);

const ForgotPasswordPage = Loadable(
  lazy(() => import('../sections/auth/ForgotPasswordPage'))
);

// ==============================|| AUTH ROUTING ||============================== //

const AuthRoutes = {
  path: ROUTES.AUTH,
  element: (
    <GuestGuard>
      <AuthLayout>
        <Outlet />
      </AuthLayout>
    </GuestGuard>
  ),
  children: [
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'register',
      element: <RegisterPage />,
    },
    {
      path: 'forgot-password',
      element: <ForgotPasswordPage />,
    },
  ],
};

export default AuthRoutes;
