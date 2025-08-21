// ==============================|| REDUX STATE TYPES ||============================== //

import type { ArticleFilters } from './article';
import type { User } from './user';

// Theme types
export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
  autoHide?: boolean;
}

// Auth slice state
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// UI slice state
export interface UiState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  loading: {
    [key: string]: boolean;
  };
  notifications: Notification[];
  searchQuery: string;
  searchFilters: Partial<ArticleFilters>;
}

// RTK Query types
export interface RTKQueryState {
  queries: Record<string, any>;
  mutations: Record<string, any>;
  provided: Record<string, any>;
  subscriptions: Record<string, any>;
  config: {
    online: boolean;
    focused: boolean;
    middlewareRegistered: boolean;
  };
}

// Root state interface (will be extended when store types are imported)
export interface RootState {
  auth: AuthState;
  ui: UiState;
  newsApi: RTKQueryState;
}

// Redux action types
export interface ReduxAction<T = any> {
  type: string;
  payload?: T;
}

// Async thunk state types
export interface AsyncThunkConfig {
  state: RootState;
  dispatch: any;
  extra?: any;
  rejectValue: string;
}

// Search filters for UI state (legacy support)
export interface LegacySearchFilters {
  category_id?: number;
  source_id?: number;
  from_date?: string;
  to_date?: string;
  author?: string;
}

// Selector return types
export interface SelectorReturn<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
}

// Redux slice configuration
export interface SliceConfig<T> {
  name: string;
  initialState: T;
  reducers: Record<string, any>;
  extraReducers?: any;
}
