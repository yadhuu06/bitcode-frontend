import React from 'react';
import { Clock, ArrowLeft } from 'lucide-react';

const LobbyHeader = ({ roomDetails, role, currentTime, handleLeaveRoom, getDifficultyStyles }) => {
  if (!roomDetails) return null;

  return (
    <header className="bg-gray-900/80 border-b border-[#00FF40]/30 p-4 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {role !== 'host' && (
            <button
              onClick={handleLeaveRoom}
              className="p-2 rounded-full bg-gray-800/50 text-gray-400 hover: hover:text-[#00FF40] transition-all duration-300"
              title="Leave Room"
              aria-label="Leave Room"
            >
              <ArrowLeft size={15} />
            </button>
          )}
          <h1 className="text-2xl font-bold text-[#00FF40] font-['Orbitron'] tracking-wider">
            {roomDetails.roomName}
          </h1>
          <div className="flex gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyStyles(roomDetails.difficulty)}`}
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
  );
};

export default LobbyHeader;