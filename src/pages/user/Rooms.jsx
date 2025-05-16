import React, { useState, useEffect, useRef } from 'react';
import { Search, Lock, Trophy, Play, Users, Clock, Layers, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { logoutSuccess } from '../../store/slices/authSlice';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { fetchRooms, addRoom, updateRooms } from '../../store/slices/roomSlice';
import CreateRoomModal from '../../components/modals/CreateRoomModal';
import CustomButton from '../../components/ui/CustomButton';
import Cookies from 'js-cookie';
import WebSocketService from '../../services/WebSocketService';
import 'react-toastify/dist/ReactToastify.css';
import { Swords } from 'lucide-react';
import api from '../../api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BitCodeProgressLoading = ({ message, progress, size, showBackground, style }) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  };
  const styleClasses = {
    terminal: 'bg-gradient-to-r from-green-600 to-green-400 animate-pulse',
    compile: 'bg-gradient-to-r from-blue-600 to-blue-400 animate-spin',
    battle: 'bg-gradient-to-r from-red-600 to-red-400 animate-bounce',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${showBackground ? 'bg-black bg-opacity-80' : ''} p-4 rounded-lg relative`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.large} ${styleClasses[style] || styleClasses.terminal} rounded-full flex items-center justify-center relative overflow-hidden`}
      >
        <span className="text-white font-mono text-sm z-10">{Math.round(progress)}%</span>
        <div className="absolute inset-0 bg-green-500/20 animate-glitch"></div>
      </div>
      <p className="mt-2 text-white font-mono text-lg tracking-wider">{message}</p>
    </div>
  );
};

const Rooms = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rooms, loading, error } = useSelector((state) => state.rooms);
  const { accessToken } = useSelector((state) => state.auth);
  const { isLoading, message, progress, style } = useSelector((state) => state.loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [wsError, setWsError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [passwordRoomId, setPasswordRoomId] = useState(null);
  const [passwords, setPasswords] = useState({});
  const wsListenerId = useRef('rooms');

  useEffect(() => {
    if (!accessToken) {
      toast.error('Please log in to view rooms');
      navigate('/login');
      return;
    }

    WebSocketService.connect(accessToken);

    const handleMessage = (data) => {
      if (data.type === 'room_list' || data.type === 'room_update') {
        dispatch(updateRooms(data.rooms));
      } else if (data.type === 'error') {
        setWsError(data.message);
        toast.error(data.message);
        if (data.message.includes('401') || data.message.includes('4001') || data.message.includes('4002')) {
          dispatch(logoutSuccess());
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          navigate('/login');
        }
      } else {
        console.warn('Unknown message type:', data.type);
      }
    };

    WebSocketService.addListener(wsListenerId.current, handleMessage);

    return () => {
      WebSocketService.removeListener(wsListenerId.current);
      WebSocketService.disconnect();
    };
  }, [accessToken, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const handleRoomCreated = (newRoom) => {
    dispatch(setLoading({ isLoading: true, message: 'Updating room list...', style: 'compile', progress: 0 }));
    try {
      dispatch(addRoom({
        room_id: newRoom.id,
        name: newRoom.name,
        owner__username: newRoom.host,
        topic: newRoom.topic || 'Array',
        difficulty: newRoom.difficulty,
        time_limit: newRoom.is_ranked ? 0 : parseInt(newRoom.duration) || 30,
        capacity: newRoom.maxParticipants,
        participant_count: newRoom.participants,
        visibility: newRoom.isPrivate ? 'private' : 'public',
        status: newRoom.status,
        join_code: newRoom.joinCode,
        is_ranked: newRoom.is_ranked,
      }));
      toast.success('Room created successfully');
      setShowModal(false);
    } catch (err) {
      console.error('Failed to update room list:', err);
      toast.error('Failed to update room list');
    } finally {
      dispatch(resetLoading());
    }
  };

  const handleJoinRoom = async (room) => {
    dispatch(setLoading({ isLoading: true, message: 'Joining room...', style: 'battle', progress: 0 }));

    try {
      let password = null;

      if (room.visibility === 'private') {
        password = passwords[room.room_id];

        if (!password) {
          setPasswordRoomId(room.room_id);
          dispatch(resetLoading());
          return;
        }
      }

      const response = await api.post(`/rooms/${room.room_id}/join/`, password ? { password } : {});

      toast.success('Joined room successfully');

      const data = response.data;

      navigate(`/user/room/${room.room_id}`, {
        state: {
          roomName: room.name,
          role: data.role,
          isPrivate: room.visibility === 'private',
          joinCode: room.join_code,
          difficulty: room.difficulty,
          timeLimit: room.time_limit,
          capacity: room.capacity,
          is_ranked:room.is_ranked
        },
      });
    } catch (err) {
      console.error('Error joining room:', err);

      if (err.response?.status === 401) {
        dispatch(logoutSuccess());
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        navigate('/login');
      }

      toast.error(err.response?.data?.error || err.message || 'Failed to join room');
    } finally {
      dispatch(resetLoading());
    }
  };

  const handlePasswordSubmit = (roomId) => {
    const room = rooms.find((r) => r.room_id === roomId);
    if (room) {
      handleJoinRoom(room);
    }
  };

  const handlePasswordChange = (roomId, value) => {
    setPasswords((prev) => ({ ...prev, [roomId]: value }));
  };

  const handleCancel = (roomId) => {
    setPasswordRoomId(null);
    setPasswords((prev) => ({ ...prev, [roomId]: '' }));
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.owner__username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.join_code.includes(searchTerm);

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'active') return matchesSearch && room.status === 'active';
    if (activeFilter === 'public') return matchesSearch && room.visibility === 'public';
    if (activeFilter === 'private') return matchesSearch && room.visibility === 'private';
    if (activeFilter === 'ranked') return matchesSearch && room.is_ranked;
    if (activeFilter === 'casual') return matchesSearch && !room.is_ranked;

    return matchesSearch;
  });

  const getRandomMatrixElement = () => {
    const chars = '01';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-16 overflow-y-auto relative">
      {wsError && (
        <div className="bg-red-500/20 border border-red-500 p-4 rounded-md flex items-center mb-6 mx-auto max-w-6xl">
          <AlertTriangle className="text-red-500 mr-2" size={20} />
          <p className="text-red-500">{wsError}</p>
        </div>
      )}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }, (_, i) => (
          <span
            key={i}
            className="absolute text-xs text-green-500 opacity-20"
            style={{
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              animation: `pulse ${Math.random() * 4 + 1}s infinite ${Math.random() * 2}s`,
              fontSize: `${Math.random() * 12 + 8}px`,
            }}
          >
            {getRandomMatrixElement()}
          </span>
        ))}
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8 border-b border-green-500/30 pb-4">
        <h1 className="text-4xl md:text-5xl text-white font-orbitron tracking-widest font-bold flex items-center justify-center space-x-2">
  <span className="text-[#22c55e]">&lt;</span>
  <span className="text-[#22c55e]">BATTLE</span>
  <span className="text-[#22c55e]">&gt;</span>
</h1>

          <CustomButton variant="create" onClick={() => setShowModal(true)}>
            Create Room
          </CustomButton>
        </div>
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" size={20} />
            <input
              type="text"
              placeholder="Search rooms by name, host, or join code.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 bg-gray-900/90 border border-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/50 transition-all duration-300 backdrop-blur-sm"
              aria-label="Search rooms"
            />
          </div>
          <div className="flex flex-wrap gap-2">
  {['all', 'active', 'public', 'private', 'ranked', 'casual'].map((filter) => (
    <button
      key={filter}
      onClick={() => setActiveFilter(filter)}
      className={`px-4 py-2 rounded-md text-sm transition-all duration-300 border
        ${
          activeFilter === filter
            ? 'bg-transparent text-white border-[#00ff73]'
            : 'bg-gray-900/90 text-white border-gray-700 hover:bg-gray-800/90 hover:border-gray-600 hover:text-[#00ff73]'
        }`}
    >
      {filter.charAt(0).toUpperCase() + filter.slice(1)}
    </button>
  ))}
</div>


        </div>
        {loading && (
          <div className="flex justify-center items-center py-12">
            <BitCodeProgressLoading
              message="Loading rooms..."
              size="large"
              showBackground={false}
              style="terminal"
              progress={50}
            />
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-500 p-4 rounded-md flex items-center mb-6">
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            <p className="text-red-500">Error: {error}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.room_id}
              className="bg-gray-900/85 backdrop-blur-md p-6 rounded-lg border border-gray-800 hover:border-green-400 transition-all duration-300 group relative overflow-hidden transform hover:scale-105 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              {room.visibility === 'private' && passwordRoomId === room.room_id ? (
                <div className="flex flex-col h-full justify-center p-4 bg-gradient-to-b from-gray-900/95 to-gray-800/90 rounded-lg relative animate-fadeIn">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center font-['Orbitron'] tracking-wider text-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                    {room.name}
                  </h3>
                  <input
                    type="password"
                    value={passwords[room.room_id] || ''}
                    onChange={(e) => handlePasswordChange(room.room_id, e.target.value)}
                    placeholder="Enter room password"
                    className="w-full p-3 bg-gray-900/90 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/50 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-300 mb-6 animate-pulse-border"
                    aria-label="Room password"
                  />
                  <div className="flex justify-between gap-3">
                    <button
                      onClick={() => handleCancel(room.room_id)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-800 to-red-900/50 text-gray-300 rounded-md hover:from-gray-700 hover:to-red-800 hover:shadow-[0_0_8px_rgba(239,68,68,0.3)] transition-all duration-300 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handlePasswordSubmit(room.room_id)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-400 text-black font-medium rounded-md hover:from-green-600 hover:to-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-300 text-sm"
                    >
                      Join Battle
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-green-400/50"></div>
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-green-400/50"></div>
                </div>
              ) : (
                <>
                  {room.visibility === 'private' && (
                    <div className="absolute top-3 right-3 bg-gray-500/20 p-1 rounded-md">
                      <Lock className="text-gray-700" size={18} aria-label="Private room" />
                    </div>
                  )}
                  {room.status === 'active' && (
                    <div className="absolute top-3 right-12 bg-yellow-500/20 p-1 rounded-md">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1 animate-pulse"></span>
                        <span className="text-yellow-400 text-xs font-medium">LIVE</span>
                      </div>
                    </div>
                  )}
                  <div className="relative mb-4">
                    <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-green-400 transition-all duration-300 font-['Orbitron'] tracking-wide">
                      {room.name}
                    </h3>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm">
                      <Users className="w-5 h-5 mr-2 text-gray-400" />
                      <p className="text-gray-300">
                        Hosted by <span className="text-white">{room.owner__username}</span>
                      </p>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-5 h-5 mr-2 text-gray-400" />
                      <p className="text-gray-300">
                        <span className="text-white">{room.participant_count}</span>/{room.capacity} participants
                      </p>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-5 h-5 mr-2 text-gray-400" />
                      <p className="text-gray-300">
                        <span className="text-white">
                          {room.is_ranked ? 'Ranked' : `${room.time_limit} minutes`}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center text-sm">
                      <Layers className="w-5 h-5 mr-2 text-gray-400" />
                      <p className="text-gray-300">
                        Topic: <span className="text-white">{room.topic}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-5">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        room.difficulty === 'easy'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : room.difficulty === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                          : 'bg-red-500/20 text-red-400 border border-red-500/50'
                      }`}
                    >
                      {room.difficulty.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        room.visibility === 'public'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      }`}
                    >
                      {room.visibility.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        room.is_ranked
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                      }`}
                    >
                      {room.is_ranked ? 'RANKED' : 'CASUAL'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      className="px-3 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 transition-all duration-300 flex items-center text-sm"
                      aria-label="View leaderboard"
                    >
                      <Trophy size={18} className="mr-2 text-yellow-400" /> Leaderboard
                    </button>
                    <button
                      onClick={() => handleJoinRoom(room)}
                      className="px-3 py-2 border-2 border-[#00FF40] text-[#00FF40] font-medium rounded-md hover:bg-[#00FF40] hover:text-black transition-colors duration-300 flex items-center text-sm"
                      aria-label={`Enter room ${room.name}`}
                    >
                      <Swords size={18} className="mr-2" /> Battle
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-green-400/50"></div>
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-green-400/50"></div>
                </>
              )}
            </div>
          ))}
          {filteredRooms.length === 0 && !loading && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 border border-dashed border-gray-700 rounded-lg">
              <Search className="text-gray-500 mb-4" size={40} />
              <p className="text-gray-400 mb-4">No rooms found with the current filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('all');
                }}
                className="mt-4 text-green-400 hover:text-green-300 text-sm underline transition-all duration-300"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <CreateRoomModal
          onClose={() => setShowModal(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes glitch {
          0% {
            transform: translate(0);
            opacity: 0.2;
          }
          2% {
            transform: translate(-2px, 2px);
            opacity: 0.1;
          }
          4% {
            transform: translate(2px, -2px);
            opacity: 0.3;
          }
          6% {
            transform: translate(0);
            opacity: 0.2;
          }
          100% {
            transform: translate(0);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};

export default Rooms;