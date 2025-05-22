import api from '../api'; // Adjust path to where your api.js file is located

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch all users
export const fetchUsers = async () => {
  try {
    const response = await api.get('/api/admin/users/');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.message);
    throw error;
  }
};

// Delete a user by ID
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/api/admin/users/${userId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error.message);
    throw error;
  }
};

// Update a user's role
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.patch(`/api/admin/users/${userId}/role/`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error.message);
    throw error;
  }
};