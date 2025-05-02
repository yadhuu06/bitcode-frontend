import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import store from '../src/store';
import { updateTokens, logoutSuccess } from '../src/store/slices/authSlice';

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

const isTokenExpiringSoon = (token) => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    const now = Date.now() / 1000;
    return exp - now < 600; // 10-minute buffer for smoother refresh
  } catch {
    return true; // Assume expired if token is invalid
  }
};

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

    // Always use new refresh token if provided, otherwise keep the old one
    const newRefreshToken = refresh || refreshToken;
    store.dispatch(updateTokens({ accessToken: access, refreshToken: newRefreshToken }));
    Cookies.set('access_token', access, { secure: true, sameSite: 'Strict', expires: 30 / (24 * 60) });
    Cookies.set('refresh_token', newRefreshToken, { secure: true, sameSite: 'Strict', expires: 7 });

    return access;
  } catch (error) {
    // Log the error for debugging
    console.error('Token refresh failed:', error.message);
    throw new Error('Unable to refresh token');
  }
};

export const setupInterceptors = () => {
  api.interceptors.request.use(
    async (config) => {
      let accessToken = store.getState().auth.accessToken || Cookies.get('access_token');

      // Skip token check for refresh endpoint to avoid infinite loop
      if (config.url.includes('/api/auth/token/refresh/')) {
        return config;
      }

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
          // Queue the request until refresh is complete
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

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Skip retry for refresh endpoint to avoid infinite loop
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
          // Queue the request until refresh is complete
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

      return Promise.reject(error);
    }
  );
};

setupInterceptors();

export default api;