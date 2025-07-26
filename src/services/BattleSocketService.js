import WebSocketService from './WebSocketService';

export const setupBattleWebSocket = (roomId, currentUser, navigate, setBattleResults, setRemainingTime, setRoomEnded, setBattleResultModal, setResults, setAllPassed, setActiveTab, roomEnded) => {
  const ensureConnection = () => {
    console.log('[WS INIT] Setup Battle WebSocket for', roomId);
    if (!WebSocketService.isConnected()) {
      console.log('[WS] Not connected. Reconnecting with token...');
      WebSocketService.connect(currentUser.token, roomId, navigate, 'battle');
    }
  };

  const listenerId = `battle-${roomId}`;

  WebSocketService.addListener(listenerId, (data) => {
    console.log('[WS RECEIVED]', data);

    switch (data.type) {
      case 'connected':
        console.log(data.message);
        break;

      case 'battle_started':
        const initialTime = data.time_limit * 60;
        setRemainingTime(initialTime);
        localStorage.setItem(`battle_${roomId}_remainingTime`, initialTime);
        break;

      case 'code_verified':
        if (!roomEnded) {
          setBattleResults((prev) => [
            ...prev.filter((entry) => entry.username !== data.username),
            { username: data.username, position: data.position, completion_time: data.completion_time },
          ]);
        }
        break;

      case 'submission_result':
        toast.info(`Submission by ${data.username}: ${data.result.passed ? 'Passed' : 'Failed'}`);
        if (data.username === currentUser.username) {
          setResults(data.result.test_cases || []);
          setAllPassed(data.result.passed || false);
          setActiveTab('results');
        }
        break;

      case 'time_update':
        setRemainingTime(data.remaining_seconds);
        localStorage.setItem(`battle_${roomId}_remainingTime`, data.remaining_seconds);
        break;

      case 'battle_completed':
      case 'battle_ended':
        setBattleResults(data.winners || []);
        setRoomEnded(true);
        setBattleResultModal(true);
        toast.success(data.message || 'Battle Ended!', { autoClose: 3000 });
        localStorage.removeItem(`battle_${roomId}_remainingTime`);
        navigate('/user/rooms');
        break;

      case 'room_closed':
        toast.error('Room has been closed');
        navigate('/user/rooms');
        break;

      case 'start_countdown':
        // Handle countdown if needed
        break;

      case 'error':
        toast.error(data.message || 'WebSocket error');
        if (
          data.message?.includes('401') ||
          data.message?.includes('4001') ||
          data.message?.includes('4002') ||
          data.message?.includes('Not authorized') ||
          data.code === 4005
        ) {
          navigate('/login');
        }
        break;

      default:
        console.warn('[WS] Unknown event type:', data.type);
    }
  });

  ensureConnection();

  const reconnectInterval = setInterval(() => {
    if (!WebSocketService.isConnected()) {
      console.log('[WS] Connection lost. Attempting to reconnect...');
      ensureConnection();
    }
  }, 5000);

  return () => {
    console.log('[WS CLEANUP] Removing listener for', listenerId);
    WebSocketService.removeListener(listenerId);
    WebSocketService.disconnect();
    clearInterval(reconnectInterval);
  };
};