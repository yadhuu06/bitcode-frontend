import WebSocketService from './WebSocketService';
import { toast } from 'react-toastify';

export const setupBattleWebSocket = (roomId, currentUser, onUpdate) => {
  const ensureConnection = () => {
    if (!WebSocketService.isConnected()) {
      console.log('WebSocket not connected, forcing connection for battle:', roomId);
      WebSocketService.connect(currentUser.token, roomId, null, 'battle');
    }
  };

  ensureConnection();

  const listenerId = `battle-${roomId}`;
  WebSocketService.addListener(listenerId, (data) => {
    console.log('Battle WebSocket message received:', data);
    if (data.type === 'battle_started') {
      toast.success(data.message || 'Battle started!');
      onUpdate({ type: 'battle_started', start_time: data.start_time, time_limit: data.time_limit });
    } else if (data.type === 'code_verified' && !data.roomEnded) {
      toast.success(`${data.username} finished ${getOrdinal(data.position)}!`, { autoClose: 3000 });
      onUpdate({ type: 'code_verified', username: data.username, position: data.position, completion_time: data.completion_time });
    } else if (data.type === 'time_update') {
      onUpdate({ type: 'time_update', remaining_seconds: data.remaining_seconds });
    } else if (data.type === 'battle_completed') {
      toast.success(data.message || 'Room Ended!', { autoClose: 3000 });
      onUpdate({ type: 'battle_completed', winners: data.winners, room_capacity: data.room_capacity });
    } else if (data.type === 'start_countdown') {
      toast.info(`Battle starting in ${data.countdown} seconds!`);
      onUpdate({ type: 'start_countdown', countdown: data.countdown, question_id: data.question_id });
    }
  });

  return () => {
    WebSocketService.removeListener(listenerId);
    // Do not disconnect here to allow multiple listeners; disconnect handled in Battle.jsx cleanup
  };
};

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};