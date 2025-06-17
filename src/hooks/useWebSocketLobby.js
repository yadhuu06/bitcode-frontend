import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import WebSocketService from '../services/WebSocketService';

const useWebSocketLobby = (roomId, accessToken, username) => {
  const navigate = useNavigate();
  const wsListenerId = useRef(`lobby-${roomId}`);
  const [participants, setParticipants] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [readyStatus, setReadyStatus] = useState({});
  const [isRoomClosed, setIsRoomClosed] = useState(false);
  const [isKicked, setIsKicked] = useState(false);
  const [lobbyMessages, setLobbyMessages] = useState([]);
  const [role, setRole] = useState('participant');

  useEffect(() => {
    if (!roomId || !accessToken) return;

    WebSocketService.connect(accessToken, roomId);

    const handleMessage = (data) => {
      console.log('WebSocket message received:', data);
      switch (data.type) {
        case 'participant_list':
        case 'participant_update': {
          const activeParticipants = (data.participants || []).filter((p) => p.status === 'joined');
          setParticipants(activeParticipants);
          setRole(
            activeParticipants.find((p) => p.user__username === username)?.role || 'participant'
          );
          break;
        }
        case 'countdown':
          setCountdown(data.countdown);
          break;
        case 'ready_status':
          setReadyStatus((prev) => ({ ...prev, [data.username]: data.ready }));
          break;
        case 'room_closed':
          setIsRoomClosed(true);
          setTimeout(() => navigate('/user/rooms'), 4000);
          break;
        case 'kicked':
          if (data.username === username) {
            setIsKicked(true);
            toast.error('You have been kicked from the room');
            WebSocketService.disconnect();
            setTimeout(() => navigate('/user/rooms'), 2000);
          }
          break;
        case 'participant_left':
          setLobbyMessages((prev) => {
            const updated = [...prev, `${data.username} left the lobby`];
            return updated.slice(-5);
          });
          break;
        case 'start_battle':
          navigate(`/battle/${roomId}/${data.question.id}`);
          break;
        case 'error':
          toast.error(data.message);
          if (
            data.message.includes('401') ||
            data.message.includes('4001') ||
            data.message.includes('4002') ||
            data.message.includes('Not authorized') ||
            data.code === 4005
          ) {
            navigate('/login');
          }
          break;
        default:
          console.warn('Unknown WebSocket message type:', data.type);
      }
    };

    WebSocketService.addListener(wsListenerId.current, handleMessage);

    return () => {
      WebSocketService.removeListener(wsListenerId.current);
      WebSocketService.disconnect();
    };
  }, [roomId, accessToken, username, navigate]);

  return {
    participants,
    setParticipants,
    countdown,
    setCountdown,
    readyStatus,
    setReadyStatus,
    isRoomClosed,
    isKicked,
    lobbyMessages,
    role,
    setRole,
  };
};

export default useWebSocketLobby;