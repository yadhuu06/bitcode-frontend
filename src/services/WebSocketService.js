import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_ROOMS_PATH = import.meta.env.VITE_WS_ROOMS_PATH || '/ws/rooms/';
const WS_ROOM_PATH = import.meta.env.VITE_WS_ROOM_PATH || '/ws/room/';
const WS_BATTLE_PATH = import.meta.env.VITE_WS_BATTLE_PATH || '/ws/battle/';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.token = null;
    this.roomId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.heartbeatInterval = 15000;
    this.pingIntervalId = null;
    this.reconnectTimeoutId = null;
    this.lastPongReceived = null;
    this.pongTimeout = 10000;
    this.pongTimeoutId = null;
  }

  connect(token, roomId = null, navigate = null, type = 'room') {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    this.token = token;
    this.roomId = roomId;

    const baseWsUrl = API_BASE_URL.replace(/^http/, 'ws');
    let wsPath;
    if (type === 'battle') {
      wsPath = `${WS_BATTLE_PATH}${roomId}/`;
    } else {
      wsPath = roomId ? `${WS_ROOM_PATH}${roomId}/` : WS_ROOMS_PATH;
    }

    const wsUrl = `${baseWsUrl}${wsPath}?token=${token}`;
    console.log(`Connecting to WebSocket: ${wsUrl}`);

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this._startHeartbeat();

      if (roomId && type === 'room') {
        this.sendMessage({ type: 'request_participants' });
        this.sendMessage({ type: 'request_chat_history' });
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'pong') {
          this.lastPongReceived = Date.now();
          return;
        }

        if (data.type === 'error') {
          toast.error(data.message || 'An error occurred');
        } else {
          // Delegate all other messages to listeners (e.g., BattleSocketService)
          this.notifyListeners(data);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
        toast.error('Invalid message received from server');
      }
    };

    this.socket.onclose = (event) => {
      console.warn('WebSocket disconnected:', event.code, event.reason);
      this.socket = null;
      this._stopHeartbeat();

      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this._tryReconnect(navigate);
      } else {
        console.error('WebSocket closed permanently:', event.code, event.reason);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Service disconnected');
      this.socket = null;
    }
    this._stopHeartbeat();
    if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);
    if (this.pongTimeoutId) clearTimeout(this.pongTimeoutId);
    this.listeners = {};
    this.token = null;
    this.roomId = null;
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  addListener(id, callback) {
    this.listeners[id] = callback;
  }

  removeListener(id) {
    delete this.listeners[id];
  }

  sendMessage(message) {
    if (this.isConnected()) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message, socket not open');
    }
  }

  notifyListeners(data) {
    Object.values(this.listeners).forEach((listener) => listener(data));
  }

  _tryReconnect(navigate) {
    this.reconnectAttempts += 1;
    console.log(`Reconnecting... attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    this.reconnectTimeoutId = setTimeout(() => {
      this.connect(this.token, this.roomId, navigate);
    }, this.reconnectDelay);
  }

  _startHeartbeat() {
    this.lastPongReceived = Date.now();
    this.pingIntervalId = setInterval(() => {
      if (!this.isConnected()) {
        this._stopHeartbeat();
        return;
      }
      this.sendMessage({ type: 'ping' });
      this.pongTimeoutId = setTimeout(() => {
        if (Date.now() - this.lastPongReceived > this.pongTimeout) {
          console.warn('No pong received, closing connection');
          this.disconnect();
        }
      }, this.pongTimeout);
    }, this.heartbeatInterval);
  }

  _stopHeartbeat() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
    if (this.pongTimeoutId) {
      clearTimeout(this.pongTimeoutId);
      this.pongTimeoutId = null;
    }
  }
}

export default new WebSocketService();