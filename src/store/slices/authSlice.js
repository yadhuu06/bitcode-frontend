import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  user: Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null,
  accessToken: Cookies.get('access_token') || null,
  refreshToken: Cookies.get('refresh_token') || null,
  username: Cookies.get('username') || null,
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
      state.username = user?.username || state.username;
      Cookies.set('user', JSON.stringify(user), { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('access_token', accessToken, { secure: true, sameSite: 'Strict', expires: 30 / (24 * 60) });
      Cookies.set('refresh_token', refreshToken, { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('role', user?.role || 'user', { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('username', state.username, { secure: true, sameSite: 'Strict', expires: 7 });
    },
    logoutSuccess(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.username = null;
      state.isAuthenticated = false;
      Cookies.remove('user');
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('role');
      Cookies.remove('username');
    },
    updateTokens(state, action) {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      Cookies.set('access_token', accessToken, { secure: true, sameSite: 'Strict', expires: 30 / (24 * 60) });
      Cookies.set('refresh_token', refreshToken, { secure: true, sameSite: 'Strict', expires: 7 });
    },
    updateProfile(state, action) {
      const { user } = action.payload;
      state.user = user;
      state.username = user?.username || state.username;
      Cookies.set('user', JSON.stringify(user), { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('username', state.username, { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('role', user?.role || 'user', { secure: true, sameSite: 'Strict', expires: 7 });
    },
  },
});

export const { loginSuccess, logoutSuccess, updateTokens, updateProfile } = authSlice.actions;
export default authSlice.reducer;