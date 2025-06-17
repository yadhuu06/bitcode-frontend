import { toast } from 'react-toastify';
import WebSocketService from '../services/WebSocketService';

export const initiateCountdown = (participants) => {
  if (participants.length < 1) {
    toast.error('At least one participant required');
    return;
  }
  WebSocketService.sendMessage({ type: 'start_countdown', countdown: 5 });
};

export const handleReadyToggle = (username, readyStatus, setReadyStatus) => {
  if (!username) {
    toast.error('User not authenticated');
    return;
  }
  const newReadyState = !readyStatus[username];
  WebSocketService.sendMessage({ type: 'ready_toggle', ready: newReadyState });
  setReadyStatus((prev) => ({ ...prev, [username]: newReadyState }));
};

export const handleKickParticipant = (role, targetUsername) => {
  if (role !== 'host') {
    toast.error('Only the host can kick participants');
    return;
  }
  WebSocketService.sendMessage({ type: 'kick_participant', username: targetUsername });
  toast.info(`Requested to kick ${targetUsername}`);
};

export const handleCopy = async (joinCode, setCopied) => {
  try {
    await navigator.clipboard.writeText(joinCode);
    setCopied(true);
    toast.success('Join code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Failed to copy join code:', err);
    toast.error('Failed to copy join code');
  }
};

export const handleLeaveRoom = (navigate) => {
  WebSocketService.sendMessage({ type: 'leave_room' });
  navigate('/user/rooms');
};

export const handleCloseRoom = (role, navigate) => {
  if (role !== 'host') {
    toast.error('Only the host can close the room');
    return;
  }
  WebSocketService.sendMessage({ type: 'close_room' });
  navigate('/user/rooms');
};