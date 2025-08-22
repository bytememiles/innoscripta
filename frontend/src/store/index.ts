import { configureStore } from '@reduxjs/toolkit';

import { newsApi } from './api/newsApi';
import { uiSlice } from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    [newsApi.reducerPath]: newsApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [newsApi.util.resetApiState.type],
      },
    }).concat(newsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
