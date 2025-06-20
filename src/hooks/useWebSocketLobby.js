// hooks/useWebSocketLobby.js
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import WebSocketService from '../services/WebSocketService';
import api from '../api';

const useWebSocketLobby = (roomId, accessToken, username, setRole) => {
  const navigate = useNavigate();
  const wsListenerId = useRef(`lobby-${roomId}`);
  const [participants, setParticipants] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [readyStatus, setReadyStatus] = useState({});
  const [isRoomClosed, setIsRoomClosed] = useState(false);
  const [isKicked, setIsKicked] = useState(false);
  const [lobbyMessages, setLobbyMessages] = useState([]);
  const [assignedQuestion, setAssignedQuestion] = useState(null);

  useEffect(() => {
    if (!roomId || !accessToken || !username) return;

    console.log('Initiating WebSocket connection in useWebSocketLobby', { roomId, accessToken, username });
    WebSocketService.connect(accessToken, roomId, navigate);

    const handleMessage = (data) => {
      console.log('WebSocket message received:', JSON.stringify(data, null, 2));
      switch (data.type) {
        case 'participant_list':
        case 'participant_update': {
          const activeParticipants = (data.participants || []).filter((p) => p.status === 'joined');
          console.log('Active participants:', activeParticipants);
          setParticipants(activeParticipants);
          const currentUser = (data.participants || []).find((p) => p.user__username === username);
          console.log('Current user data:', currentUser);
          if (currentUser?.role) {
            console.log(`Updating role to ${currentUser.role} for user ${username}`);
            setRole(currentUser.role);
          } else {
            console.warn(`No role found for user ${username} in participants`);
          }
          break;
        }

        case 'battle_ready': {
          console.log('Battle ready received with question:', data.question);
          setAssignedQuestion(data.question); // Store question
          break;
        }

        case 'countdown': {
          setCountdown(data.countdown);
          break;
        }

        case 'ready_status': {
          setReadyStatus((prev) => ({ ...prev, [data.username]: data.ready }));
          break;
        }

        case 'battle_started': {
          console.log('Battle started navigating to battle page...', data);
          navigate(`/battle/${data.room_id}/${data.question.id}`);
          toast.success("Battle Started!");
          break;
        }

        case 'room_closed': {
          setIsRoomClosed(true);
          toast.error('Room has been closed');
          setTimeout(() => navigate('/user/rooms'), 4000);
          break;
        }

        case 'kicked': {
          if (data.username === username) {
            setIsKicked(true);
            toast.error('You have been kicked from the room');
            WebSocketService.disconnect();
            setTimeout(() => navigate('/user/rooms'), 2000);
          }
          break;
        }

        case 'participant_left': {
          setLobbyMessages((prev) => {
            const message = `${data.username} left the lobby`;
            if (prev.includes(message)) return prev;
            const updated = [...prev, message];
            return updated.slice(-5);
          });
          break;
        }

        case 'error': {
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
        }

        default: {
          console.warn('Unknown WebSocket message type:', data.type);
        }
      }
    };

    WebSocketService.addListener(wsListenerId.current, handleMessage);

    if (WebSocketService.isConnected()) {
      console.log('Requesting participant list on WebSocket connect');
      WebSocketService.sendMessage({ type: 'request_participants' });
    } else {
      const listenerId = `connect-${roomId}`;
      const onConnect = () => {
        console.log('WebSocket connected, requesting participant list');
        WebSocketService.sendMessage({ type: 'request_participants' });
        WebSocketService.removeListener(listenerId);
      };
      WebSocketService.addListener(listenerId, onConnect);
    }

    return () => {
      console.log('Cleaning up WebSocket listener in useWebSocketLobby');
      WebSocketService.removeListener(wsListenerId.current);
    };
  }, [roomId, accessToken, navigate, username, setRole]);

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
    assignedQuestion,
  };
};

export default useWebSocketLobby;