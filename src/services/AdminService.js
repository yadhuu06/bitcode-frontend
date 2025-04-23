// src/services/AdminService.js
import store from '../store'; // Adjust path as needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchUsers = async () => {
  try {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    const response = await fetch(`${API_BASE_URL}/api/admin/users/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user role');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};