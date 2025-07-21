import api from '../api';


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

export const getRoomDetails = async (roomId, accessToken) => {
  try {
    const response = await api.get(`/rooms/${roomId}/`);
    console.log("the response:", response);
    return {
      room: response.data.room,
      participants: response.data.participants,
      current_user: response.data.current_user,
    };
  } catch (error) {
    const errMsg = error.response?.data?.error || error.message;

    if (error.response?.status === 403 && errMsg.includes('not authorised')) {
     
    } else {
      
    }

    throw errMsg;
  }
};

