// hooks/useBattle.js
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import WebSocketService from '../services/WebSocketService';

const useBattle = (roomId, questionId, user, setResults, setAllPassed, setActiveTab) => {
  const navigate = useNavigate();
  const wsListenerId = useRef(`battle-${roomId}`);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for WebSocket connection');
      toast.error('Authentication required');
      navigate('/login');
      return;
    }

    WebSocketService.connect(token, roomId, navigate, 'battle');
    const handleMessage = (data) => {
      console.log('WebSocket message received:', data);
      switch (data.type) {
        case 'connected':
          console.log(data.message);
          break;
        case 'submission_result':
          toast.info(`Submission by ${data.username}: ${data.result.passed ? 'Passed' : 'Failed'}`);
          if (data.username === user?.username) {
            setResults(data.result.test_cases || []);
            setAllPassed(data.result.passed || false);
            setActiveTab('results');
          }
          break;
        case 'battle_ended':
          toast.success('Battle ended!');
          navigate('/user/rooms');
          break;
        case 'room_closed':
          toast.error('Room has been closed');
          navigate('/user/rooms');
          break;
        case 'error':
          toast.error(data.message || 'WebSocket error');
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
      console.log('Cleaning up WebSocket listener in useBattle');
      WebSocketService.removeListener(wsListenerId.current);
      WebSocketService.disconnect();
    };
  }, [roomId, questionId, user, navigate, setResults, setAllPassed, setActiveTab]);
};

export default useBattle;