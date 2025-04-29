import React, { useState, useEffect } from 'react';
import { Search, Lock, Trophy, Play, Users, Clock, Layers, User, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import CreateRoomModal from '../../components/modals/CreateRoomModal';
import { fetchRooms, createNewRoom } from '../../store/slices/roomSlice';
import CustomButton from '../../components/ui/CustomButton';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Rooms = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rooms, loading, error } = useSelector((state) => state.rooms);
  const { accessToken } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [socket, setSocket] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!accessToken) {
      toast.error('Please log in to view rooms');
      navigate('/login');
      return;
    }

    // Initialize WebSocket with JWT token
    const wsURL = `${API_BASE_URL.replace('http', 'ws')}/ws/rooms/?token=${accessToken}`;
    const ws = new WebSocket(wsURL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      toast.success('Connected to server');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'room_list' || data.type === 'room_update') {
          dispatch(fetchRooms());
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
        toast.error('Invalid server message');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.warn('WebSocket disconnected');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [accessToken, dispatch, navigate]);

  useEffect(() => {
    dispatch(fetchRooms()).catch((err) => {
      console.error('Failed to fetch rooms:', err);
      toast.error('Failed to load rooms');
    });
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const handleRoomCreated = async (newRoom) => {
    try {
      await dispatch(createNewRoom(newRoom)).unwrap();
      toast.success('Room created successfully');
      setShowModal(false);
    } catch (err) {
      console.error('Failed to create room:', err);
      toast.error('Failed to create room');
    }
  };

  const filteredRooms = rooms.filter(room => {
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
              Crete Room
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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
                <div className="absolute top-3 right-3 bg-purple-500/20 p-1 rounded-md">
                  <Lock className="text-purple-400" size={16} aria-label="Private room" />
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
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-gray-300">Hosted by <span className="text-white">{room.owner__username}</span></p>
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
                onClick={() => {setSearchTerm(''); setActiveFilter('all');}}
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
      
      {/* Add CSS for animated matrix effect */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Rooms;