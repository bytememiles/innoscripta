import type React from 'react';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { NotificationContainer } from './components/ui/NotificationContainer';
import { useAppDispatch } from './hooks/redux';
import { initializeAuthAsync } from './store/slices/authSlice';
import { ThemeProvider } from './theme/ThemeProvider';
import router from './routes';
import { store } from './store';

// ==============================|| APP INITIALIZATION ||============================== //

const AppInitializer: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize authentication state on app start
    dispatch(initializeAuthAsync());
  }, [dispatch]);

  return null;
};

// ==============================|| MAIN APP ||============================== //

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppInitializer />
        <RouterProvider router={router} />
        <NotificationContainer />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
