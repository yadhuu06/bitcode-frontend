import api from '../api';
import { toast } from 'react-toastify';
import WebSocketService from './WebSocketService';




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
      toast.error('You are not authorised to view this room');
    } else {
      toast.error('Failed to load room details');
    }

    throw errMsg;
  }
};
export const handleStartBattle = async ({ room, participants, currentUser, navigate }) => {
  if (!room?.room_id) {
    console.error('Invalid room_id:', room?.room_id);
    toast.error('Invalid room ID. Cannot start battle.');
    return;
  }

  const isHost = participants.find(p => p.user__username === currentUser)?.role === 'host';
  const capacity = room.capacity;
  const nonHostParticipants = participants.filter(p => p.role !== 'host');
  const readyNonHosts = nonHostParticipants.filter(p => p.ready);
  let minRequired = 2;
  if (capacity === 5) minRequired = 3;
  else if (capacity === 10) minRequired = 6;

  if (participants.length < minRequired) {
    toast.error(`At least ${minRequired} participants required to start`);
    return;
  }

  if (readyNonHosts.length < nonHostParticipants.length) {
    toast.error('All non-host participants must be ready');
    return;
  }

  if (!isHost) {
    console.log('Non-host user waiting for battle to start...');
    return;
  }

  try {

    await api.get(`/rooms/${room.room_id}/`);


    await api.post(`/rooms/${room.room_id}/start/`);

    if (!WebSocketService.isConnected()) {
      toast.error('WebSocket connection lost. Please reconnect.');
      return;
    }


    WebSocketService.sendMessage({
      type: 'battle_started',
      room_id: room.room_id,
    });
    console.log("the room id is ",room.room_id)
    console.log("the question id is ",room.room_id)
    
    



  } catch (error) {
    console.error('Start battle error:', error);
    if (error.response?.status === 404) {
      toast.error('Room not found or inactive. It may have been closed.');
    } else if (error.response?.status === 403) {
      toast.error('Only the host can start the battle.');
    } else if (error.response?.status === 400) {
      toast.error(error.response?.data?.error || 'Failed to start battle due to insufficient participants or readiness.');
    } else {
      toast.error(error.response?.data?.error || 'Failed to start battle');
    }
  }
};