
import api from '../api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { toast } from 'react-toastify';
import WebSocketService from './WebSocketService';

import { useNavigate } from 'react-router-dom';


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
    const response = await api.get(`/rooms/${roomId}/`)
    console.log("the response:",response)
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



export const handleStartBattle = async ({ room, participants, currentUser }) => {
  const navigate = useNavigate();

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

  try {

    await api.patch(`/rooms/${room.id}/status/`, { status: 'Playing' });


    const questionRes = await api.get(`/rooms/${room.id}/question/`);
    const question = questionRes.data;


    WebSocketService.sendMessage({
      type: 'start_battle',
      question: question,
      room_id: room.id,
    });


    navigate(`/battle/${room.id}`);
  } catch (error) {
    console.error('Start battle error:', error);
    toast.error('Failed to start battle');
  }
};
