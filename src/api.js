import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; 
import  store  from '../src/store';
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
    return exp - now < 300; // 5-minute buffer
  } catch {
    return true;
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
    store.dispatch(updateTokens({ accessToken: access, refreshToken: refresh || refreshToken }));
    Cookies.set('access_token', access, { secure: true, sameSite: 'Strict', expires: 30 / (24 * 60) });
    Cookies.set('refresh_token', refresh || refreshToken, { secure: true, sameSite: 'Strict', expires: 7 });
    return access;
  } catch (error) {
    throw new Error('Token refresh failed');
  }
};

export const setupInterceptors = () => {
  api.interceptors.request.use(
    async (config) => {
      let accessToken = store.getState().auth.accessToken || Cookies.get('access_token');
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
              resolve: () => resolve(config),
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
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

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
      }
      return Promise.reject(error);
    }
  );
};

setupInterceptors();

export default api;