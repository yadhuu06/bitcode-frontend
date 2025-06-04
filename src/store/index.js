import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import loadingReducer from './slices/loadingSlice';
import roomReducer from './slices/roomSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    loading: loadingReducer,
    rooms: roomReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredActionPaths: ['payload.created_at', 'payload.updated_at'],
        ignoredPaths: ['auth.created_at', 'rooms.created_at'],
      },
    }),
  
});

export default store;