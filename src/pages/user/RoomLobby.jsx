
import React, { useState, useEffect, useRef, memo } from 'react';
import { Users, Clock, Play, Shield, UserX, Code, ClipboardCopy, CheckCircle, Swords } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getRoomDetails } from '../../services/RoomService';
import WebSocketService from '../../services/WebSocketService';
import 'react-toastify/dist/ReactToastify.css';
import ChatPanel from './ChatPannel';

const BitCodeProgressLoading = memo(({ message }) => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="w-20 h-20 bg-[#00FF40] rounded-full flex items-center justify-center animate-spin border-2 border-white/20">
        <Code className="text-black" size={24} />
      </div>
      <p className="mt-4 text-[#00FF40] font-mono text-lg">{message}</p>
    </div>
  </div>
));

const MatrixBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const chars = '01';
    const fontSize = 14;
    const numChars = Math.floor(Math.random() * 21);
    const particles = [];

    for (let i = 0; i < numChars; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: chars.charAt(Math.floor(Math.random() * chars.length)),
        opacity: 0,
        phase: 'fadeIn',
        speed: Math.random() * 0.02 + 0.01,
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      particles.forEach((p) => {
        ctx.fillStyle = `rgba(0, 255, 64, ${p.opacity})`;
        ctx.fillText(p.char, p.x, p.y);

        if (p.phase === 'fadeIn') {
          p.opacity += p.speed;
          if (p.opacity >= 0.8) p.phase = 'fadeOut';
        } else {
          p.opacity -= p.speed;
          if (p.opacity <= 0) {
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
            p.char = chars.charAt(Math.floor(Math.random() * chars.length));
            p.opacity = 0;
            p.phase = 'fadeIn';
            p.speed = Math.random() * 0.02 + 0.01;
          }
        }
      });
    };

    const interval = setInterval(draw, 50);
    const handleResize = () => {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
      particles.forEach((p) => {
        p.x = Math.min(p.x, canvas.width);
        p.y = Math.min(p.y, canvas.height);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 z-0 opacity-30" />;
};

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
  const [readyStatus, setReadyStatus] = useState({});
  const [copied, setCopied] = useState(false);
  const wsListenerId = useRef(`lobby-${roomId}`);

  const rules = [
    'Complete challenges within the time limit.',
    'Points awarded for accuracy and speed.',
    'No external resources during the battle.',
    'Maintain respect and fair play.',
  ];

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
            join_code: location.state.joinCode, 
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
            join_code: response.room.join_code,
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
      } else if (data.type === 'ready_status') {
        setReadyStatus((prev) => ({ ...prev, [data.username]: data.ready }));
      } else if (data.type === 'error') {
        toast.error(data.message);
        if (data.message.includes('401') || data.message.includes('4001') || data.message.includes('4002') || data.code === 4005) {
          navigate('/login');
        }
      }
    };

    WebSocketService.addListener(wsListenerId.current, handleMessage);

    return () => {
      WebSocketService.removeListener(wsListenerId.current);
    };
  }, [roomId, accessToken, navigate, username, role]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleReadyToggle = () => {
    const newReadyState = !readyStatus[username];
    WebSocketService.sendMessage({ type: 'ready_toggle', ready: newReadyState });
    setReadyStatus((prev) => ({ ...prev, [username]: newReadyState }));
  };

  const handleKickParticipant = (targetUsername) => {
    if (role !== 'host') {
      toast.error('Only the host can kick participants');
      return;
    }
    WebSocketService.sendMessage({ type: 'kick_participant', username: targetUsername });
    toast.info(`Requested to kick ${targetUsername}`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomDetails.join_code);
      setCopied(true);
      toast.success('Join code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy join code:', err);
      toast.error('Failed to copy join code');
    }
  };

  const handleStartBattle = () => {
    "coming soon"
  };

  const initiateCountdown = () => {
    if (participants.length < 1) {
      toast.error('At least one participant required');
      return;
    }
    const allReady = participants.every((p) => readyStatus[p.user__username] || p.role === 'host');
    if (!allReady) {
      toast.error('All participants must be ready');
      return;
    }
    WebSocketService.sendMessage({ type: 'start_countdown', countdown: 5 });
  };

  if (!roomDetails) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <BitCodeProgressLoading message="Initializing..." />
      </div>
    );
  }

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'hard':
        return 'text-red-500 bg-red-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'easy':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-400 bg-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col relative overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-gray-900/80 border-b border-[#00FF40]/30 p-4 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-[#00FF40] font-['Orbitron'] tracking-wider">
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
                  {roomDetails.difficulty?.toUpperCase()}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    roomDetails.isPrivate ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#00FF40]/20 text-[#00FF40]'
                  }`}
                >
                  {roomDetails.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-[#00FF40]" />
                <span className="text-gray-300">{currentTime}</span>
              </div>
              <div className="px-2 py-1 bg-gray-700/50 rounded border border-[#00FF40]/30 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00FF40] rounded-full animate-pulse"></span>
                <span className="text-xs text-[#00FF40]">{roomDetails.status?.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 flex flex-col lg:flex-row gap-6">
          {/* Participants Panel */}
          <div className="lg:w-2/3 bg-gray-900/80 p-6 rounded-xl border border-[#00FF40]/20 shadow-lg shadow-[#00FF40]/10">
            <h2 className="text-xl font-bold text-[#00FF40] mb-4 font-['Orbitron'] tracking-wider flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Participants ({roomDetails.participantCount}/{roomDetails.capacity})
            </h2>
            <div className="space-y-3">
              {participants.length > 0 ? (
                participants.map((participant, index) => (
                  <div
                    key={`participant-${participant.user__username}-${index}`}
                    className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-[#00FF40]/20 hover:border-[#22c55e] transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#00FF40]/20 flex items-center justify-center text-[#00FF40] font-bold text-lg">
                        {participant.user__username.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <span className="font-medium text-sm text-white">{participant.user__username}</span>
                          {participant.role === 'host' && (
                            <Shield size={14} className="ml-2 text-[#00FF40]" title="Host" />
                          )}
                        </div>
                        <div className="flex items-center text-xs mt-1">
                          <span
                            className={`h-2 w-2 rounded-full mr-1 ${
                              participant.status === 'joined' ? 'bg-[#00FF40]' : 'bg-yellow-400'
                            }`}
                          ></span>
                          <span className={participant.status === 'joined' ? 'text-[#00FF40]' : 'text-yellow-400'}>
                            {participant.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {readyStatus[participant.user__username] && (
                        <CheckCircle size={16} className="text-[#00FF40] animate-pulse" title="Ready" />
                      )}
                      {role === 'host' && participant.role !== 'host' && participant.status === 'joined' && (
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
                      {role !== 'host' && participant.user__username === username && (
                        <button
                          onClick={handleReadyToggle}
                          className={`p-2 rounded-full ${
                            readyStatus[username]
                              ? 'bg-[#00FF40]/20 text-[#00FF40]'
                              : 'bg-gray-700/50 text-gray-400'
                          } hover:bg-[#22c55e]/30 transition-all duration-300`}
                          title={readyStatus[username] ? 'Unready' : 'Ready'}
                          aria-label={readyStatus[username] ? 'Unready' : 'Ready'}
                        >
                          <CheckCircle size={16} className="animate-pulse" />
                        </button>
                      )}
                    </div>
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

          {/* Sidebar: Tabs & Host Controls */}
          <div className="lg:w-1/3 bg-gray-900/90 border border-[#00FF40]/20 rounded-2xl flex flex-col shadow-xl shadow-[#00FF40]/10 max-h-[80vh]">
            {/* Tab Navigation */}
            <div className="flex border-b border-[#00FF40]/30 bg-gray-950/50 rounded-t-2xl">
              {['details', 'chat', 'rules'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-[#00FF40]/20 text-[#00FF40] border-b-2 border-[#00FF40]'
                      : 'text-gray-400 hover:text-[#22c55e] hover:bg-gray-800/70'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto text-sm scrollbar-thin scrollbar-thumb-[#00FF40]/50 scrollbar-track-gray-900">
              {activeTab === 'details' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 min-w-[100px] font-medium">Room Name:</span>
                    <span className="text-white font-semibold">{roomDetails.roomName}</span>
                  </div>
                  {role === 'host' && (
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 min-w-[100px] font-medium">Access Code:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#00FF40] font-mono bg-gray-800/50 px-2 py-1 rounded">
                          {roomDetails.join_code}
                        </span>
                        <button
                          onClick={handleCopy}
                          className="p-1.5 rounded-full bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-[#00FF40] transition-all duration-300"
                          title="Copy join code"
                          aria-label="Copy join code to clipboard"
                        >
                          <ClipboardCopy size={16} />
                        </button>
                        {copied && <span className="text-xs text-[#00FF40] ml-2 animate-fade-in">Copied!</span>}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-[#00FF40]" />
                    <span className="text-gray-400 min-w-[100px] font-medium">Duration:</span>
                    <span className="text-white">{roomDetails.timeLimit} min</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Users className="w-5 h-5 text-[#00FF40]" />
                    <span className="text-gray-400 min-w-[100px] font-medium">Capacity:</span>
                    <span className="text-white">{roomDetails.participantCount}/{roomDetails.capacity}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 min-w-[100px] font-medium">Privacy:</span>
                    <span className="text-white capitalize">{roomDetails.isPrivate ? 'Private' : 'Public'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 min-w-[100px] font-medium">Difficulty:</span>
                    <span className={`capitalize px-2 py-1 rounded ${getDifficultyStyles(roomDetails.difficulty)}`}>
                      {roomDetails.difficulty}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && <ChatPanel roomId={roomId} username={username} />}

              {activeTab === 'rules' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-[#00FF40] flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Battle Rules
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
                    <li>Complete the battle within {roomDetails.timeLimit} minutes.</li>
                    <li>
                      Questions set to{' '}
                      <span className={`font-semibold ${getDifficultyStyles(roomDetails.difficulty)}`}>
                        {roomDetails.difficulty}
                      </span>{' '}
                      difficulty.
                    </li>
                    <li>No external help or tab switching allowed.</li>
                    <li>Timer won’t pause — manage time wisely.</li>
                    <li>Role: {role}</li>
                    <li>Ensure stable internet connection.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Host Controls */}
            {(role === 'host' || role === '') && (
              <div className="p-6 border-t border-[#00FF40]/30 bg-gray-950/50 rounded-b-2xl">
                <h3 className="text-sm font-medium text-[#00FF40] mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Host Dashboard
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={initiateCountdown}
                    disabled={participants.length < 1 || isLoading}
                    className={`w-full py-3 rounded-lg font-mono text-sm font-semibold flex items-center justify-center gap-2 border transition-colors duration-300
                      ${
                        participants.length < 1 || isLoading
                          ? 'border-gray-700 text-gray-500 cursor-not-allowed'
                          : 'border-[#00FF40] text-[#00FF40] hover:bg-[#00FF40] hover:text-black'
                      }`}
                    aria-label="Start battle"
                  >
                    <Swords size={16} />
                    Start Battle
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="text-8xl font-bold text-[#00FF40] font-['Orbitron'] tracking-wider animate-pulse">
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
        <footer className="bg-gray-900/80 border-t border-[#00FF40]/30 py-3 px-4 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
            <span className="text-[#00FF40] font-bold">Battle Arena</span>
            <div className="flex gap-4">
              <span>
                Room ID: <span className="text-[#00FF40]">{roomDetails.roomId}</span>
              </span>
              <span>
                Time: <span className="text-[#00FF40]">{currentTime}</span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BattleWaitingLobby;
