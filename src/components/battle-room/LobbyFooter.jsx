import React from 'react';

const LobbyFooter = ({ roomDetails, currentTime }) => {
  return (
    <footer className="bg-gray-900/80 border-t border-[#00FF40]/30 py-3 px-4 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
        <span className="text-[#00FF40] font-bold">Battle Arena</span>
        <div className="flex gap-4">
          <span>
            Room ID: <span className="text-[#00FF40]">{roomDetails?.roomId}</span>
          </span>
          <span>
            Time: <span className="text-[#00FF40]">{currentTime}</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default LobbyFooter;