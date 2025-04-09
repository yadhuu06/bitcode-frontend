import React, { useState, useEffect } from 'react';

const Rooms = () => {
  // Sample room data (can be replaced with WebSocket/API data)
  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: 'Binary Battle Royale',
      participants: 5,
      maxParticipants: 10,
      status: 'Active',
      difficulty: 'Easy',
      tags: ['algorithms', 'binary search'],
      startTime: '2025-04-09 14:00',
    },
    {
      id: 2,
      name: 'Matrix Marathon',
      participants: 3,
      maxParticipants: 8,
      status: 'Pending',
      difficulty: 'Medium',
      tags: ['graph', 'bfs'],
      startTime: '2025-04-09 15:30',
    },
    {
      id: 3,
      name: 'DP Duel',
      participants: 7,
      maxParticipants: 12,
      status: 'Active',
      difficulty: 'Medium',
      tags: ['dynamic programming'],
      startTime: '2025-04-09 16:00',
    },
    {
      id: 4,
      name: 'Tree Challenge',
      participants: 2,
      maxParticipants: 6,
      status: 'Pending',
      difficulty: 'Easy',
      tags: ['tree', 'dfs'],
      startTime: '2025-04-09 17:00',
    },
    {
      id: 5,
      name: 'LRU Showdown',
      participants: 4,
      maxParticipants: 10,
      status: 'Active',
      difficulty: 'Hard',
      tags: ['design', 'hash table'],
      startTime: '2025-04-09 18:00',
    },
  ]);

  // State for filters
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter rooms based on difficulty, status, and search
  const filteredRooms = rooms.filter((room) => {
    const matchesDifficulty = !difficultyFilter || room.difficulty === difficultyFilter;
    const matchesStatus = !statusFilter || room.status === statusFilter;
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDifficulty && matchesStatus && matchesSearch;
  });

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
    <div className="min-h-screen bg-black text-white font-mono pt-24 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-800">
      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto ml-75 mr-75 px-0 py-8">
        {/* Header */}
        <h1 className="text-2xl text-green-500 mb-8">Rooms</h1>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <input
            type="text"
            placeholder="Search rooms by name or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-2/3 p-3 bg-gray-800/60 border border-transparent rounded text-white placeholder-white focus:border-green-500 focus:outline-none transition-all duration-300"
          />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full md:w-1/4 p-3 bg-gray-800/60 border border-transparent rounded text-white focus:border-green-500 focus:outline-none transition-all duration-300"
          >
            <option value="">Filter by Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Filters and Room List */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/5 bg-gray-800/60 p-5 rounded-lg border-2 border-green-500 shadow-[0_0_8px_#00ff00]">
            <h2 className="text-lg text-green-500 mb-5">DIFFICULTY</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 hover:text-shadow-[0_0_4px_#00ff00] transition-all duration-300">
                <input
                  type="radio"
                  name="difficulty"
                  value="Easy"
                  checked={difficultyFilter === 'Easy'}
                  onChange={() => setDifficultyFilter('Easy')}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-green-500">Easy</span>
              </label>
              <label className="flex items-center space-x-2 hover:text-shadow-[0_0_4px_#00ff00] transition-all duration-300">
                <input
                  type="radio"
                  name="difficulty"
                  value="Medium"
                  checked={difficultyFilter === 'Medium'}
                  onChange={() => setDifficultyFilter('Medium')}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-yellow-500">Medium</span>
              </label>
              <label className="flex items-center space-x-2 hover:text-shadow-[0_0_4px_#00ff00] transition-all duration-300">
                <input
                  type="radio"
                  name="difficulty"
                  value="Hard"
                  checked={difficultyFilter === 'Hard'}
                  onChange={() => setDifficultyFilter('Hard')}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-red-500">Hard</span>
              </label>
            </div>
            <h2 className="text-lg text-green-500 mt-6 mb-5">STATUS</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 hover:text-shadow-[0_0_4px_#00ff00] transition-all duration-300">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={statusFilter === 'Active'}
                  onChange={() => setStatusFilter('Active')}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-green-500">Active</span>
              </label>
              <label className="flex items-center space-x-2 hover:text-shadow-[0_0_4px_#00ff00] transition-all duration-300">
                <input
                  type="radio"
                  name="status"
                  value="Pending"
                  checked={statusFilter === 'Pending'}
                  onChange={() => setStatusFilter('Pending')}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-yellow-500">Pending</span>
              </label>
            </div>
          </div>

          {/* Room List */}
          <div className="w-full lg:w-4/5">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-gray-900/80 p-5 mb-6 rounded-lg border-2 border-green-500 hover:border-transparent hover:shadow-[0_0_8px_#00ff00] transition-all duration-300 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-bold text-white">{room.name}</h3>
                  <p className="text-gray-400 text-sm">Starts: {new Date(room.startTime).toLocaleString()}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {room.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-transparent border border-white text-white text-xs shadow-[0_0_2px_#ffffff]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    {room.participants}/{room.maxParticipants} Participants
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded ${
                      room.difficulty === 'Easy' ? 'bg-green-500 text-black' :
                      room.difficulty === 'Medium' ? 'bg-yellow-500 text-black' :
                      'bg-red-500 text-white'
                    }`}
                  >
                    {room.difficulty}
                  </span>
                  <span
                    className={`px-2 py-1 rounded ml-2 ${
                      room.status === 'Active' ? 'bg-green-500 text-black' :
                      'bg-yellow-500 text-black'
                    }`}
                  >
                    {room.status}
                  </span>
                  <button
                    className="mt-3 px-4 py-2 bg-green-500 text-black rounded hover:bg-green-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    onClick={() => alert(`Joining room: ${room.name}`)} // Replace with actual join logic
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
            {filteredRooms.length === 0 && (
              <p className="text-gray-400 text-center">No rooms found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Inline CSS for custom styles */}
      <style jsx>{`
        @keyframes glow {
          0% { text-shadow: 0 0 4px #00ff00; }
          50% { text-shadow: 0 0 8px #00ff00; }
          100% { text-shadow: 0 0 4px #00ff00; }
        }
        .glowing-text {
          animation: glow 1.5s ease-in-out infinite;
        }
        .ml-75 {
          margin-left: 75px;
        }
        .mr-75 {
          margin-right: 75px;
        }
      `}</style>
    </div>
  );
};

export default Rooms;