import api from '../api';
import store from '../store';
import Cookies from 'js-cookie';

export const fetchProfile = async () => {
  try {
    const response = await api.get('/api/auth/profile/');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch profile';
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
    console.error('Error updating profile:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile';
    throw new Error(errorMessage);
  }
};


export const logout = async () => {

  const state = store.getState();
  const refreshToken = state.auth.refreshToken || Cookies.get('refresh_token');

  if (!refreshToken) {
    throw new Error('No refresh token available for logout');
  }

  try {
    const response = await api.post('/api/auth/logout/', { refresh_token: refreshToken });
    return {
      message: response.data.message,
    };
  } catch (error) {
    console.error('Error during logout:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error || error.message || 'Logout failed';
    throw new Error(errorMessage);
  }
};
export const fetchUserContributions = async () => {
  try {
    const response = await api.get('questions/contributions/');
    return response.data;
  } catch (error) {
    throw new Error(JSON.stringify(error.response?.data || { error: 'Failed to fetch contributions' }));
  }
};