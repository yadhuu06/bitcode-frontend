// src/store/index.js
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
});

export default store;