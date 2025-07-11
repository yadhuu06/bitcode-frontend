import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import loadingReducer from './slices/loadingSlice';
import roomReducer from './slices/roomSlice';
import dashboardReducer from './slices/dashboardSlice';
import usersReducer from './slices/usersSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    loading: loadingReducer,
    rooms: roomReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredActionPaths: [
          'payload.created_at',
          'payload.updated_at',
          'payload.completion_time',
        ],
        ignoredPaths: [
          'auth.created_at',
          'rooms.created_at',
          'dashboard.topUsers.created_at',
          'users.users.created_at',
        ],
      },
    }),
});

export default store;