import WebSocketService from './WebSocketService';
export const setupBattleWebSocket = (roomId, currentUser, onUpdate) => {
  const ensureConnection = () => {
    console.log('[WS INIT] Setup Battle WebSocket for', roomId);
    if (!WebSocketService.isConnected()) {
      console.log('[WS] Not connected. Reconnecting with token...');
      WebSocketService.connect(currentUser.token, roomId, null, 'battle');
    }
  };

  

  const listenerId = `battle-${roomId}`;

  WebSocketService.addListener(listenerId, (data) => {
    console.log('[WS RECEIVED]', data);

    switch (data.type) {
      case 'battle_started':
        onUpdate({
          type: 'battle_started',
          start_time: data.start_time,
          time_limit: data.time_limit,
        });
        break;

      case 'code_verified':
        if (!data.roomEnded) {
          onUpdate({
            type: 'code_verified',
            username: data.username,
            position: data.position,
            completion_time: data.completion_time,
          });
        }
        break;

      case 'time_update':
        onUpdate({
          type: 'time_update',
          remaining_seconds: data.remaining_seconds,
        });
        break;

      case 'battle_completed':
        console.log('message came as battle completed is working well')
        onUpdate({
          type: 'battle_completed',
          winners: data.winners || [],
          room_capacity: data.room_capacity,
        });
        break;

      case 'start_countdown':
        onUpdate({
          type: 'start_countdown',
          countdown: data.countdown,
          question_id: data.question_id,
        });
        break;

      default:
        console.warn('[WS] Unknown event type:', data.type);
    }
  });

  // Periodically check connection and trigger reconnect
  const reconnectInterval = setInterval(() => {
    if (!WebSocketService.isConnected()) {
      console.log('[WS] Connection lost. Attempting to reconnect...');
      ensureConnection();
      onUpdate({ type: 'reconnect' });
    }
  }, 5000);

  return () => {
    console.log('[WS CLEANUP] Removing listener for', listenerId);
    WebSocketService.removeListener(listenerId);
    clearInterval(reconnectInterval);
  };
};

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};