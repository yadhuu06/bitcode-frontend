import React from 'react';
import { Shield, Clock, Users, ClipboardCopy ,ArrowLeft} from 'lucide-react';
import ChatPanel from '../../pages/user/ChatPannel'

const LobbySidebar = ({
  roomDetails,
  role,
  username,
  activeTab,
  setActiveTab,
  handleCopy,
  copied,
  isLoading,
  participants,
  initiateCountdown,
  handleCloseRoom,
  handleLeaveRoom,
  getDifficultyStyles,
}) => {
  console.log('LobbySidebar - Username:', username); // Debug log

  return (
    <div className="lg:w-1/3 bg-gray-900/90 border border-[#00FF40]/20 rounded-2xl flex flex-col shadow-xl shadow-[#00FF40]/10 max-h-[80vh]">
      <div className="flex border-b border-[#00FF40]/30 bg-gray-950/50 rounded-t-2xl">
        {['details', 'chat', 'rules'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-all duration-300 ${
              activeTab === tab
                ? 'bg-[#00FF40]/20 text-[#00FF40] border-b-2 border-[#00FF40]'
                : 'text-gray-400 hover:text-[#22c55e] hover:bg-gray-800/70'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex-1 p-6 overflow-y-auto text-sm scrollbar-thin scrollbar-thumb-[#00FF40]/50 scrollbar-track-gray-900">
        {activeTab === 'details' && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 min-w-[100px] font-medium">Room Name:</span>
              <span className="text-white font-semibold">{roomDetails?.roomName}</span>
            </div>
            {role === 'host' && (
              <div className="flex items-center gap-4">
                <span className="text-gray-400 min-w-[100px] font-medium">Access Code:</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#00FF40] font-mono bg-gray-800/50 px-2 py-1 rounded">
                    {roomDetails?.join_code}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-full bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-[#00FF40] transition-all duration-300"
                    title="Copy join code"
                    aria-label="Copy join code to clipboard"
                  >
                    <ClipboardCopy size={16} />
                  </button>
                  {copied && <span className="text-xs text-[#00FF40] ml-2 animate-fade-in">Copied!</span>}
                </div>
              </div>
            )}
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5 text-[#00FF40]" />
              <span className="text-gray-400 min-w-[100px] font-medium">Duration:</span>
              <span className="text-white">{roomDetails?.timeLimit} min</span>
            </div>
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-[#00FF40]" />
              <span className="text-gray-400 min-w-[100px] font-medium">Capacity:</span>
              <span className="text-white">{roomDetails?.participantCount}/{roomDetails?.capacity}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 min-w-[100px] font-medium">Privacy:</span>
              <span className="text-white capitalize">{roomDetails?.isPrivate ? 'Private' : 'Public'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 min-w-[100px] font-medium">Difficulty:</span>
              <span className={`capitalize px-2 py-1 rounded ${getDifficultyStyles(roomDetails?.difficulty)}`}>
                {roomDetails?.difficulty}
              </span>
            </div>
          </div>
        )}
        {activeTab === 'chat' && <ChatPanel roomId={roomDetails?.roomId} username={username} isActiveTab={activeTab === 'chat'} />}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-[#00FF40] flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Battle Rules
            </h4>
            <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
              <li>Complete the battle within {roomDetails?.timeLimit} minutes.</li>
              <li>
                Questions set to{' '}
                <span className={`font-semibold ${getDifficultyStyles(roomDetails?.difficulty)}`}>
                  {roomDetails?.difficulty}
                </span>{' '}
                difficulty.
              </li>
              <li>No external help or tab switching allowed.</li>
              <li>Timer won’t pause — manage time wisely.</li>
              <li>Role: {role}</li>
              <li>Ensure stable internet connection.</li>
            </ul>
          </div>
        )}
      </div>
      <div className="p-6 border-t border-[#00FF40]/30 bg-gray-950/50 rounded-b-2xl">
        <h3 className="text-sm font-medium text-[#00FF40] mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {role === 'host' ? 'Host Dashboard' : 'Participant Controls'}
        </h3>
        <div className="space-y-3">
          {role === 'host' ? (
            <>
              <button
                onClick={initiateCountdown}
                disabled={participants.length < 1 || isLoading}
                className={`w-full py-3 rounded-lg font-mono text-sm font-semibold flex items-center justify-center gap-2 border transition-colors duration-300 ${
                  participants.length < 1 || isLoading
                    ? 'border-gray-700 text-gray-500 cursor-not-allowed'
                    : 'border-[#00FF40] text-[#00FF40] hover:bg-[#00FF40] hover:text-black'
                }`}
                aria-label="Start battle"
              >
                <Swords size={16} />
                Start Battle
              </button>
              <button
                onClick={handleCloseRoom}
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-mono text-sm font-semibold flex items-center justify-center gap-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-colors duration-300"
                aria-label="Close room"
              >
                <XCircle size={16} />
                Close Room
              </button>
            </>
          ) : (
            <button
              onClick={handleLeaveRoom}
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-mono text-sm font-semibold flex items-center justify-center gap-2 border border-[#00FF40] text-[#00FF40] hover:bg-[#00FF40] hover:text-black transition-colors duration-300"
              aria-label="Leave room"
            >
              <ArrowLeft size={16} />
              Leave Room
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbySidebar;