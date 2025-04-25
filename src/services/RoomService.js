import axios from 'axios';
import store from '../store'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchRooms = async () => {
  try {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    const response = await axios.get(`${API_BASE_URL}/rooms/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

export const createRoom = async (payload) => {
  try {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    const response = await axios.post(`${API_BASE_URL}/rooms/create/`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};