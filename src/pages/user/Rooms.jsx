import React, { useState, useEffect, useRef } from 'react';
import { Search, Lock, Trophy, Play, Users, Clock, Layers, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { logoutSuccess } from '../../store/slices/authSlice';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { fetchRooms, createNewRoom, updateRooms } from '../../store/slices/roomSlice';
import CreateRoomModal from '../../components/modals/CreateRoomModal';
import CustomButton from '../../components/ui/CustomButton';
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// BitCodeProgressLoading Component
const BitCodeProgressLoading = ({ message, progress, size, showBackground, style }) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  };
  const styleClasses = {
    terminal: 'bg-green-600 animate-pulse',
    compile: 'bg-blue-600 animate-spin',
    battle: 'bg-red-600 animate-bounce',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${showBackground ? 'bg-black bg-opacity-70' : ''} p-4 rounded-lg`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.large} ${styleClasses[style] || styleClasses.terminal} rounded-full flex items-center justify-center`}
      >
        <span className="text-white font-mono text-sm">{Math.round(progress)}%</span>
      </div>
      <p className="mt-2 text-white font-mono">{message}</p>
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
  const wsRef = useRef(null); // Track WebSocket instance
  const reconnectAttempts = useRef(0); // Track reconnection attempts
  const maxReconnectAttempts = 5; // Limit reconnection attempts
  const reconnectInterval = 5000; 

  useEffect(() => {
    if (!accessToken) {
      toast.error('Please log in to view rooms');
      navigate('/login');
      return;
    }

    const connectWebSocket = () => {
      // Only create a new WebSocket if none exists or it's closed
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      }

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setWsError('Max reconnection attempts reached');
        toast.error('Unable to connect to server. Please try again later.');
        return;
      }

      console.log('Initiating WebSocket connection', accessToken);
      const encodedToken = encodeURIComponent(accessToken);
      const wsURL = `${API_BASE_URL.replace('http', 'ws')}/ws/rooms/?token=${accessToken}`;
      wsRef.current = new WebSocket(wsURL);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setWsError(null);
        reconnectAttempts.current = 0; // Reset on successful connection
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);
          if (data.type === 'room_list' || data.type === 'room_update') {
            dispatch(updateRooms(data.rooms)); // Update Redux store
          } else if (data.type === 'error') {
            console.error('Server error:', data.message);
            setWsError(data.message);
            toast.error(data.message);
          } else {
            console.warn('Unknown message type:', data.type);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setWsError('Invalid server message');
          toast.error('Invalid server message');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsError('WebSocket connection failed');
        toast.error('WebSocket connection failed');
      };

      wsRef.current.onclose = (event) => {
        console.warn('WebSocket disconnected:', event.code, event.reason);
        setWsError(`WebSocket closed with code ${event.code}: ${event.reason || 'Unknown reason'}`);
        
        if (event.code === 4001 || event.code === 4002) {
          // Token-related errors: log out and redirect
          toast.error('Session expired. Please log in again.');
          dispatch(logoutSuccess());
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          navigate('/login');
        } else {
          // Attempt to reconnect for other errors (e.g., 1006)
          reconnectAttempts.current += 1;
          setTimeout(() => {
            console.log(`Reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
            connectWebSocket();
          }, reconnectInterval);
        }
      };
    };

    connectWebSocket();


    return () => {
      console.log('Cleaning up WebSocket');
      // Only close WebSocket on permanent unmount (e.g., logout or navigation)
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [accessToken, navigate, dispatch]);



  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const handleRoomCreated = async (newRoom) => {
    dispatch(setLoading({ isLoading: true, message: 'Creating room...', style: 'compile', progress: 0 }));
    try {
      await dispatch(createNewRoom(newRoom)).unwrap();
      toast.success('Room created successfully');
      setShowModal(false);
    } catch (err) {
      console.error('Failed to create room:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create room';
      toast.error(errorMessage);
      if (err.response?.status === 401) {
        dispatch(logoutSuccess());
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        navigate('/login');
      }
    } finally {
      dispatch(resetLoading());
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.owner__username.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'active') return matchesSearch && room.status === 'active';
    if (activeFilter === 'public') return matchesSearch && room.visibility === 'public';
    if (activeFilter === 'private') return matchesSearch && room.visibility === 'private';

    return matchesSearch;
  });

  // Animation for background matrix effect
  const getRandomMatrixElement = () => {
    const chars = '01';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-16 overflow-y-auto relative">
      {/* Display WebSocket error */}
      {wsError && (
        <div className="bg-red-500/20 border border-red-500 p-4 rounded-md flex items-center mb-6 mx-auto max-w-6xl">
          <AlertTriangle className="text-red-500 mr-2" size={20} />
          <p className="text-red-500">{wsError}</p>
        </div>
      )}

      {/* Futuristic background matrix effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 100 }, (_, i) => (
          <span
            key={i}
            className="absolute text-xs text-green-500 opacity-30"
            style={{
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              animation: `pulse ${Math.random() * 3 + 1}s infinite ${Math.random() * 2}s`,
              fontSize: `${Math.random() * 10 + 8}px`,
            }}
          >
            {getRandomMatrixElement()}
          </span>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Header section with improved styling */}
        <div className="flex justify-between items-center mb-8 border-b border-green-500/30 pb-4">
          <h1 className="text-3xl text-white flex items-center tracking-wider">
            <span className="text-green-500 mr-2 font-bold">&lt;</span>
            Challenge Rooms
            <span className="text-green-500 ml-2 font-bold">/&gt;</span>
          </h1>
          <CustomButton variant="create" onClick={() => setShowModal(true)}>
            Create Room
          </CustomButton>
        </div>

        {/* Search and filter section */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" size={20} />
            <input
              type="text"
              placeholder="Search rooms by name or host..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 bg-gray-900/80 border border-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-300 backdrop-blur-sm"
              aria-label="Search rooms"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-2 rounded-md text-sm transition-all duration-300 ${
                activeFilter === 'all'
                  ? 'bg-green-500 text-black font-medium'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-2 rounded-md text-sm transition-all duration-300 ${
                activeFilter === 'active'
                  ? 'bg-yellow-500 text-black font-medium'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveFilter('public')}
              className={`px-3 py-2 rounded-md text-sm transition-all duration-300 ${
                activeFilter === 'public'
                  ? 'bg-blue-500 text-white font-medium'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setActiveFilter('private')}
              className={`px-3 py-2 rounded-md text-sm transition-all duration-300 ${
                activeFilter === 'private'
                  ? 'bg-purple-500 text-white font-medium'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Private
            </button>
          </div>
        </div>

        {/* Loading state */}
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

        {/* Error state */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 p-4 rounded-md flex items-center mb-6">
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            <p className="text-red-500">Error: {error}</p>
          </div>
        )}

        {/* Redesigned room grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.room_id}
              className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg border border-gray-800 hover:border-green-500 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Private room indicator */}
              {room.visibility === 'private' && (
                <div className="absolute top-3 right-3 bg-grey-500/20 p-1 rounded-md">
                  <Lock className="text-gray-700" size={16} aria-label="Private room" />
                </div>
              )}

              {/* Active status indicator */}
              {room.status === 'active' && (
                <div className="absolute top-3 right-12 bg-yellow-500/20 p-1 rounded-md">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></span>
                    <span className="text-yellow-500 text-xs">LIVE</span>
                  </div>
                </div>
              )}

              {/* Room name with futuristic line */}
              <div className="relative mb-4">
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-green-400 transition-all duration-300">
                  {room.name}
                </h3>
              </div>

              {/* Room details with improved icons */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-gray-300">
                    Hosted by <span className="text-white">{room.owner__username}</span>
                  </p>
                </div>

                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-gray-300">
                    <span className="text-white">{room.participant_count}</span>/{room.capacity} participants
                  </p>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-gray-300">
                    <span className="text-white">{room.time_limit}</span> minutes
                  </p>
                </div>

                <div className="flex items-center text-sm">
                  <Layers className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-gray-300">
                    Topic: <span className="text-white">{room.topic}</span>
                  </p>
                </div>
              </div>

              {/* Room badges in a cleaner layout */}
              <div className="flex items-center gap-2 mb-5">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    room.difficulty === 'easy'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : room.difficulty === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {room.difficulty.toUpperCase()}
                </span>

                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    room.visibility === 'public'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}
                >
                  {room.visibility.toUpperCase()}
                </span>
              </div>

              {/* Action buttons with improved styling */}
              <div className="flex justify-between items-center">
                <button
                  className="px-3 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition-all duration-300 flex items-center text-sm"
                  aria-label="View leaderboard"
                >
                  <Trophy size={16} className="mr-2 text-yellow-500" /> Leaderboard
                </button>

                <button
                  onClick={() => navigate(`/room/${room.room_id}`)}
                  className="px-3 py-2 bg-green-500 text-black font-medium rounded-md hover:bg-green-400 transition-all duration-300 flex items-center text-sm"
                  aria-label={`Enter room ${room.name}`}
                >
                  <Play size={16} className="mr-2" /> Enter Room
                </button>
              </div>

              {/* Futuristic corner embellishments */}
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-green-500/30"></div>
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-green-500/30"></div>
            </div>
          ))}

          {/* Empty state */}
          {filteredRooms.length === 0 && !loading && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 border border-dashed border-gray-700 rounded-lg">
              <Search className="text-gray-500 mb-4" size={40} />
              <p className="text-gray-400 text-center">No rooms match your search criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('all');
                }}
                className="mt-4 text-green-500 hover:text-green-400 text-sm underline"
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

      {/* CSS for animated matrix effect */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default Rooms;