import axios from 'axios';
import store from '../store';
import api from '../api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchRooms = async () => {
  try {
    const response = await api.get('/rooms/');
    return response.data.rooms;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error.response?.data?.error || error.message;
  }
};

export const createRoom = async (payload) => {
  try {
    const response = await api.post('/rooms/create/', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error.response?.data || error;
  }
};
export const getRoomDetails = async (roomId) => {
  try {
    const response = await api.get(`/rooms/${roomId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching room details:', error);
    throw error.response?.data?.error || error.message;
  }
};