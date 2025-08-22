import { createBrowserRouter, Navigate } from 'react-router-dom';

import { ROUTES } from '../constants';
import { NotFoundPage } from '../pages/NotFoundPage';

import AuthRoutes from './AuthRoutes';
import MainRoutes from './MainRoutes';

// ==============================|| ROUTER CONFIGURATION ||============================== //

const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.APP} replace />,
  },
  AuthRoutes,
  MainRoutes,
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
