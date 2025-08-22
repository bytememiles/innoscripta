import { createBrowserRouter, Navigate } from 'react-router-dom';

import { NotFoundPage } from '../pages/NotFoundPage';

import AuthRoutes from './AuthRoutes';
import MainRoutes from './MainRoutes';

// ==============================|| ROUTER CONFIGURATION ||============================== //

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/dashboard' replace />,
  },
  AuthRoutes,
  MainRoutes,
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
