import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-toastify';
import WebSocketService from '../../services/WebSocketService';

const ChatPanel = ({ roomId, username, isActiveTab }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'System',
      message: 'Welcome to the battle lobby!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    },
  ]);
  const [chatMessage, setChatMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const listenerId = `chat-${roomId}`;
    console.log(`Registering WebSocket listener: ${listenerId}`);


    WebSocketService.sendMessage({ type: 'request_chat_history', room_id: roomId });

    const handleMessage = (data) => {
      console.log(`Received message: ${JSON.stringify(data)}`);
      if (data.type === 'chat_message') {
        setMessages((prev) => {

          if (
            data.sender === username &&
            prev.some((msg) => msg.message === data.message && msg.user === data.sender)
          ) {
            return prev;
          }
          // Skip if message ID already exists
          if (!prev.some((msg) => msg.id === data.id)) {
            return [
              ...prev,
              {
                id: data.id || prev.length + 1,
                user: data.sender,
                message: data.message,
                time: data.timestamp
                  ? new Date(data.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystem: data.is_system || false,
              },
            ];
          }
          return prev;
        });
      } else if (data.type === 'chat_history') {
        const historyMessages = data.messages.map((msg, index) => ({
          id: msg.id || index + 2,
          user: msg.sender,
          message: msg.message,
          time: msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: msg.is_system,
        }));
        setMessages((prev) => {
          const existingMessages = prev.slice(1); // Keep initial system message
          const newMessages = historyMessages.filter(
            (msg) => !existingMessages.some((existing) => existing.id === msg.id)
          );
          return [prev[0], ...newMessages];
        });
      } else if (data.type === 'room_closed') {
        setMessages([
          {
            id: 1,
            user: 'System',
            message: 'Room closed. Chat cleared.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
          },
        ]);
        toast.info('Room has been closed');
      } else if (data.type === 'error') {
        toast.error(data.message);
      }
    };

    WebSocketService.addListener(listenerId, handleMessage);
    return () => {
      console.log(`Removing WebSocket listener: ${listenerId}`);
      WebSocketService.removeListener(listenerId);
    };
  }, [roomId, username]);

  useEffect(() => {
    if (messagesEndRef.current && isActiveTab) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isActiveTab]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const payload = {
      type: 'chat_message',
      message: chatMessage,
      sender: username,
      room_id: roomId,
      timestamp: new Date().toISOString(),
    };

    WebSocketService.sendMessage(payload);
    setChatMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.isSystem
                ? 'justify-center'
                : msg.user === username
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            {msg.isSystem ? (
              <div className="bg-gray-800/50 px-3 py-1 rounded-full text-sm text-gray-400">
                {msg.message}
              </div>
            ) : (
              <div className={`w-full max-w-[70%] ${msg.user === username ? 'ml-auto' : ''}`}>
                <div className="flex items-center mb-1">
                  <span className="font-medium text-sm text-[#00FF40]">{msg.user}</span>
                  <span className="text-gray-500 text-xs ml-2">{msg.time}</span>
                </div>
                <div
                  className={`p-3 rounded-lg text-sm text-white border ${
                    msg.user === username
                      ? 'bg-[#00FF40]/20 border-[#00FF40]/40'
                      : 'bg-gray-800 border-[#00FF40]/20'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex">
        <input
          type="text"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Transmit message..."
          className="flex-1 bg-gray-800/50 border border-[#00FF40]/20 rounded-l-md p-3 text-sm placeholder-gray-500 focus:outline-none focus:border-[#00FF40] focus:ring-1 focus:ring-[#00FF40]"
          aria-label="Chat input"
        />
        <button
          onClick={handleSendMessage}
          disabled={!chatMessage.trim()}
          className={`px-3 rounded-r-md transition-colors ${
            chatMessage.trim()
              ? 'bg-[#00FF40] text-black hover:bg-[#00e636]'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;