import React, { useState, useEffect, useRef, memo } from 'react';
import { Users, Clock, Send, Play, Shield, UserX } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getRoomDetails } from '../../services/RoomService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BitCodeProgressLoading = memo(({ message }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-[#00FF40] to-[#22c55e] rounded-full flex items-center justify-center animate-spin">
        <span className="text-black font-mono text-sm">LOADING</span>
      </div>
      <p className="mt-4 text-[#00FF40] font-mono text-sm">{message}</p>
    </div>
  </div>
));

const BattleWaitingLobby = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const username = useSelector((state) => state.auth.username);
  const [activeTab, setActiveTab] = useState('details');
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [role, setRole] = useState(location.state?.role || '');
  const [roomDetails, setRoomDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, user: 'System', message: 'Welcome to the battle lobby!', time: currentTime, isSystem: true },
  ]);
  const [chatMessage, setChatMessage] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 2000;

  const rules = [
    'Complete challenges within the allocated time.',
    'Points awarded for solution accuracy and speed.',
    'External resources are prohibited during the battle.',
    'Maintain respect and fair play among participants.',
  ];

  // Initialize room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      setIsLoading(true);
      try {
        let roomData;
        if (location.state) {
          roomData = {
            roomId,
            roomName: location.state.roomName,
            isPrivate: location.state.visibility === 'private',
            joinCode: location.state.joinCode,
            difficulty: location.state.difficulty,
            timeLimit: location.state.timeLimit,
            capacity: location.state.capacity,
            participantCount: location.state.participantCount || 1,
            status: 'active',
          };
          setParticipants(location.state.participants || []);
          setRole(location.state.role || '');
        } else {
          const response = await getRoomDetails(roomId, accessToken);
          roomData = {
            roomId,
            roomName: response.room.name,
            isPrivate: response.room.visibility === 'private',
            joinCode: response.room.join_code,
            difficulty: response.room.difficulty,
            timeLimit: response.room.time_limit,
            capacity: response.room.capacity,
            participantCount: response.room.participant_count,
            status: response.room.status,
          };
          setParticipants(response.participants || []);
        }
        setRoomDetails(roomData);
      } catch (err) {
        console.error('Error fetching room details:', err);
        toast.error('Failed to load room details');
        navigate('/user/rooms');
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken && roomId) {
      fetchRoomDetails();
    } else {
      toast.error('Invalid room data or session');
      navigate('/user/rooms');
    }
  }, [location, navigate, roomId, accessToken]);

  // WebSocket handling
  useEffect(() => {
    if (!roomId || !accessToken) return;

    const connectWebSocket = () => {
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
        toast.error('Failed to connect to room. Please try again.');
        navigate('/user/rooms');
        return;
      }

      const wsURL = `${API_BASE_URL.replace('http', 'ws')}/ws/rooms/${roomId}/?token=${accessToken}`;
      socketRef.current = new WebSocket(wsURL);

      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
        socketRef.current.send(JSON.stringify({ type: 'request_participants' }));
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);

        if (data.type === 'participant_list' || data.type === 'participant_update') {
          setParticipants(data.participants);
          setRoomDetails((prev) => (prev ? { ...prev, participantCount: data.participants.length } : prev));
          if (!role) {
            const userParticipant = data.participants.find((p) => p.user__username === username);
            if (userParticipant) setRole(userParticipant.role);
          }
        } else if (data.type === 'chat_message') {
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
        } else if (data.type === 'countdown') {
          setCountdown(data.countdown);
        } else if (data.type === 'error') {
          toast.error(data.message);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socketRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code);
        if (event.code !== 1000) { // Normal closure
          reconnectAttempts.current += 1;
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current); // Exponential backoff
          console.log(`Reconnecting WebSocket, attempt ${reconnectAttempts.current}, delay ${delay}ms`);
          setTimeout(connectWebSocket, delay);
        }
      };
    };

    connectWebSocket();

    return () => {
      console.log('Cleaning up WebSocket');
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [roomId, accessToken, navigate, username, role]);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle countdown
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setTimeout(() => {
      setCountdown(null);
      handleStartBattle();
    }, 1000);
  }, [countdown]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    toast.info('Chat functionality will be implemented soon!');
    setChatMessage('');
  };

  const handleKickParticipant = () => {
    toast.info('Kick functionality will be implemented soon!');
  };

  const handleStartBattle = () => {
    toast.info('Battle start functionality will be implemented soon!');
    navigate('/user/room/session', { state: { roomId: roomDetails.roomId } });
  };

  const initiateCountdown = () => {
    if (participants.length < 1) {
      toast.error('At least one participant required');
      return;
    }
    setCountdown(5);
  };

  if (!roomDetails) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-lg text-[#00FF40]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col relative overflow-hidden">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <span
            key={`matrix-${i}`}
            className="absolute text-xs text-[#00FF40] opacity-20"
            style={{
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              animation: `pulse ${Math.random() * 4 + 1}s infinite ${Math.random() * 2}s`,
            }}
          >
            {Math.random() > 0.5 ? '0' : '1'}
          </span>
        ))}
      </div>

      {/* Header */}
      <header className="bg-gray-900/90 border-b border-[#00FF40]/30 p-4 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#00FF40] font-['Orbitron'] tracking-wider flex items-center drop-shadow-[0_0_6px_#00FF40]">
              <span className="mr-2">&lt;</span>
              {roomDetails.roomName}
              <span className="ml-2">&gt;</span>
            </h1>
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  roomDetails.difficulty === 'easy'
                    ? 'bg-green-900/50 text-green-400'
                    : roomDetails.difficulty === 'medium'
                    ? 'bg-yellow-900/50 text-yellow-400'
                    : 'bg-red-900/50 text-red-400'
                }`}
              >
                {roomDetails.difficulty.toUpperCase()}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  roomDetails.isPrivate ? 'bg-purple-900/50 text-purple-400' : 'bg-blue-900/50 text-blue-400'
                }`}
              >
                {roomDetails.isPrivate ? 'PRIVATE' : 'PUBLIC'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-[#00FF40]" />
              <span className="text-xs sm:text-sm text-gray-300">{currentTime}</span>
            </div>
            <div className="px-2 py-1 bg-gray-900/50 rounded border border-[#00FF40]/30 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00FF40] rounded-full animate-pulse"></span>
              <span className="text-xs text-[#00FF40]">{roomDetails.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full py-4 px-4 flex flex-col lg:flex-row gap-4 relative z-10">
        {/* Sidebar: Tabs */}
        <div className="w-full lg:w-80 bg-gray-900/90 border border-[#00FF40]/30 rounded-lg flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-[#00FF40]/30">
            {['details', 'chat', 'rules'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 sm:py-3 text-xs sm:text-sm font-medium text-center transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-[#00FF40]/10 text-[#00FF40] border-b-2 border-[#00FF40]'
                    : 'text-gray-400 hover:text-[#00FF40] hover:bg-gray-800/50'
                }`}
              >
                {tab === 'details' ? 'Battle Setup' : tab === 'chat' ? 'Comms' : 'Protocol'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {activeTab === 'details' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="text-gray-300">Access Code:</span>
                    <span className="ml-2 text-[#00FF40] font-mono">{roomDetails.joinCode}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <Clock className="w-4 h-4 mr-2 text-[#00FF40]" />
                    <span className="text-gray-300">Duration:</span>
                    <span className="ml-2 text-white">{roomDetails.timeLimit} min</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <Users className="w-4 h-4 mr-2 text-[#00FF40]" />
                    <span className="text-gray-300">Capacity:</span>
                    <span className="ml-2 text-white">{roomDetails.participantCount}/{roomDetails.capacity}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isSystem ? 'justify-center' : 'justify-start'}`}>
                      {msg.isSystem ? (
                        <div className="bg-gray-800/50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-gray-400">
                          {msg.message}
                        </div>
                      ) : (
                        <div className="w-full sm:max-w-[70%]">
                          <div className="flex items-center mb-1">
                            <span className="font-medium text-xs sm:text-sm text-[#00FF40]">{msg.user}</span>
                            <span className="text-gray-500 text-xs ml-2">{msg.time}</span>
                          </div>
                          <div className="bg-gray-800 p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-white border border-[#00FF40]/20">
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
                    className="flex-1 bg-gray-800/50 border border-[#00FF40]/20 rounded-l-md p-2 sm:p-3 text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:border-[#00FF40] focus:ring-1 focus:ring-[#00FF40]"
                    aria-label="Chat input"
                    disabled
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-[#00FF40] text-black px-2 sm:px-3 rounded-r-md hover:bg-[#22c55e] transition-all duration-300 opacity-50 cursor-not-allowed"
                    aria-label="Send message"
                    disabled
                  >
                    <Send size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-4">
                <h4 className="text-xs sm:text-sm font-medium text-[#00FF40] mb-2">Battle Protocol</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                  {rules.map((rule, index) => (
                    <li key={`rule-${index}`} className="flex items-start">
                      <span className="text-[#00FF40] mr-2">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Host Controls */}
          {role === 'host' && (
            <div className="p-4 sm:p-6 border-t border-[#00FF40]/30 bg-gray-900/50">
              <h3 className="text-xs sm:text-sm font-medium text-[#00FF40] mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Command Center
              </h3>
              <button
                onClick={initiateCountdown}
                disabled={participants.length < 1 || isLoading}
                className={`w-full py-2 sm:py-3 rounded font-mono text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  participants.length < 1 || isLoading
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-[#00FF40] text-black hover:bg-[#22c55e] hover:shadow-[0_0_10px_#00FF40]'
                }`}
                aria-label="Deploy battle"
              >
                <Play size={16} />
                Deploy Battle
              </button>
            </div>
          )}
        </div>

        {/* Participants Panel */}
        <div className="flex-1 bg-gray-900/90 p-4 sm:p-6 rounded-lg border border-[#00FF40]/30">
          <h2 className="text-lg sm:text-xl font-bold text-[#00FF40] mb-4 font-['Orbitron'] tracking-wider flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Operatives ({roomDetails.participantCount}/{roomDetails.capacity})
          </h2>
          <div className="space-y-3">
            {participants.length > 0 ? (
              participants.map((participant, index) => (
                <div
                  key={`participant-${participant.user__username}-${index}`}
                  className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-[#00FF40]/20 hover:border-[#00FF40]/50 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#00FF40]/20 flex items-center justify-center text-[#00FF40] font-bold text-base sm:text-lg">
                      {participant.user__username.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <span className="font-medium text-xs sm:text-sm text-white">{participant.user__username}</span>
                        {participant.role === 'host' && (
                          <Shield size={14} className="ml-2 text-[#00FF40]" title="Commander" />
                        )}
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <span
                          className={`h-2 w-2 rounded-full mr-1 ${
                            participant.status === 'joined' ? 'bg-[#00FF40]' : 'bg-yellow-500'
                          }`}
                        ></span>
                        <span className={participant.status === 'joined' ? 'text-[#00FF40]' : 'text-yellow-400'}>
                          {participant.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {role === 'host' && participant.role !== 'host' && (
                    <button
                      onClick={() => handleKickParticipant(participant.user__username)}
                      disabled={isLoading}
                      className="p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300 opacity-50 cursor-not-allowed"
                      title="Eject operative"
                      aria-label={`Eject ${participant.user__username}`}
                    >
                      <UserX size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-500 text-center p-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-4 opacity-50"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm">No participants have joined yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-7xl sm:text-9xl font-bold text-[#00FF40] font-['Orbitron'] tracking-wider animate-pulse">
              {countdown > 0 ? countdown : 'ENGAGE!'}
            </div>
            {countdown > 0 && (
              <div className="text-lg sm:text-2xl text-gray-300 mt-6 font-mono">Battle initializing...</div>
            )}
            {countdown === 0 && (
              <div className="text-lg sm:text-2xl text-[#00FF40] mt-6 font-mono animate-fadeIn">Code or be coded!</div>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && <BitCodeProgressLoading message="Deploying battle systems..." />}

      {/* Footer */}
      <footer className="bg-gray-900/90 border-t border-[#00FF40]/30 py-2 px-4 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-400">
          <span className="text-[#00FF40] font-bold">BitWar Arena</span>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <span>
              Room ID: <span className="text-[#00FF40]">{roomDetails.roomId}</span>
            </span>
            <span>
              Initialized: <span className="text-[#00FF40]">Today, {currentTime}</span>
            </span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BattleWaitingLobby;