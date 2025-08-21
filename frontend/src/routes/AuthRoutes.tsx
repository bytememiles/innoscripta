import { lazy } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthLayout } from '../components/layout/AuthLayout';
import GuestGuard from '../components/route-guard/GuestGuard';
import Loadable from '../components/ui/Loadable';

// ==============================|| LAZY LOADED AUTH COMPONENTS ||============================== //

const LoginPage = Loadable(
  lazy(() =>
    import('../components/auth/LoginPage').then(module => ({
      default: module.LoginPage,
    }))
  )
);

const RegisterPage = Loadable(
  lazy(() =>
    import('../components/auth/RegisterPage').then(module => ({
      default: module.RegisterPage,
    }))
  )
);

const ForgotPasswordPage = Loadable(
  lazy(() =>
    import('../components/auth/ForgotPasswordPage').then(module => ({
      default: module.ForgotPasswordPage,
    }))
  )
);

// ==============================|| AUTH ROUTING ||============================== //

const AuthRoutes = {
  path: '/',
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
