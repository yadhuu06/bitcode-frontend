import React, { useState, useEffect, useRef, memo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoomDetails } from '../../services/RoomService';
import WebSocketService from '../../services/WebSocketService';
import 'react-toastify/dist/ReactToastify.css';
import LobbyHeader from '../../components/battle-room/LobbyHeader';
import ParticipantsPanel from '../../components/battle-room/ParticipantsPanel';
import LobbySidebar from '../../components/battle-room/LobbySidebar';
import LobbyFooter from '../../components/battle-room/LobbyFooter';
import LobbyModals from '../../components/battle-room/LobbyModals';
import { Code } from 'lucide-react';

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

const MatrixBackground = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const chars = '01';
    const fontSize = 14;
    const numChars = Math.floor(Math.random() * 21) + 10;
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
});

const BattleWaitingLobby = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const reduxUsername = useSelector((state) => state.auth.username);
  const [activeTab, setActiveTab] = useState('details');
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [role, setRole] = useState('participant');
  const [roomDetails, setRoomDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [readyStatus, setReadyStatus] = useState({});
  const [copied, setCopied] = useState(false);
  const [isRoomClosed, setIsRoomClosed] = useState(false);
  const [lobbyMessages, setLobbyMessages] = useState([]);
  const [isKicked, setIsKicked] = useState(false);
  const wsListenerId = useRef(`lobby-${roomId}`);
  const [username, setUsername] = useState(localStorage.getItem('current_user') || null);

  console.log('BattleWaitingLobby - Initial Username:', username);
  console.log('BattleWaitingLobby - Redux Username:', reduxUsername);
  console.log('BattleWaitingLobby - Access Token:', accessToken ? 'Present' : 'Missing');

  useEffect(() => {
    const fetchRoomDetails = async () => {
      setIsLoading(true);
      try {
        console.log('fetchRoomDetails - Starting with roomId:', roomId);
        console.log('fetchRoomDetails - Access Token:', accessToken ? 'Present' : 'Missing');

        const response = await getRoomDetails(roomId, accessToken);
        console.log('fetchRoomDetails - API Response:', response);

        if (!response.current_user) {
          console.warn('fetchRoomDetails - No current_user in response');
          throw new Error('User not authenticated');
        }

        const roomData = {
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

        setRoomDetails(roomData);
        setParticipants(response.participants || []);
        setUsername(response.current_user);
        localStorage.setItem('current_user', response.current_user);
        setRole(
          response.participants.find((p) => p.user__username === response.current_user)?.role || 'participant'
        );

        console.log('fetchRoomDetails - Set Username:', response.current_user);
        console.log('fetchRoomDetails - Set Role:', response.participants.find((p) => p.user__username === response.current_user)?.role || 'participant');
      } catch (err) {
        console.error('fetchRoomDetails - Error:', err);
        toast.error(err.message.includes('not authorised') || err.message.includes('authenticated')
          ? 'You are not authorised to view this room'
          : 'Failed to load room details');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken && roomId) {
      fetchRoomDetails();
    } else {
      console.log('fetchRoomDetails - Missing accessToken or roomId');
      toast.error('Invalid room or session');
      navigate('/login');
    }
  }, [roomId, accessToken, navigate]);

  useEffect(() => {
    if (!roomId || !accessToken) return;

    WebSocketService.connect(accessToken, roomId, () => {
      console.warn('Redirecting due to WebSocket initial failure...');
      toast.error('Failed to connect to room');
      navigate('/error');
    });

    const handleMessage = (data) => {
      console.log('WebSocket message received:', data);
      switch (data.type) {
        case 'participant_list':
        case 'participant_update':
          const activeParticipants = (data.participants || []).filter((p) => p.status === 'joined');
          setParticipants(activeParticipants);
          setRoomDetails((prev) => prev ? { ...prev, participantCount: activeParticipants.length } : prev);
          const currentUser = activeParticipants.find((p) => p.user__username === username);
          if (currentUser?.role) {
            setRole(currentUser.role);
          }
          break;
        case 'countdown':
          setCountdown(data.countdown);
          break;
        case 'ready_status':
          setReadyStatus((prev) => ({ ...prev, [data.username]: data.ready }));
          break;
        case 'room_closed':
          setIsRoomClosed(true);
          setTimeout(() => navigate('/user/rooms'), 3000);
          break;
        case 'kicked':
          if (data.username === username) {
            setIsKicked(true);
            toast.error('You have been kicked from the room');
            WebSocketService.disconnect();
            setTimeout(() => navigate('/user/rooms'), 2000);
          }
          break;
        case 'participant_left':
          setLobbyMessages((prev) => [...prev, `${data.username} left the lobby`]);
          setTimeout(() => setLobbyMessages((prev) => prev.slice(-5)), 5000);
          break;
        case 'error':
          toast.error(data.message);
          if (
            data.message.includes('401') ||
            data.message.includes('4001') ||
            data.message.includes('4002') ||
            data.message.includes('Not authorized') ||
            data.code === 4005
          ) {
            navigate('/login');
          }
          break;
        default:
          console.warn('Unknown WebSocket message type:', data.type);
      }
    };

    WebSocketService.addListener(wsListenerId.current, handleMessage);

    return () => {
      WebSocketService.removeListener(wsListenerId.current);
      WebSocketService.disconnect();
    };
  }, [roomId, accessToken, navigate, username]);

  const initiateCountdown = () => {
    if (participants.length < 1) {
      toast.error('At least one participant required');
      return;
    }
    WebSocketService.sendMessage({ type: 'start_countdown', countdown: 5 });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
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
    if (!username) {
      toast.error('User not authenticated');
      return;
    }
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
      await navigator.clipboard.writeText(roomDetails?.join_code);
      setCopied(true);
      toast.success('Join code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy join code:', err);
      toast.error('Failed to copy join code');
    }
  };

  const handleStartBattle = () => {
    toast.info('Battle starting soon!');
    navigate(`/battle/${roomId}`);
  };

  const handleLeaveRoom = () => {
    WebSocketService.sendMessage({ type: 'leave_room' });
    navigate('/user/rooms');
  };

  const handleCloseRoom = () => {
    if (role !== 'host') {
      toast.error('Only the host can close the room');
      return;
    }
    WebSocketService.sendMessage({ type: 'close_room' });
  };

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

  console.log('BattleWaitingLobby - Rendered Participants:', participants);
  console.log('BattleWaitingLobby - Rendered Username:', username);

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col relative overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <LobbyModals
          isKicked={isKicked}
          isRoomClosed={isRoomClosed}
          isLoading={isLoading}
          countdown={countdown}
          navigate={navigate}
        />
        {!isKicked && !isRoomClosed && !isLoading && roomDetails && (
          <>
            <LobbyHeader
              roomDetails={roomDetails}
              role={role}
              currentTime={currentTime}
              handleLeaveRoom={handleLeaveRoom}
              getDifficultyStyles={getDifficultyStyles}
            />
            <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 flex flex-col lg:flex-row gap-6">
              <ParticipantsPanel
                participants={participants}
                username={username}
                role={role}
                readyStatus={readyStatus}
                isLoading={isLoading}
                handleReadyToggle={handleReadyToggle}
                handleKickParticipant={handleKickParticipant}
                lobbyMessages={lobbyMessages}
                roomDetails={roomDetails}
              />
              <LobbySidebar
                roomDetails={roomDetails}
                role={role}
                username={username}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleCopy={handleCopy}
                copied={copied}
                isLoading={isLoading}
                participants={participants}
                initiateCountdown={initiateCountdown}
                handleCloseRoom={handleCloseRoom}
                handleLeaveRoom={handleLeaveRoom}
                handleReadyToggle={handleReadyToggle} // Added
                readyStatus={readyStatus} // Added
                getDifficultyStyles={getDifficultyStyles}
              />
            </main>
            <LobbyFooter roomDetails={roomDetails} currentTime={currentTime} />
          </>
        )}
      </div>
    </div>
  );
};

export default memo(BattleWaitingLobby);