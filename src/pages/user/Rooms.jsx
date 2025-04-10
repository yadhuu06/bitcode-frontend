import React, { useState, useEffect } from 'react';
import { Search, Lock, Trophy, Play } from 'lucide-react';

const Rooms = () => {
  // Sample room data (can be replaced with WebSocket/API data)
  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: 'Binary Tree Challenge',
      host: 'matrix_master',
      participants: 3,
      maxParticipants: 5,
      difficulty: 'Medium',
      status: 'In progress',
      duration: '45 min',
      isPrivate: false,
    },
    {
      id: 2,
      name: 'Algorithm Speedrun',
      host: 'codehack3r',
      participants: 8,
      maxParticipants: 10,
      difficulty: 'Hard',
      status: 'In progress',
      duration: '60 min',
      isPrivate: false,
    },
    {
      id: 3,
      name: "Beginner's Challenge",
      host: 'newbie_helper',
      participants: 2,
      maxParticipants: 8,
      difficulty: 'Easy',
      status: 'In progress',
      duration: '30 min',
      isPrivate: false,
    },
    {
      id: 4,
      name: 'Private Team Practice',
      host: 'team_lead',
      participants: 4,
      maxParticipants: 6,
      difficulty: 'Medium',
      status: 'In progress',
      duration: '60 min',
      isPrivate: true,
    },
  ]);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');

  // Filter rooms based on search
  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simulate real-time updates (replace with WebSocket logic)
  useEffect(() => {
    const interval = setInterval(() => {
      setRooms(prevRooms =>
        prevRooms.map(room => ({
          ...room,
          participants: room.participants + (Math.random() > 0.7 ? 1 : 0) % (room.maxParticipants + 1),
        })).filter(room => room.participants <= room.maxParticipants)
      );
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-12 overflow-y-auto relative">
      {/* Binary Particle Background */}
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl text-white flex items-center">
            <span className="text-green-500 mr-2">0</span>Challenge Rooms
          </h1>
          <button
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-all duration-300 flex items-center"
          >
            <span className="mr-2">+</span> Create Room
          </button>
        </div>

        {/* Search */}
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

        {/* Room Grid */}
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
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" fill="currentColor" />
                  <path d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20" stroke="currentColor" strokeWidth="2" />
                </svg>
                <p className="text-gray-400">Hosted by {room.host}</p>
              </div>
              
              <div className="flex items-center mb-3 text-sm">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" fill="currentColor" />
                  <circle cx="16" cy="18" r="2" fill="currentColor" />
                  <circle cx="8" cy="18" r="2" fill="currentColor" />
                </svg>
                <p className="text-gray-400">{room.participants}/{room.maxParticipants} participants</p>
              </div>
              
              <div className="flex items-center mb-4 text-sm">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" />
                </svg>
                <p className="text-gray-400">{room.duration}</p>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    room.difficulty === 'Easy' ? 'bg-green-500 text-black' :
                    room.difficulty === 'Medium' ? 'bg-yellow-500 text-black' :
                    'bg-red-500 text-white'
                  }`}
                >
                  {room.difficulty}
                </span>
                <span className="text-yellow-500 text-xs">In progress</span>
              </div>
              
              <div className="flex justify-between mt-4">
                <button
                  className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-all duration-300 flex items-center"
                >
                  <Trophy size={16} className="mr-1" /> Leaderboard
                </button>
                <button
                  className={`px-3 py-1 ${room.id === 3 ? 'bg-yellow-500' : 'bg-white'} ${room.id === 3 ? 'text-black' : 'text-black'} rounded hover:opacity-90 transition-all duration-300 flex items-center`}
                >
                  <Play size={16} className="mr-1" /> {room.id === 3 ? 'Join Room' : 'Enter Room'}
                </button>
              </div>
            </div>
          ))}
          {filteredRooms.length === 0 && (
            <p className="text-gray-400 text-center col-span-full">No rooms found.</p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default Rooms;