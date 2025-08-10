import { Shield, Clock, Users, ClipboardCopy, ArrowLeft, CheckCircle, Swords, XCircle, Medal } from 'lucide-react';
import ChatPanel from '../../pages/user/ChatPannel';

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
  handleReadyToggle,
  readyStatus,
  getDifficultyStyles,
  unreadCount,
  setUnreadCount,
  
}) => {
  console.log('unreadCount:', unreadCount)
  return (
    
    <div className="lg:w-1/3 bg-gray-900/90 border border-[#00FF40]/20 rounded-2xl flex flex-col shadow-xl shadow-[#00FF40]/10 max-h-[80vh]">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#00FF40]/30 bg-gray-950/50 rounded-t-2xl">
        {['details', 'chat', 'rules'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'chat') setUnreadCount(0); 
            }}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-all duration-300 relative ${
              activeTab === tab
                ? 'bg-[#00FF40]/20 text-[#00FF40] border-b-2 border-[#00FF40]'
                : 'text-gray-400 hover:text-[#22c55e] hover:bg-gray-800/70'
            }`}
            aria-label={`Switch to ${tab} tab`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'chat' && unreadCount > 0 && (
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
    {unreadCount}
  </span>
)}

          </button> 
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto text-sm scrollbar-thin scrollbar-thumb-[#00FF40]/50 scrollbar-track-gray-900">
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="text-gray-400 font-medium">Room Name:</span>
              <span className="text-white font-semibold">{roomDetails?.roomName}</span>
              
            </div>
            {role === 'host' && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="text-gray-400 font-medium">Access Code:</span>
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
                  {copied && <span className="text-xs text-[#00FF40] animate-fade-in">Copied!</span>}
                </div>
              </div>
            )}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="flex items-center gap-2 text-gray-400 font-medium">
                {roomDetails?.ranked ? <Medal className="w-5 h-5 text-[#00FF40]" /> : <Clock className="w-5 h-5 text-[#00FF40]" />}
                {roomDetails?.ranked ? 'Mode:' : 'Duration:'}
              </span>
              <span className={roomDetails?.ranked ? 'text-red-500 font-semibold' : 'text-white'}>
                {roomDetails?.ranked ? 'Ranked' : `${roomDetails?.timeLimit} min`}
              </span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="flex items-center gap-2 text-gray-400 font-medium">
                <Users className="w-5 h-5 text-[#00FF40]" />
                Capacity:
              </span>
              <span className="text-white">{roomDetails?.participantCount}/{roomDetails?.capacity}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="text-gray-400 font-medium">Privacy:</span>
              <span className="text-white capitalize">{roomDetails?.isPrivate ? 'Private' : 'Public'}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="text-gray-400 font-medium">Difficulty:</span>
              <span
                className={`capitalize font-semibold ${
                  roomDetails?.difficulty === 'EASY'
                    ? 'text-green-500'
                    : roomDetails?.difficulty === 'MEDIUM'
                    ? 'text-yellow-500'
                    : roomDetails?.difficulty === 'HARD'
                    ? 'text-red-500'
                    : 'text-white'
                }`}
              >
                {roomDetails?.difficulty}
              </span>
            </div>
          </div>
        )}
        {activeTab === 'chat' && (
          <ChatPanel
            roomId={roomDetails?.room_id}
            username={username}
            isActiveTab={activeTab === 'chat'}
            onNewMessage={() => {
              if (activeTab !== 'chat') {
                setUnreadCount((prev) => Math.max(0, prev + 1));
              }
            }}
          />
        )}
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

      {/* Control Panel */}
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
            <>
              <button
                onClick={handleReadyToggle}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-mono text-sm font-semibold flex items-center justify-center gap-2 border transition-colors duration-300 ${
                  readyStatus[username]
                    ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30'
                    : 'border-[#00FF40] bg-[#00FF40]/20 text-[#00FF40] hover:bg-[#00FF40]/30'
                }`}
                aria-label={readyStatus[username] ? 'Mark as not ready' : 'Mark as ready'}
              >
                <CheckCircle size={16} className={readyStatus[username] ? 'text-yellow-400' : 'text-[#00FF40]'} />
                {readyStatus[username] ? 'Not Ready' : 'Ready'}
              </button>
              <button
                onClick={handleLeaveRoom}
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-mono text-sm font-semibold flex items-center justify-center gap-2 border border-[#00FF40] text-[#00FF40] hover:bg-[#00FF40] hover:text-black transition-colors duration-300"
                aria-label="Leave room"
              >
                <ArrowLeft size={16} />
                Leave Room
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbySidebar; 