// services/adminService.js
import api from '../api'; // Adjust path as needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Fetch dashboard data
export const getDashboardData = async (accessToken) => {
  try {
    const response = await api.get('/admin-panel/dashboard/', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch dashboard data');
  }
};

// Fetch all users
export const fetchUsers = async () => {
  try {
    const response = await api.get('/api/admin/users/');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch users');
  }
};

// Delete a user by ID
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/api/admin/users/${userId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to delete user');
  }
};

// Update a user's role
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.patch(`/api/admin/users/${userId}/role/`, { role }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }, 
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to update user role');
  }
};

export default { getDashboardData, fetchUsers, deleteUser, updateUserRole };