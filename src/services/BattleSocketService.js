import WebSocketService from './WebSocketService';

export const setupBattleWebSocket = (roomId, currentUser, navigate, setBattleResults, setRemainingTime, setRoomEnded, setBattleResultModal, setResults, setAllPassed, setActiveTab, roomEnded) => {
  const listenerId = `battle-${roomId}`;

  // Ensure any existing lobby WebSocket is closed
  const ensureConnection = () => {
    console.log('[WS INIT] Setup Battle WebSocket for room:', roomId, 'with user:', currentUser.username);
    if (WebSocketService.isConnected()) {
      console.log('[WS] Already connected, checking endpoint...');
      if (WebSocketService.getCurrentEndpoint() !== `/ws/battle/${roomId}/`) {
        console.log('[WS] Closing existing connection to switch to battle endpoint');
        WebSocketService.disconnect();
      }
    }
    if (!WebSocketService.isConnected()) {
      console.log('[WS] Connecting to battle WebSocket with token:', currentUser.token);
      WebSocketService.connect(currentUser.token, roomId, navigate, 'battle');
    }
  };

  WebSocketService.addListener(listenerId, (data) => {
    console.log('[WS RECEIVED]', data);

    switch (data.type) {
      case 'connected':
        console.log('[WS] Connected:', data.message);
        toast.info('Connected to battle room');
        break;

      case 'battle_started':
        console.log('[WS] Battle started with time limit:', data.time_limit);
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
        console.log('[WS] Submission result for', data.username, ':', data.result);
        toast.info(`Submission by ${data.username}: ${data.result.passed ? 'Passed' : 'Failed'}`);
        if (data.username === currentUser.username) {
          setResults(data.result.test_cases || []);
          setAllPassed(data.result.passed || false);
          setActiveTab('results');
        }
        break;

      case 'time_update':
        console.log('[WS] Time update:', data.remaining_seconds);
        setRemainingTime(data.remaining_seconds);
        localStorage.setItem(`battle_${roomId}_remainingTime`, data.remaining_seconds);
        break;

      case 'battle_completed':
      case 'battle_ended':
        console.log('[WS] Battle ended:', data.message);
        setBattleResults(data.winners || []);
        setRoomEnded(true);
        setBattleResultModal(true);
        toast.success(data.message || 'Battle Ended!', { autoClose: 3000 });
        localStorage.removeItem(`battle_${roomId}_remainingTime`);
        setTimeout(() => navigate('/user/rooms'), 3000);
        break;

      case 'room_closed':
        console.log('[WS] Room closed');
        toast.error('Room has been closed');
        navigate('/user/rooms');
        break;

      case 'error':
        console.error('[WS] Error:', data.message);
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