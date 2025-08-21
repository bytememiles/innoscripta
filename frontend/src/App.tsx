import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import AppRoutes from './components/AppRoutes';
import { NotificationContainer } from './components/ui/NotificationContainer';
import { ThemeProvider } from './theme/ThemeProvider';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppRoutes />
          <NotificationContainer />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
