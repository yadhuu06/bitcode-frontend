// src/services/RoomService.js
import store from '../store'; // Adjust path as needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchRooms = async () => {
  try {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    const response = await fetch(`${API_BASE_URL}/api/rooms/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rooms');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

export const createRoom = async (payload) => {
  try {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    const response = await fetch(`${API_BASE_URL}/api/rooms/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};