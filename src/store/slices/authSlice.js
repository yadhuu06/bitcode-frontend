// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  user: null,
  accessToken: Cookies.get('access_token') || null,
  refreshToken: Cookies.get('refresh_token') || null,
  isAuthenticated: !!Cookies.get('access_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      Cookies.set('access_token', accessToken, { secure: true, sameSite: 'Strict', expires: 30 / (24 * 60) });
      Cookies.set('refresh_token', refreshToken, { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('role', user.role, { secure: true, sameSite: 'Strict', expires: 7 });
    },
    logoutSuccess(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('role');
    },
    updateTokens(state, action) {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      Cookies.set('access_token', accessToken, { secure: true, sameSite: 'Strict', expires: 30 / (24 * 60) });
      Cookies.set('refresh_token', refreshToken, { secure: true, sameSite: 'Strict', expires: 7 });
    },
  },
});

export const { loginSuccess, logoutSuccess, updateTokens } = authSlice.actions;
export default authSlice.reducer;