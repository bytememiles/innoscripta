import { lazy } from 'react';
import { Outlet } from 'react-router-dom';

import { MainLayout } from '../components/layout/MainLayout';
import AuthGuard from '../components/route-guard/AuthGuard';
import Loadable from '../components/ui/Loadable';
import { ROUTES } from '../constants';

// ==============================|| LAZY LOADED MAIN COMPONENTS ||============================== //

const HomePage = Loadable(
  lazy(() =>
    import('../pages/HomePage').then(module => ({
      default: module.HomePage,
    }))
  )
);

const SearchPage = Loadable(lazy(() => import('../pages/SearchPage')));

const ArticlePage = Loadable(
  lazy(() =>
    import('../pages/ArticlePage').then(module => ({
      default: module.ArticlePage,
    }))
  )
);

const ProfilePage = Loadable(lazy(() => import('../pages/ProfilePage')));

const JobsPage = Loadable(lazy(() => import('../pages/JobsPage')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: ROUTES.APP,
  element: (
    <AuthGuard>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </AuthGuard>
  ),
  children: [
    {
      path: '',
      element: <HomePage />,
    },
    {
      path: 'search',
      element: <SearchPage />,
    },
    {
      path: 'article/:id',
      element: <ArticlePage />,
    },
    {
      path: 'profile',
      element: <ProfilePage />,
    },
    {
      path: 'jobs',
      element: <JobsPage />,
    },
  ],
};

export default MainRoutes;
