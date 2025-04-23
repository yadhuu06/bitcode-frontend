import React, { useState, useEffect } from 'react';
import { Search, Lock, Trophy, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CreateRoomModal from '../../components/modals/CreateRoomModal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms, createNewRoom } from '../../store/slices/roomSlice';

const Rooms = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rooms, loading, error } = useSelector((state) => state.rooms);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  const handleRoomCreated = (newRoom) => {
    dispatch(createNewRoom(newRoom));
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-12 overflow-y-auto relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }, (_, i) => (
          <span
            key={i}
            className="absolute text-xs text-green-500 opacity-50"
            style={{
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              animation: `pulse 2s infinite ${Math.random() * 2}s`,
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </span>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl text-white flex items-center">
            <span className="text-green-500 mr-2">0</span>Challenge Rooms
          </h1>
          <button
            className="px-4 py-2 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-black transition-all duration-300 flex items-center"
            onClick={() => setShowModal(true)}
          >
            <span className="mr-2">+</span> Create Room
          </button>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search rooms by name or host..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-all duration-300"
            />
          </div>
        </div>

        {loading && <p className="text-gray-400 text-center">Loading rooms...</p>}
        {error && <p className="text-red-500 text-center">Error: {error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-gray-900 p-5 rounded-lg border border-gray-800 transition-all duration-300 relative"
            >
              {room.isPrivate && (
                <Lock className="absolute top-5 right-5 text-yellow-500" size={18} />
              )}
              <h3 className="text-lg font-semibold text-white mb-2">{room.name}</h3>
              <div className="flex items-center mb-3 text-sm">
                <svg
                  className="w-4 h-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="8" r="4" fill="currentColor" />
                  <path
                    d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <p className="text-gray-400">Hosted by {room.host}</p>
              </div>
              <div className="flex items-center mb-3 text-sm">
                <svg
                  className="w-4 h-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="8" r="4" fill="currentColor" />
                  <circle cx="16" cy="18" r="2" fill="currentColor" />
                  <circle cx="8" cy="18" r="2" fill="currentColor" />
                </svg>
                <p className="text-gray-400">
                  {room.participants}/{room.maxParticipants} participants
                </p>
              </div>
              <div className="flex items-center mb-4 text-sm">
                <svg
                  className="w-4 h-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" />
                </svg>
                <p className="text-gray-400">{room.duration}</p>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    room.difficulty === 'Easy'
                      ? 'bg-green-500 text-black'
                      : room.difficulty === 'Medium'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {room.difficulty}
                </span>
                <span className="text-yellow-500 text-xs">In progress</span>
              </div>
              <div className="flex justify-between mt-4">
                <button className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-all duration-300 flex items-center">
                  <Trophy size={16} className="mr-1" /> Leaderboard
                </button>
                <button
                  onClick={() => navigate(`/room/${room.id}`)}
                  className={`px-3 py-1 ${
                    room.id === 3 ? 'bg-yellow-500' : 'bg-white'
                  } ${room.id === 3 ? 'text-black' : 'text-black'} rounded hover:opacity-90 transition-all duration-300 flex items-center`}
                >
                  <Play size={16} className="mr-1" />{' '}
                  {room.id === 3 ? 'Join Room' : 'Enter Room'}
                </button>
              </div>
            </div>
          ))}
          {filteredRooms.length === 0 && !loading && (
            <p className="text-gray-400 text-center col-span-full">No rooms found.</p>
          )}
        </div>
      </div>

      {showModal && (
        <CreateRoomModal
          onClose={() => setShowModal(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </div>
  );
};

export default Rooms;