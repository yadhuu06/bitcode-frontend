import api from '../api';
import store from '../store';
import Cookies from 'js-cookie';
import { showError } from '../utils/toastManager'; 

export const fetchProfile = async () => {
  try {
    const response = await api.get('/api/auth/profile/');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch profile';
    showError(errorMessage);
    throw new Error(errorMessage);
  }
};

export const updateProfile = async (formData) => {
  try {
    const response = await api.patch('/api/auth/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile';
    showError(errorMessage);
    throw new Error(errorMessage);
  }
};

export const logout = async () => {
  const state = store.getState();
  const refreshToken = state.auth.refreshToken || Cookies.get('refresh_token');

  if (!refreshToken) {
    const msg = 'No refresh token available for logout';
    showError(msg);
    throw new Error(msg);
  }

  try {
    const response = await api.post('/api/auth/logout/', { refresh_token: refreshToken });
    return {
      message: response.data.message,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Logout failed';
    showError(errorMessage);
    throw new Error(errorMessage);
  }
};

export const fetchUserContributions = async () => {
  try {
    const response = await api.get('questions/contributions/');
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to fetch contributions';
    showError(msg);
    throw new Error(msg);
  }
};

export const getImageKitAuthParams = async () => {
  try {
    const response = await api.get('/api/auth/imagekit/', {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const msg = 'Failed to get ImageKit auth params';
    showError(msg);
    throw new Error(msg);
  }
};
