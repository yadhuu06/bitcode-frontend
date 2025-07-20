// src/store/slices/loadingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  message: 'Loading...',
  progress: null, 
  style: 'default'
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setLoading(state, action) {
      const { isLoading, message, progress, style } = action.payload;
      state.isLoading = isLoading;
      state.message = message || initialState.message;
      state.progress = progress !== undefined ? progress : state.progress;
      state.style = style || initialState.style;
    },
    resetLoading(state) {
      console.log('resetting loggin')
      
      state.isLoading = false;
      state.message = initialState.message;
      state.progress = null;
      state.style = initialState.style;
    },
  },
});

export const { setLoading, resetLoading } = loadingSlice.actions;
export default loadingSlice.reducer;