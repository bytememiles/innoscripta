import type React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { NotificationContainer } from './components/ui/NotificationContainer';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './theme/ThemeProvider';
import router from './routes';
import { store } from './store';

// ==============================|| MAIN APP ||============================== //

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
          <NotificationContainer />
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
