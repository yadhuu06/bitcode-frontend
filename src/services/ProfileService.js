import api from '../api';
import store from '../store';
import Cookies from 'js-cookie';

// Fetch the user's profile data
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

// Update the user's profile (username and profile picture)
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

// Logout function
export const logout = async () => {
  // Retrieve refreshToken from Redux state or cookies
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