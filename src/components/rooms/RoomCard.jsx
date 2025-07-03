import React from 'react';
import { Lock, Trophy, Users, Clock, Layers, X, Swords } from 'lucide-react';

const RoomCard = ({ room, onJoin, passwordRoomId, passwords, onPasswordChange, onPasswordSubmit, onCancel }) => {
  // Safeguard against undefined room
  if (!room || typeof room !== 'object') {
    return null; // Or a placeholder UI
  }

  const isPasswordPrompt = room.visibility === 'private' && passwordRoomId === room.room_id;

  if (isPasswordPrompt) {
    return (
      <div className="flex flex-col h-full justify-center p-6 bg-gray-900/95 backdrop-blur-sm rounded-lg relative animate-fadeIn">
        <h3 className="text-2xl font-bold text-white mb-6 text-center font-['Orbitron'] tracking-wider text-shadow-[0_0_6px_rgba(34,197,94,0.4)]">
          {room.name}
        </h3>
        <input
          type="password"
          value={passwords[room.room_id] || ''}
          onChange={(e) => onPasswordChange(room.room_id, e.target.value)}
          placeholder="Enter room password"
          className="w-full h-12 p-4 bg-gray-950/90 border border-green-500/30 rounded-md text-white placeholder-gray-500 font-['Orbitron'] text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all duration-200 mb-6"
          aria-label="Room password"
        />
        <div className="flex justify-between gap-4">
          <button
            onClick={() => onCancel(room.room_id)}
            className="w-1/2 h-10 px-3 py-1 border border-red-500 text-red-500 font-['Orbitron'] text-sm rounded-md hover:bg-red-500 hover:text-white transition-all duration-150 flex items-center justify-center"
          >
            <X size={16} className="mr-2" /> Cancel
          </button>
          <button
            onClick={() => onPasswordSubmit(room.room_id)}
            className="w-1/2 h-10 px-3 py-1 border border-[#00ff40] text-[#00ff40] font-['Orbitron'] text-sm rounded-md hover:bg-[#00ff40] hover:text-black transition-all duration-150 flex items-center justify-center"
          >
            <Swords size={16} className="mr-2" /> Battle
          </button>
        </div>
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-green-400/30"></div>
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-green-400/30"></div>
      </div>
    );
  }

  return (
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
      {room.status === 'Playing' && (
        <div className="absolute top-3 right-12 bg-green-500/20 p-1 rounded-md">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
            <span className="text-green-400 text-xs font-medium">PLAYING</span>
          </div>
        </div>
      )}
      {room.status === 'completed' && (
        <div className="absolute top-3 right-12 bg-red-500/20 p-1 rounded-md">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
            <span className="text-red-400 text-xs font-medium">CLOSED</span>
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
          <p className="text-gray-300">Hosted by <span className="text-white">{room.owner__username}</span></p>
        </div>
        {room.status === 'active' && (
          <div className="flex items-center text-sm">
            <Users className="w-5 h-5 mr-2 text-gray-400" />
            <p className="text-gray-300"><span className="text-white">{room.participant_count}</span>/{room.capacity} participants</p>
          </div>
        )}
        <div className="flex items-center text-sm">
          <Clock className="w-5 h-5 mr-2 text-gray-400" />
          <p className="text-gray-300"><span className="text-white">{room.is_ranked ? 'Ranked' : `${room.time_limit} minutes`}</span></p>
        </div>
        <div className="flex items-center text-sm">
          <Layers className="w-5 h-5 mr-2 text-gray-400" />
          <p className="text-gray-300">Topic: <span className="text-white">{room.topic}</span></p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-5">
        <span className={`px-2 py-1 rounded text-xs font-medium ${room.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : room.difficulty === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
          {room.difficulty.toUpperCase()}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${room.visibility === 'public' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-purple-500/20 text-purple-400 border border-purple-500/50'}`}>
          {room.visibility.toUpperCase()}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${room.is_ranked ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'}`}>
          {room.is_ranked ? 'RANKED' : 'CASUAL'}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 transition-all duration-300 flex items-center text-sm" aria-label="View leaderboard">
          <Trophy size={18} className="mr-2 text-yellow-400" /> Leaderboard
        </button>
        {room.status === 'active' && (
          <button onClick={() => onJoin(room)} className="px-3 py-2 border-2 border-[#00FF40] text-[#00FF40] font-medium rounded-md hover:bg-[#00FF40] hover:text-black transition-colors duration-300 flex items-center text-sm" aria-label={`Enter room ${room.name}`}>
            <Swords size={18} className="mr-2" /> Battle
          </button>
        )}
      </div>
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-green-400/50"></div>
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-green-400/50"></div>
    </>
  );
};

export default RoomCard;