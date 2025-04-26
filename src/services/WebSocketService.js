const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_URL = API_BASE_URL.replace('http', 'ws') + '/ws/rooms/';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect(token) {
    if (this.socket) return;
    this.socket = new WebSocket(`${WS_URL}?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      Object.values(this.listeners).forEach((listener) => listener(data));
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.socket = null;
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
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
    }
  }
}

export default new WebSocketService();