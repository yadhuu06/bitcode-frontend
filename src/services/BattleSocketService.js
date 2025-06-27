import WebSocketService from "./WebSocketService";


export const setupBattleWebSocket = (roomId, currentUser, onUpdate) => {
  WebSocketService.connect(currentUser.token, roomId, null, 'battle');
  WebSocketService.addListener('battle', (data) => {
    if (data.type === 'battle_started') {
      toast.success(data.message || 'Battle started!');
      onUpdate({ type: 'battle_started', start_time: data.start_time, time_limit: data.time_limit });
    } else if (data.type === 'code_verified') {
      toast.success(`${data.username} finished ${getOrdinal(data.position)}!`, { autoClose: 3000 });
      onUpdate({ type: 'code_verified', username: data.username, position: data.position, completion_time: data.completion_time });
    } else if (data.type === 'time_update') {
      onUpdate({ type: 'time_update', remaining_minutes: data.remaining_minutes });
    } else if (data.type === 'battle_completed') {
      toast.success(data.message || 'Battle completed!');
      onUpdate({ type: 'battle_completed', winners: data.winners });
    } else if (data.type === 'start_countdown') {
      toast.info(`Battle starting in ${data.countdown} seconds!`);
      onUpdate({ type: 'start_countdown', countdown: data.countdown, question_id: data.question_id });
    }
  });

  return () => WebSocketService.disconnect();
};

const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};