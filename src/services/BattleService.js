// services/BattleService.js
import api from "../api";
import WebSocketService from "./WebSocketService";
import { toast } from 'react-toastify';

export const handleStartBattle = async ({ room, participants, currentUser, navigate }) => {
  console.log('Attempting to start battle', { roomId: room?.room_id, participants, currentUser });
  
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

  console.log('Checking battle start conditions', {
    isHost,
    participantCount: participants.length,
    minRequired,
    isRanked: room.is_ranked,
    readyNonHosts: readyNonHosts.length,
    nonHostCount: nonHostParticipants.length
  });

  if (participants.length < minRequired) {
    console.warn(`Insufficient participants: ${participants.length} < ${minRequired}`);
    toast.error(`At least ${minRequired} participants required to start`);
    return;
  }

  if (room.is_ranked && readyNonHosts.length < nonHostParticipants.length) {
    console.warn('Not all non-host participants are ready for ranked mode');
    toast.error('All non-host participants must be ready for ranked mode');
    return;
  }

  if (!isHost) {
    console.log('Non-host user waiting for battle to start...');
    toast.info('Waiting for host to start the battle');
    return;
  }

  try {
    console.log('Calling start room API:', `/rooms/${room.room_id}/start/`);
    const response = await api.post(`/rooms/${room.room_id}/start/`);
    console.log('Start room API response:', response.data);
    if (response.status !== 200) {
      console.error('Failed to start battle:', response.data);
      toast.error(response.data?.error || 'Failed to start battle');
      return;
    }

    if (!WebSocketService.isConnected()) {
      console.error('WebSocket not connected');
      toast.error('errorWebSocket connection lost. Please reconnect.');
      return;
    }

    console.log('Sending start_countdown WebSocket message', {
      type: 'start_countdown',
      countdown: 5,
      room_id: room.room_id,
      is_ranked: room.is_ranked,
      question_id: response.data.question_id
    });
    WebSocketService.sendMessage({
      type: 'start_countdown',
      countdown: 5,
      room_id: room.room_id,
      is_ranked: room.is_ranked,
      question_id: response.data.question_id
    });

  } catch (error) {
    console.error('Start battle error:', error.response?.data || error.message);
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