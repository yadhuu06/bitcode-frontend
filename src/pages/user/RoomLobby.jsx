import React, { useState } from 'react';
import { Users, Lock, Clock, Trophy, Play, UserX, Check, X, Command } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import CustomButton from '../../components/ui/CustomButton';

// Sample data based on Room and RoomParticipant models
const roomData = {
  room_id: '123e4567-e89b-12d3-a456-426614174000',
  join_code: 'X7Y9Z2K4',
  name: 'Cyber Arena',
  owner: { username: 'neo_matrix' },
  topic: 'Array',
  difficulty: 'medium',
  time_limit: 30,
  capacity: 5,
  participant_count: 3,
  visibility: 'private',
  password: 'secure123',
  is_active: true,
  status: 'active',
  created_at: '2025-04-25T09:50:00Z',
};

const participantsData = [
  {
    id: 'p1',
    user: { username: 'neo_matrix' },
    role: 'host',
    status: 'joined',
    ready: true,
    ready_at: '2025-04-25T10:00:00Z',
    joined_at: '2025-04-25T09:50:00Z',
  },
  {
    id: 'p2',
    user: { username: 'trinity' },
    role: 'participant',
    status: 'joined',
    ready: false,
    ready_at: null,
    joined_at: '2025-04-25T09:55:00Z',
  },
  {
    id: 'p3',
    user: { username: 'morpheus' },
    role: 'participant',
    status: 'joined',
    ready: true,
    ready_at: '2025-04-25T09:57:00Z',
    joined_at: '2025-04-25T09:56:00Z',
  },
];

const RoomLobby = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [currentUser] = useState({ username: 'neo_matrix' }); // Simulated logged-in user (host)
  const [isReady, setIsReady] = useState(
    participantsData.find((p) => p.user.username === currentUser.username)?.ready || false
  );

  const isHost = participantsData.some(
    (p) => p.user.username === currentUser.username && p.role === 'host'
  );

  const handleKickParticipant = (participantId) => {
    // TODO: Implement API call to kick participant
    console.log(`Initiating kick for participant ID: ${participantId}`);
  };

  const handleToggleReady = () => {
    // TODO: Implement API call to update ready status
    setIsReady((prev) => !prev);
  };

  const handleStartGame = () => {
    // TODO: Implement API call to start the game
    console.log('Initiating game start...');
  };

  const handleLeaveRoom = () => {
    // TODO: Implement API call to leave the room
    console.log('Initiating room exit...');
    navigate('/rooms');
  };

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'text-[#00FF40]';
      case 'medium':
        return 'text-orange-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-12 overflow-y-auto relative">
      {/* Background binary animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }, (_, i) => (
          <span
            key={`binary-${i}`}
            className="absolute text-xs text-[#00FF40] opacity-30"
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#00FF40] flex items-center">
            <Command className="w-6 h-6 mr-2" />
            {roomData.name}
            <span className="ml-3 text-sm text-gray-400 font-normal">({roomData.join_code})</span>
          </h1>
          <CustomButton variant="cancel" onClick={handleLeaveRoom}>
            Leave Room
          </CustomButton>
        </div>

        {/* Room Summary */}
        <section className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8">
          <h2 className="text-lg font-semibold text-[#00FF40] mb-4 flex items-center">
            <Command className="w-5 h-5 mr-2" /> Room Information
          </h2>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <span className="text-gray-400">Host</span>
            <span className="text-white">{roomData.owner.username}</span>
            <span className="text-gray-400">Topic</span>
            <span className="text-white">{roomData.topic}</span>
            <span className="text-gray-400">Difficulty</span>
            <span className={classNames('capitalize', getDifficultyStyles(roomData.difficulty))}>
              {roomData.difficulty}
            </span>
            <span className="text-gray-400">Time Limit</span>
            <span className="text-white">{roomData.time_limit} minutes</span>
            <span className="text-gray-400">Participants</span>
            <span className="text-white">
              {roomData.participant_count}/{roomData.capacity}
            </span>
            <span className="text-gray-400">Visibility</span>
            <span className="text-white flex items-center capitalize">
              {roomData.visibility}
              {roomData.visibility === 'private' && (
                <Lock className="ml-2 w-4 h-4 text-yellow-500" />
              )}
            </span>
          </div>
        </section>

        {/* Participants List */}
        <section className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8">
          <h2 className="text-lg font-semibold text-[#00FF40] mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" /> Participants
          </h2>
          <div className="space-y-4">
            {participantsData.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 transition-all duration-300 hover:border-[#00FF40]/50"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-white font-medium">
                    {participant.user.username}
                    {participant.role === 'host' && (
                      <span className="ml-2 text-xs text-yellow-500 font-normal">[Host]</span>
                    )}
                  </span>
                  <span
                    className={classNames('flex items-center text-sm', {
                      'text-[#00FF40]': participant.ready,
                      'text-gray-400': !participant.ready,
                    })}
                  >
                    {participant.ready ? (
                      <Check className="w-4 h-4 mr-1" />
                    ) : (
                      <X className="w-4 h-4 mr-1" />
                    )}
                    {participant.ready ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {isHost && participant.user.username !== currentUser.username && (
                    <CustomButton
                      variant="cancel"
                      onClick={() => handleKickParticipant(participant.id)}
                    >
                      <UserX className="w-4 h-4 mr-1" /> Kick
                    </CustomButton>
                  )}
                  {participant.user.username === currentUser.username && !isHost && (
                    <CustomButton
                      variant={isReady ? 'cancel' : 'create'}
                      onClick={handleToggleReady}
                    >
                      {isReady ? (
                        <>
                          <X className="w-4 h-4 mr-1" /> Not Ready
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" /> Ready
                        </>
                      )}
                    </CustomButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Host Controls */}
        {isHost && (
          <section className="flex justify-end">
            <CustomButton variant="create" onClick={handleStartGame}>
              <Play className="w-4 h-4 mr-1" /> Start Game
            </CustomButton>
          </section>
        )}
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

export default RoomLobby;