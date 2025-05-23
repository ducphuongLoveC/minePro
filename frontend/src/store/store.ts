import { configureStore } from '@reduxjs/toolkit';
import serverOptionsReducer from './features/serverOptions';

export const store = configureStore({
  reducer: {
    serverOptions: serverOptionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
