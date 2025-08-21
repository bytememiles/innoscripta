import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  ArticleFilters,
  Notification,
  ThemeMode,
  UiState,
} from '../../types';

const initialState: UiState = {
  theme: 'light',
  sidebarOpen: false,
  loading: {},
  notifications: [],
  searchQuery: '',
  searchFilters: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },
    toggleSidebar: state => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (
      state,
      action: PayloadAction<{ key: string; loading: boolean }>
    ) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload];
    },
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        autoHide: action.payload.autoHide ?? true,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: state => {
      state.notifications = [];
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchFilters: (
      state,
      action: PayloadAction<Partial<ArticleFilters>>
    ) => {
      state.searchFilters = action.payload;
    },
    updateSearchFilter: (
      state,
      action: PayloadAction<{
        key: keyof ArticleFilters;
        value: any;
      }>
    ) => {
      const { key, value } = action.payload;
      if (value === undefined || value === null || value === '') {
        delete state.searchFilters[key];
      } else {
        state.searchFilters[key] = value;
      }
    },
    clearSearchFilters: state => {
      state.searchFilters = {};
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  clearLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  setSearchQuery,
  setSearchFilters,
  updateSearchFilter,
  clearSearchFilters,
} = uiSlice.actions;

export { uiSlice };
