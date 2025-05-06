const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_URL = API_BASE_URL.replace('http', 'ws') + '/ws/rooms/';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.token = null;

    // Reconnect settings
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 seconds

    // Heartbeat settings
    this.heartbeatInterval = 10000; // 10 seconds
    this.pingIntervalId = null;
    this.reconnectTimeoutId = null;
  }

  connect(token) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    this.token = token;
    this.socket = new WebSocket(`${WS_URL}?token=${token}`);

    this.socket.onopen = () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
      this._startHeartbeat();
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== 'pong') {
        Object.values(this.listeners).forEach((listener) => listener(data));
      }
    };

    this.socket.onclose = () => {
      console.warn('⚠️ WebSocket disconnected');
      this.socket = null;
      this._stopHeartbeat();
      this._tryReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this._stopHeartbeat();
    if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);
  }

  addListener(id, callback) {
    this.listeners[id] = callback;
  }

  removeListener(id) {
    delete this.listeners[id];
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('🕳️ Cannot send message, socket not open');
    }
  }

  _tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🛑 Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts += 1;
    this.reconnectTimeoutId = setTimeout(() => {
      console.log(`🔁 Reconnecting... attempt ${this.reconnectAttempts}`);
      this.connect(this.token);
    }, this.reconnectDelay);
  }

  _startHeartbeat() {
    this.pingIntervalId = setInterval(() => {
      this.sendMessage({ type: 'ping' });
    }, this.heartbeatInterval);
  }

  _stopHeartbeat() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }
}

export default new WebSocketService();
