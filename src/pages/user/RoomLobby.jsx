import React, { useState, useEffect, useRef, memo } from 'react';
import { Users, Clock, Play, Shield, UserX, Code } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getRoomDetails } from '../../services/RoomService';
import WebSocketService from '../../services/WebSocketService';
import ChatPanel from './ChatPannel';

const BitCodeProgressLoading = memo(({ message }) => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center animate-spin border-2 border-white/20">
        <Code className="text-white" size={24} />
      </div>
      <p className="mt-4 text-cyan-400 font-mono text-lg">{message}</p>
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
  const wsListenerId = useRef(`lobby-${roomId}`);

  const rules = [
    'Complete challenges within the time limit.',
    'Points awarded for accuracy and speed.',
    'No external resources during the battle.',
    'Maintain respect and fair play.',
  ];

  // Fetch room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      setIsLoading(true);
      try {
        let roomData;
        if (location.state) {
          roomData = {
            roomId,
            roomName: location.state.roomName,
            isPrivate: location.state.isPrivate,
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
      toast.error('Invalid room or session');
      navigate('/user/rooms');
    }
  }, [location, navigate, roomId, accessToken]);

  // WebSocket handling
  useEffect(() => {
    if (!roomId || !accessToken) return;

    WebSocketService.connect(accessToken, roomId);

    const handleMessage = (data) => {
      if (data.type === 'participant_list' || data.type === 'participant_update') {
        setParticipants(data.participants || []);
        setRoomDetails((prev) => (prev ? { ...prev, participantCount: data.participants.length } : prev));
        if (!role) {
          const userParticipant = data.participants.find((p) => p.user__username === username);
          if (userParticipant) setRole(userParticipant.role);
        }
      } else if (data.type === 'countdown') {
        setCountdown(data.countdown);
      } else if (data.type === 'error') {
        toast.error(data.message);
        if (data.message.includes('401') || data.message.includes('4001') || data.message.includes('4002')) {
          navigate('/login');
        }
      }
    };

    WebSocketService.addListener(wsListenerId.current, handleMessage);

    return () => {
      WebSocketService.removeListener(wsListenerId.current);
      
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

  const handleKickParticipant = () => {
    toast.info('Kick functionality coming soon!');
  };

  const handleStartBattle = () => {
    toast.info('Battle start functionality coming soon!');
    navigate('/user/room/session', { state: { roomId: roomDetails.roomId } });
  };

  const initiateCountdown = () => {
    if (participants.length < 1) {
      toast.error('At least one participant required');
      return;
    }
    WebSocketService.sendMessage({ type: 'start_countdown', countdown: 5 });
  };

  if (!roomDetails) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <BitCodeProgressLoading message="Initializing..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 animate-pulse"></div>
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={`matrix-${i}`}
            className="absolute text-xs text-cyan-400 opacity-30"
            style={{
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              animation: `float ${Math.random() * 5 + 3}s infinite ${Math.random()}s`,
            }}
          >
            {Math.random() > 0.5 ? '0' : '1'}
          </span>
        ))}
      </div>

      {/* Header */}
      <header className="bg-gray-800/80 border-b border-cyan-500/30 p-4 relative z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-cyan-400 font-['Orbitron'] tracking-wider">
              {roomDetails.roomName}
            </h1>
            <div className="flex gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  roomDetails.difficulty === 'easy'
                    ? 'bg-green-500/20 text-green-400'
                    : roomDetails.difficulty === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {roomDetails.difficulty.toUpperCase()}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  roomDetails.isPrivate ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                }`}
              >
                {roomDetails.isPrivate ? 'PRIVATE' : 'PUBLIC'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-cyan-400" />
              <span className="text-gray-300">{currentTime}</span>
            </div>
            <div className="px-2 py-1 bg-gray-700/50 rounded border border-cyan-500/30 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-cyan-400">{roomDetails.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 flex flex-col lg:flex-row gap-6 relative z-10">
        {/* Sidebar: Tabs */}
        <div className="w-full lg:w-96 bg-gray-800/80 border border-cyan-500/20 rounded-xl flex flex-col shadow-lg shadow-cyan-500/10">
          <div className="flex border-b border-cyan-500/30">
            {['details', 'chat', 'rules'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium text-center transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-700/50'
                }`}
              >
                {tab === 'details' ? 'Details' : tab === 'chat' ? 'Chat' : 'Rules'}
              </button>
            ))}
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'details' && (
              <div className="space-y-4 text-sm">
                <div className="flex items-center">
                  <span className="text-gray-400 w-24">Access Code:</span>
                  <span className="text-cyan-400 font-mono">{roomDetails.joinCode}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-cyan-400" />
                  <span className="text-gray-400 w-24">Duration:</span>
                  <span className="text-white">{roomDetails.timeLimit} min</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-cyan-400" />
                  <span className="text-gray-400 w-24">Capacity:</span>
                  <span className="text-white">{roomDetails.participantCount}/{roomDetails.capacity}</span>
                </div>
              </div>
            )}
            {activeTab === 'chat' && <ChatPanel roomId={roomId} username={username} />}
            {activeTab === 'rules' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-cyan-400">Battle Rules</h4>
                <ul className="space-y-2 text-sm text-gray-300 list-disc pl-4">
                  {rules.map((rule, index) => (
                    <li key={`rule-${index}`}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {role === 'host' && (
            <div className="p-6 border-t border-cyan-500/30 bg-gray-800/50">
              <h3 className="text-sm font-medium text-cyan-400 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Host Controls
              </h3>
              <button
                onClick={initiateCountdown}
                disabled={participants.length < 1 || isLoading}
                className={`w-full py-3 rounded-lg font-mono text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  participants.length < 1 || isLoading
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_12px_cyan]'
                }`}
                aria-label="Start battle"
              >
                <Play size={16} />
                Start Battle
              </button>
            </div>
          )}
        </div>
        {/* Participants Panel */}
        <div className="flex-1 bg-gray-800/80 p-6 rounded-xl border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
          <h2 className="text-xl font-bold text-cyan-400 mb-4 font-['Orbitron'] tracking-wider flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Participants ({roomDetails.participantCount}/{roomDetails.capacity})
          </h2>
          <div className="space-y-3">
            {participants.length > 0 ? (
              participants.map((participant, index) => (
                <div
                  key={`participant-${participant.user__username}-${index}`}
                  className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg border border-cyan-500/20 hover:border-cyan-400 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-lg">
                      {participant.user__username.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <span className="font-medium text-sm text-white">{participant.user__username}</span>
                        {participant.role === 'host' && (
                          <Shield size={14} className="ml-2 text-cyan-400" title="Host" />
                        )}
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <span
                          className={`h-2 w-2 rounded-full mr-1 ${
                            participant.status === 'joined' ? 'bg-cyan-400' : 'bg-yellow-400'
                          }`}
                        ></span>
                        <span className={participant.status === 'joined' ? 'text-cyan-400' : 'text-yellow-400'}>
                          {participant.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {role === 'host' && participant.role !== 'host' && (
                    <button
                      onClick={() => handleKickParticipant(participant.user__username)}
                      disabled={isLoading}
                      className="p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300"
                      title="Kick participant"
                      aria-label={`Kick ${participant.user__username}`}
                    >
                      <UserX size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-400 text-center p-8">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No participants yet</p>
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
            <div className="text-8xl font-bold text-cyan-400 font-['Orbitron'] tracking-wider animate-pulse">
              {countdown > 0 ? countdown : 'START!'}
            </div>
            <div className="text-xl text-gray-300 mt-4 font-mono">
              {countdown > 0 ? 'Preparing battle...' : 'Engage now!'}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && <BitCodeProgressLoading message="Initializing systems..." />}
      
      {/* Footer */}
      <footer className="bg-gray-800/80 border-t border-cyan-500/30 py-3 px-4 relative z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-400">
          <span className="text-cyan-400 font-bold">Battle Arena</span>
          <div className="flex gap-4">
            <span>
              Room ID: <span className="text-cyan-400">{roomDetails.roomId}</span>
            </span>
            <span>
              Time: <span className="text-cyan-400">{currentTime}</span>
            </span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-10px);
            opacity: 0.6;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};

export default BattleWaitingLobby;