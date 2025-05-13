
import store from '../store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchUserProfile = async () => {
  try {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    const response = await fetch(`${API_BASE_URL}/api/users/profile/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    const response = await fetch(`${API_BASE_URL}/api/users/profile/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

