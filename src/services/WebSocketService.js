const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.token = null;
    this.roomId = null;

    // Reconnect settings
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;

    // Heartbeat settings
    this.heartbeatInterval = 10000; 
    this.pingIntervalId = null;
    this.reconnectTimeoutId = null;
  }

  connect(token, roomId = null) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    this.token = token;
    this.roomId = roomId;
    const baseWsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws/rooms/`;
    const wsUrl = roomId ? `${baseWsUrl}${roomId}/?token=${token}` : `${baseWsUrl}?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
      this._startHeartbeat();
      if (roomId) {
        this.sendMessage({ type: 'request_participants' });
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'pong') {
          Object.values(this.listeners).forEach((listener) => listener(data));
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    this.socket.onclose = (event) => {
      console.warn('⚠️ WebSocket disconnected:', event.code, event.reason);
      this.socket = null;
      this._stopHeartbeat();
      if (event.code !== 1000) {
        this._tryReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Service disconnected');
      this.socket = null;
    }
    this._stopHeartbeat();
    if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);
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
      this.connect(this.token, this.roomId);
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