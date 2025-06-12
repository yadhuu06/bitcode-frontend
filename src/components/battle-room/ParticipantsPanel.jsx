import React from 'react';
import { Users, Code, CheckCircle, UserX } from 'lucide-react';

const ParticipantsPanel = ({
  participants,
  username,
  role,
  readyStatus,
  isLoading,
  handleReadyToggle,
  handleKickParticipant,
  lobbyMessages,
  roomDetails,
}) => {
  console.log('ParticipantsPanel - Username:', username); // Debug log

  return (
    <div className="lg:w-2/3 bg-gray-900/80 p-6 rounded-xl border border-[#00FF40]/20 shadow-lg shadow-[#00FF40]/10">
      <h2 className="text-xl font-bold text-[#00FF40] mb-4 font-['Orbitron'] tracking-wider flex items-center">
        <Users className="w-5 h-5 mr-2" />
        Participants ({roomDetails?.participantCount}/{roomDetails?.capacity})
      </h2>
      <div className="space-y-3">
        {participants.length > 0 ? (
          participants.map((participant, index) => (
            <div
              key={`participant-${participant.user__username}-${index}`}
              className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-[#00FF40]/20 hover:border-[#22c55e] transition-all duration-300"
              role="listitem"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#00FF40]/20 flex items-center justify-center text-[#00FF40] font-bold text-lg">
                  {participant.user__username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <span className="font-medium text-sm text-white">{participant.user__username}</span>
                    {participant.role === 'host' && (
                      <Shield size={14} className="ml-2 text-[#00FF40]" title="Host" aria-label="Host" />
                    )}
                  </div>
                  <div className="flex items-center text-xs mt-1">
                    <span
                      className={`h-2 w-2 rounded-full mr-1 ${
                        participant.status === 'joined' ? 'bg-[#00FF40]' : 'bg-yellow-400'
                      }`}
                    ></span>
                    <span className={participant.status === 'joined' ? 'text-[#00FF40]' : 'text-yellow-400'}>
                      {participant.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {readyStatus[participant.user__username] && (
                  <CheckCircle size={16} className="text-[#00FF40] animate-pulse" title="Ready" aria-label="Ready" />
                )}
                {role === 'host' && participant.role !== 'host' && participant.status === 'joined' && (
                  <button
                    onClick={() => handleKickParticipant(participant.user__username)}
                    disabled={isLoading}
                    className="p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300"
                    title={`Kick ${participant.user__username}`}
                    aria-label={`Kick ${participant.user__username}`}
                  >
                    <UserX size={16} />
                  </button>
                )}
                {participant.user__username === username && role !== 'host' && participant.status === 'joined' && (
                  <button
                    onClick={handleReadyToggle}
                    disabled={isLoading}
                    className={`p-2 rounded-lg font-mono text-sm font-semibold flex items-center justify-center gap-2 border transition-colors duration-300 ${
                      readyStatus[username]
                        ? 'border-[#00FF40] bg-[#00FF40]/20 text-[#00FF40] hover:bg-[#00FF40] hover:text-black'
                        : 'border-gray-700 bg-gray-700/50 text-gray-400 hover:border-[#22c55e] hover:bg-[#22c55e]/30'
                    }`}
                    aria-label={readyStatus[username] ? 'Mark as unready' : 'Mark as ready'}
                    title={readyStatus[username] ? 'Mark as unready' : 'Mark as ready'}
                  >
                    <CheckCircle size={16} className={readyStatus[username] ? 'animate-pulse' : ''} />
                    {readyStatus[username] ? 'Unready' : 'Ready'}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-400 text-center p-8">
              <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No participants yet</p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 space-y-2">
        {lobbyMessages.map((message, index) => (
          <div
            key={`lobby-message-${index}`}
            className="text-sm text-gray-300 bg-gray-800/50 p-2 rounded-lg border border-[#00FF40]/20 animate-fade-in"
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsPanel;