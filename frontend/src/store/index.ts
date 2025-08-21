import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { uiSlice } from './slices/uiSlice';
import { newsApi } from './api/newsApi';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
    [newsApi.reducerPath]: newsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [newsApi.util.resetApiState.type],
      },
    }).concat(newsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
