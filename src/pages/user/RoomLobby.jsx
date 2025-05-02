import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { updateRooms } from '../../store/slices/roomSlice';
import CustomButton from '../../components/ui/CustomButton';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RoomLobby = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wsRef = useRef(null);
  const isWsConnected = useRef(false); // Track WebSocket connection status
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [roomDetails, setRoomDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);

  // Initialize room details
  useEffect(() => {
    console.log('RoomLobby: Initializing with roomId:', roomId, 'location.state:', location.state);
    if (location.state) {
      console.log('RoomLobby: Setting roomDetails from location.state:', location.state);
      setRoomDetails({
        roomId,
        roomName: location.state.roomName,
        isHost: location.state.isHost,
        isPrivate: location.state.isPrivate,
        joinCode: location.state.joinCode,
        difficulty: location.state.difficulty,
        timeLimit: location.state.timeLimit,
        capacity: location.state.capacity,
        participantCount: 1, // Initial value
        status: 'active', // Initial value
      });
    } else {
      console.log('RoomLobby: Fetching room details for roomId:', roomId);
      const fetchRoomDetails = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/rooms/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('RoomLobby: Fetched rooms data:', data);
          const room = data.rooms.find((r) => r.room_id === roomId);
          if (room) {
            setRoomDetails({
              roomId,
              roomName: room.name,
              isHost: room.owner__username === useSelector((state) => state.auth.username),
              isPrivate: room.visibility === 'private',
              joinCode: room.join_code,
              difficulty: room.difficulty,
              timeLimit: room.time_limit,
              capacity: room.capacity,
              participantCount: room.participant_count,
              status: room.status,
            });
          } else {
            throw new Error('Room not found');
          }
        } catch (err) {
          console.error('RoomLobby: Error fetching room details:', err);
          toast.error('Failed to load room details');
          navigate('/user/rooms');
        }
      };
      if (accessToken && roomId) {
        fetchRoomDetails();
      } else {
        console.error('RoomLobby: Missing accessToken or roomId:', { accessToken, roomId });
        toast.error('Invalid room data or session');
        navigate('/user/rooms');
      }
    }
  }, [location, navigate, roomId, accessToken]);

  // WebSocket connection
  useEffect(() => {
    if (!accessToken || isWsConnected.current) {
      console.log('RoomLobby: Skipping WebSocket setup, missing accessToken or already connected');
      return;
    }

    console.log('RoomLobby: Establishing WebSocket connection');
    const wsURL = `${API_BASE_URL.replace('http', 'ws')}/ws/rooms/?token=${encodeURIComponent(accessToken)}`;
    wsRef.current = new WebSocket(wsURL);
    isWsConnected.current = true;

    wsRef.current.onopen = () => {
      console.log('RoomLobby WebSocket connected');
      setError(null);
      wsRef.current.send(JSON.stringify({ type: 'request_room_list' }));
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('RoomLobby WebSocket message:', data);
        if (data.type === 'room_list' || data.type === 'room_update') {
          dispatch(updateRooms(data.rooms));
          if (roomDetails) {
            const currentRoom = data.rooms.find((room) => room.room_id === roomDetails.roomId);
            if (currentRoom) {
              setParticipants(currentRoom.participants || []);
              // Update only specific fields to avoid new object reference
              setRoomDetails((prev) => ({
                ...prev,
                participantCount: currentRoom.participant_count ?? prev.participantCount,
                status: currentRoom.status ?? prev.status,
              }));
            }
          }
        } else if (data.type === 'error') {
          setError(data.message);
          toast.error(data.message);
        }
      } catch (err) {
        console.error('RoomLobby: Error parsing WebSocket message:', err);
        setError('Invalid server message');
        toast.error('Invalid server message');
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('RoomLobby WebSocket error:', error);
      setError('WebSocket connection failed');
      toast.error('WebSocket connection failed');
      isWsConnected.current = false;
    };

    wsRef.current.onclose = (event) => {
      console.warn('RoomLobby WebSocket disconnected:', event.code, event.reason);
      setError(`WebSocket closed: ${event.reason || 'Unknown reason'} (Code: ${event.code})`);
      isWsConnected.current = false;
      if (event.code === 4001 || event.code === 4002) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      }
    };

    return () => {
      if (wsRef.current) {
        console.log('RoomLobby: Cleaning up WebSocket connection');
        wsRef.current.close();
        isWsConnected.current = false;
      }
    };
  }, [accessToken, dispatch, navigate]); // Removed roomDetails from dependencies

  const handleStartSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomDetails.roomId}/start/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        toast.success('Session started!');
        navigate('/user/room/session', { state: { roomId: roomDetails.roomId } });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to start session');
      }
    } catch (err) {
      console.error('Error starting session:', err);
      toast.error('Failed to start session');
    }
  };

  const handleKickParticipant = async (username) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomDetails.roomId}/kick/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      if (response.ok) {
        toast.success(`Kicked ${username}`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to kick participant');
      }
    } catch (err) {
      console.error('Error kicking participant:', err);
      toast.error('Failed to kick participant');
    }
  };

  if (!roomDetails) {
    console.log('RoomLobby: Rendering Loading state');
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-xl text-[#00FF40]">Loading...</div>
      </div>
    );
  }

  console.log('RoomLobby: Rendering with roomDetails:', roomDetails);
  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      {/* Header with room name */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-[#00FF40] inline-block border-b-2 border-[#00FF40] pb-2">
          {roomDetails.roomName}
        </h2>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-400 p-4 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Left column - Room Details */}
        <div className="bg-gray-900/70 rounded-xl border border-gray-800 overflow-hidden shadow-lg backdrop-blur-sm">
          <div className="bg-gray-800/80 p-4 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-[#00FF40] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
              {roomDetails.roomName}
            </h3>
          </div>
          <div className="p-5">
            <dl className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <dt className="text-gray-400 font-medium">Room ID</dt>
                <dd className="text-white font-mono tracking-wide">{roomDetails.roomId}</dd>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <dt className="text-gray-400 font-medium">Join Code</dt>
                <dd className="text-white bg-gray-800 px-3 py-1 rounded font-mono tracking-wider text-[#00FF40]">
                  {roomDetails.joinCode}
                </dd>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <dt className="text-gray-400 font-medium">Difficulty</dt>
                <dd className="capitalize">
                  <span className={`px-3 py-1 rounded ${
                    roomDetails.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
                    roomDetails.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {roomDetails.difficulty}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <dt className="text-gray-400 font-medium">Time Limit</dt>
                <dd className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {roomDetails.timeLimit} minutes
                </dd>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <dt className="text-gray-400 font-medium">Capacity</dt>
                <dd>
                  <div className="w-24 bg-gray-800 rounded-full h-2.5">
                    <div 
                      className="bg-[#00FF40] h-2.5 rounded-full" 
                      style={{ width: `${(roomDetails.participantCount / roomDetails.capacity) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-right mt-1">
                    {roomDetails.participantCount}/{roomDetails.capacity}
                  </div>
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-gray-400 font-medium">Visibility</dt>
                <dd>
                  <span className={`inline-flex items-center px-3 py-1 rounded ${
                    roomDetails.isPrivate ? 'bg-purple-900/50 text-purple-400' : 'bg-blue-900/50 text-blue-400'
                  }`}>
                    {roomDetails.isPrivate ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Private
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        Public
                      </>
                    )}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right column - Participants */}
        <div className="bg-gray-900/70 rounded-xl border border-gray-800 overflow-hidden shadow-lg backdrop-blur-sm flex flex-col">
          <div className="bg-gray-800/80 p-4 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-[#00FF40] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Participants
            </h3>
          </div>
          <div className="p-5 flex-grow overflow-y-auto">
            {participants.length > 0 ? (
              <ul className="space-y-3">
                {participants.map((participant, index) => (
                  <li 
                    key={index} 
                    className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-[#00FF40] mr-3">
                        {participant.user__username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-white">{participant.user__username}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          participant.role === 'host' ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'
                        }`}>
                          {participant.role}
                        </span>
                      </div>
                    </div>
                    {roomDetails.isHost && participant.role !== 'host' && (
                      <button
                        onClick={() => handleKickParticipant(participant.user__username)}
                        className="text-red-500 hover:text-red-400 bg-red-900/30 hover:bg-red-900/50 p-1 rounded transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-500 text-center p-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <p>No participants have joined yet</p>
                </div>
              </div>
            )}
          </div>
          {/* Start Session Button */}
          {roomDetails.isHost && (
            <div className="p-5 border-t border-gray-700 bg-gray-800/50">
              <CustomButton
                variant="primary"
                onClick={handleStartSession}
                disabled={participants.length < 1}
                className="w-full flex justify-center items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Session
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;