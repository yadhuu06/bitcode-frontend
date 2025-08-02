import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import store from '../src/store';
import { updateTokens, logoutSuccess } from '../src/store/slices/authSlice';
import { showError } from './utils/toastManager'; //  NEW: Centralized toast handling

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

//  Clean helper to check token expiry
const isTokenExpiringSoon = (token) => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    const now = Date.now() / 1000;
    return exp - now < 600;
  } catch {
    return true;
  }
};

//  Token Refresh
const refreshAccessToken = async () => {
  const refreshToken = store.getState().auth.refreshToken || Cookies.get('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
      refresh: refreshToken,
    });

    const { access, refresh } = response.data;
    const newRefreshToken = refresh || refreshToken;

    store.dispatch(updateTokens({ accessToken: access, refreshToken: newRefreshToken }));
    Cookies.set('access_token', access, { secure: true, sameSite: 'Strict', expires: 1 });
    Cookies.set('refresh_token', newRefreshToken, { secure: true, sameSite: 'Strict', expires: 7 });

    return access;
  } catch (error) {

    //  Handled globally by toastManager if needed
    throw error;
  }
};

export const setupInterceptors = () => {
  //  REQUEST INTERCEPTOR
  api.interceptors.request.use(
    async (config) => {
      let accessToken = store.getState().auth.accessToken || Cookies.get('access_token');

      // Skip refresh call
      if (config.url.includes('/api/auth/token/refresh/')) {
        return config;
      }

      //  Token about to expire? Refresh
      if (accessToken && isTokenExpiringSoon(accessToken)) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            accessToken = await refreshAccessToken();
            processQueue(null, accessToken);
          } catch (error) {
            processQueue(error);
            store.dispatch(logoutSuccess());
            window.location.href = '/login';
            throw error;
          } finally {
            isRefreshing = false;
          }
        } else {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                config.headers['Authorization'] = `Bearer ${token}`;
                resolve(config);
              },
              reject,
            });
          });
        }
      }

      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  //  RESPONSE INTERCEPTOR
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (originalRequest.url.includes('/api/auth/token/refresh/')) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newToken = await refreshAccessToken();
            processQueue(null, newToken);
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError);
            store.dispatch(logoutSuccess());
            window.location.href = '/login';
            return Promise.reject(new Error('Session expired. Please log in again.'));
          } finally {
            isRefreshing = false;
          }
        } else {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                resolve(api(originalRequest));
              },
              reject,
            });
          });
        }
      }

      //  NEW: Global toast error handling (only if not silent)
      if (!originalRequest?.silent) {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Something went wrong';
        showError(message); //  Prevents duplicate toasts
      }

      return Promise.reject(error);
    }
  );
};

setupInterceptors();

export default api;
