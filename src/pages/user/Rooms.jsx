
import React, { useState, useEffect } from 'react';
import { Search, Lock, Trophy, Play, X } from 'lucide-react';

const Rooms = () => {
  // Sample room data (replace with API/WebSocket data)
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

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [capacity, setCapacity] = useState('2'); // Default to 1 vs 1 (2 participants)

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simulate real-time updates (replace with WebSocket logic)
  useEffect(() => {
    const interval = setInterval(() => {
      setRooms((prevRooms) =>
        prevRooms
          .map((room) => ({
            ...room,
            participants: Math.min(
              room.participants + (Math.random() > 0.7 ? 1 : 0),
              room.maxParticipants
            ),
          }))
          .filter((room) => room.participants <= room.maxParticipants)
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close modal and reset states
  const handleCloseModal = () => {
    setShowModal(false);
    setVisibility('public');
    setCapacity('2');
  };

  // Dynamic description for capacity
  const getCapacityDescription = () => {
    switch (capacity) {
      case '5':
        return 'Minimum 3 participants required';
      case '10':
        return 'Minimum 7 participants required';
      default:
        return '';
    }
  };

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
            className="px-4 py-2 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-black transition-all duration-300 flex items-center"
            onClick={() => setShowModal(true)}
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
                  <path
                    d="M12 7V12L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
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
          {filteredRooms.length === 0 && (
            <p className="text-gray-400 text-center col-span-full">No rooms found.</p>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div
            className="bg-gray-900/80 backdrop-blur-md p-6 rounded-lg w-full max-w-lg border border-gray-700/50 shadow-2xl animate-modal-enter"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-300 bg-clip-text text-transparent">
                Create Coding Challenge
              </h2>
              <button onClick={handleCloseModal}>
                <X className="text-gray-300 hover:text-white transition-colors" size={24} />
              </button>
            </div>
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Room Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter room name"
                  required
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Topic</label>
                <select
                  name="topic"
                  required
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:border-green-500 transition-all duration-200"
                >
                  <option value="Array">Array</option>
                  <option value="String">String</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Difficulty</label>
                <select
                  name="difficulty"
                  required
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:border-green-500 transition-all duration-200"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Time Limit (minutes)</label>
                <input
                  type="number"
                  name="time_limit"
                  placeholder="Enter time limit"
                  min="1"
                  required
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Capacity</label>
                <select
                  name="capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:border-green-500 transition-all duration-200"
                >
                  <option value="2">1 vs 1</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                </select>
                {getCapacityDescription() && (
                  <p className="mt-1.5 text-xs text-gray-400">{getCapacityDescription()}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Visibility</label>
                <select
                  name="visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:border-green-500 transition-all duration-200"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              {visibility === 'private' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-all duration-200"
                  />
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2 bg-gray-700/50 text-gray-200 rounded-md hover:bg-gray-600 transition-all duration-200"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-500 text-black rounded-md hover:bg-green-400 transition-all duration-200"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-modal-enter {
          animation: modal-enter 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Rooms;
