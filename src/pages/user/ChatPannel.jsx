import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-toastify';
import WebSocketService from '../../services/WebSocketService';

const ChatPanel = ({ roomId, username }) => {
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
    const handleMessage = (data) => {
      if (data.type === 'chat_message') {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            user: data.sender,
            message: data.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: false,
          },
        ]);
      } else if (data.type === 'error') {
        toast.error(data.message);
      }
    };

    WebSocketService.addListener(listenerId, handleMessage);
    return () => {
      WebSocketService.removeListener(listenerId);
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    WebSocketService.sendMessage({
      type: 'chat_message',
      message: chatMessage,
      sender: username,
    });
    setChatMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isSystem ? 'justify-center' : 'justify-start'}`}>
            {msg.isSystem ? (
              <div className="bg-gray-800/50 px-3 py-1 rounded-full text-sm text-gray-400">{msg.message}</div>
            ) : (
              <div className="w-full max-w-[70%]">
                <div className="flex items-center mb-1">
                  <span className="font-medium text-sm text-[#00FF40]">{msg.user}</span>
                  <span className="text-gray-500 text-xs ml-2">{msg.time}</span>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg text-sm text-white border border-[#00FF40]/20">
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
          placeholder="Transmit message..."
          className="flex-1 bg-gray-800/50 border border-[#00FF40]/20 rounded-l-md p-3 text-sm placeholder-gray-500 focus:outline-none focus:border-[#00FF40] focus:ring-1 focus:ring-[#00FF40]"
          aria-label="Chat input"
        />
        <button
          onClick={handleSendMessage}
          disabled={!chatMessage.trim()}
          className={`px-3 rounded-r-md transition-all duration-300 ${
            chatMessage.trim()
              ? 'bg-[#00FF40] text-black hover:bg-[#22c55e]'
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