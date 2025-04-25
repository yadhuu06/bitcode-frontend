import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Lock, Check, X, Command, Trophy, Play, UserX, Clock, AlertTriangle } from 'lucide-react';
import classNames from 'classnames';
import CustomButton from '../../components/ui/CustomButton';
import { toast } from 'react-toastify';

// This would be replaced with actual API calls in production
const fetchRoomData = async (roomId) => {
  // Simulated API response
  return {
    room_id: roomId || '123e4567-e89b-12d3-a456-426614174000',
    join_code: 'X7Y9Z2K4',
    name: 'Cyber Arena',
    owner: { username: 'neo_matrix' },
    topic: 'Array',
    difficulty: 'medium',
    time_limit: 30,
    capacity: 5,
    participant_count: 3,
    visibility: 'private',
    is_active: true,
    status: 'waiting',
    created_at: '2025-04-25T09:50:00Z',
  };
};

const fetchParticipants = async (roomId) => {
  // Simulated API response
  return [
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
};

// Simulated current user
const getCurrentUser = () => {
  return { username: 'neo_matrix' }; // In real app, this would come from auth context/redux
};

const RoomLobby = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const initializeLobby = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        const roomData = await fetchRoomData(roomId);
        const participantsData = await fetchParticipants(roomId);
        
        setCurrentUser(user);
        setRoom(roomData);
        setParticipants(participantsData);
        
        // Check if current user is the host
        const userIsHost = participantsData.some(
          (p) => p.user.username === user.username && p.role === 'host'
        );
        setIsHost(userIsHost);
        
        // Check if current user is ready
        const userParticipant = participantsData.find(
          (p) => p.user.username === user.username
        );
        setIsReady(userParticipant?.ready || false);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading room data:', err);
        setError('Failed to load room data. Please try again.');
        setLoading(false);
        toast.error('Failed to load room data');
      }
    };

    initializeLobby();
  }, [roomId]);

  const handleKickParticipant = async (participantId) => {
    try {
      // In production, this would be an API call
      console.log(`Kicking participant: ${participantId}`);
      toast.success('Participant kicked successfully');
      
      // Simulate API response by updating local state
      setParticipants(participants.filter(p => p.id !== participantId));
    } catch (err) {
      console.error('Error kicking participant:', err);
      toast.error('Failed to kick participant');
    }
  };

  const handleToggleReady = async () => {
    try {
      // In production, this would be an API call
      console.log(`Setting ready status to: ${!isReady}`);
      
      // Simulate API response by updating local state
      setIsReady(!isReady);
      setParticipants(participants.map(p => 
        p.user.username === currentUser.username 
          ? {...p, ready: !isReady, ready_at: new Date().toISOString()} 
          : p
      ));
      
      toast.info(`You are now ${!isReady ? 'ready' : 'not ready'}`);
    } catch (err) {
      console.error('Error updating ready status:', err);
      toast.error('Failed to update ready status');
    }
  };

  const handleStartGame = async () => {
    try {
      const allReady = participants.every(p => p.ready);
      if (!allReady) {
        toast.warning('Not all participants are ready');
        return;
      }
      
      // Start countdown
      setCountdown(5);
      
      // Simulate countdown timer
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Navigate to game
            console.log('Game starting...');
            navigate(`/room/${roomId}/game`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } catch (err) {
      console.error('Error starting game:', err);
      toast.error('Failed to start game');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      // In production, this would be an API call
      console.log('Leaving room...');
      
      toast.info('You left the room');
      navigate('/rooms');
    } catch (err) {
      console.error('Error leaving room:', err);
      toast.error('Failed to leave room');
    }
  };

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
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

  const getReadyPercentage = () => {
    if (!participants || participants.length === 0) return 0;
    const readyCount = participants.filter(p => p.ready).length;
    return (readyCount / participants.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-800 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="bg-gray-900 p-6 rounded-lg border border-red-500 max-w-md">
          <div className="flex items-center mb-4 text-red-500">
            <AlertTriangle className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p className="mb-4">{error}</p>
          <CustomButton variant="primary" onClick={() => navigate('/rooms')}>
            Return to Rooms
          </CustomButton>
        </div>
      </div>
    );
  }

  if (!room || !currentUser) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500 max-w-md">
          <div className="flex items-center mb-4 text-yellow-500">
            <AlertTriangle className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold">Room Not Found</h2>
          </div>
          <p className="mb-4">The room you're looking for doesn't exist or you don't have access.</p>
          <CustomButton variant="primary" onClick={() => navigate('/rooms')}>
            Return to Rooms
          </CustomButton>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#00FF40] flex items-center">
              <Command className="w-6 h-6 mr-2" />
              {room.name}
              <span className="ml-3 text-sm text-gray-400 font-normal">({room.join_code})</span>
            </h1>
            <p className="text-gray-400 mt-1">Waiting for all participants to be ready</p>
          </div>
          <CustomButton variant="cancel" onClick={handleLeaveRoom}>
            <X className="w-4 h-4 mr-1" /> Leave Room
          </CustomButton>
        </div>

        {/* Game start countdown overlay */}
        {countdown !== null && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-[#00FF40] mb-4">Game Starting</h2>
              <div className="text-8xl font-mono text-white mb-6">{countdown}</div>
              <p className="text-gray-400">Prepare for the challenge!</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            {/* Room Summary */}
            <section className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h2 className="text-lg font-semibold text-[#00FF40] mb-4 flex items-center">
                <Command className="w-5 h-5 mr-2" /> Room Info
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Host</span>
                  <span className="text-white font-medium">{room.owner.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Topic</span>
                  <span className="text-white">{room.topic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Difficulty</span>
                  <span className={classNames('capitalize', getDifficultyStyles(room.difficulty))}>
                    {room.difficulty}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" /> Time Limit
                  </span>
                  <span className="text-white">{room.time_limit} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Users className="w-4 h-4 mr-1" /> Participants
                  </span>
                  <span className="text-white">
                    {participants.length}/{room.capacity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Visibility</span>
                  <span className="text-white flex items-center capitalize">
                    {room.visibility}
                    {room.visibility === 'private' && (
                      <Lock className="ml-2 w-4 h-4 text-yellow-500" />
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* Ready Progress */}
            <section className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h2 className="text-lg font-semibold text-[#00FF40] mb-4 flex items-center">
                <Check className="w-5 h-5 mr-2" /> Ready Status
              </h2>
              <div className="space-y-4">
                <div className="w-full bg-gray-800 rounded-full h-4">
                  <div 
                    className="bg-[#00FF40] h-4 rounded-full transition-all duration-500"
                    style={{ width: `${getReadyPercentage()}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {participants.filter(p => p.ready).length} of {participants.length} ready
                  </span>
                  <span className="text-[#00FF40]">{Math.round(getReadyPercentage())}%</span>
                </div>
                
                {!isHost && (
                  <div className="mt-4">
                    <CustomButton 
                      variant={isReady ? "cancel" : "create"} 
                      onClick={handleToggleReady}
                      className="w-full"
                    >
                      {isReady ? (
                        <>
                          <X className="w-4 h-4 mr-1" /> Mark Not Ready
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" /> Mark Ready
                        </>
                      )}
                    </CustomButton>
                  </div>
                )}
                
                {isHost && participants.every(p => p.ready) && (
                  <div className="mt-4">
                    <CustomButton 
                      variant="create" 
                      onClick={handleStartGame}
                      className="w-full"
                    >
                      <Play className="w-4 h-4 mr-1" /> Start Game
                    </CustomButton>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column - Participants List */}
          <div className="md:col-span-2">
            <section className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h2 className="text-lg font-semibold text-[#00FF40] mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" /> Participants
              </h2>
              
              <div className="space-y-4">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={classNames(
                      "flex items-center justify-between p-4 rounded-lg border transition-all duration-300",
                      participant.ready 
                        ? "bg-[#00FF40]/10 border-[#00FF40]/30 hover:border-[#00FF40]/60" 
                        : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center">
                      <div className="flex flex-col">
                        <span className="text-white font-medium flex items-center">
                          {participant.user.username}
                          {participant.role === 'host' && (
                            <span className="ml-2 text-xs text-yellow-500 font-normal">[Host]</span>
                          )}
                        </span>
                        <span className="text-sm text-gray-400">
                          Joined {new Date(participant.joined_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span
                        className={classNames('flex items-center text-sm px-2 py-1 rounded-full', {
                          'bg-[#00FF40]/20 text-[#00FF40]': participant.ready,
                          'bg-gray-700 text-gray-400': !participant.ready,
                        })}
                      >
                        {participant.ready ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <X className="w-4 h-4 mr-1" />
                        )}
                        {participant.ready ? 'Ready' : 'Not Ready'}
                      </span>
                      
                      {isHost && participant.user.username !== currentUser.username && (
                        <CustomButton
                          variant="cancel"
                          onClick={() => handleKickParticipant(participant.id)}
                        >
                          <UserX className="w-4 h-4 mr-1" /> Kick
                        </CustomButton>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: room.capacity - participants.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex items-center justify-center p-4 bg-gray-900/50 border border-gray-800 border-dashed rounded-lg text-gray-500"
                  >
                    <span>Waiting for participant...</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { opacity: 0.3; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RoomLobby;