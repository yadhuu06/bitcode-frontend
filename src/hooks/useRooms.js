import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logoutSuccess } from '../store/slices/authSlice';
import { setLoading, resetLoading } from '../store/slices/loadingSlice';
import { fetchRooms, addRoom, updateRooms } from '../store/slices/roomSlice';
import WebSocketService from '../services/WebSocketService';
import api from '../api';
import Cookies from 'js-cookie';

export const useRooms = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rooms, loading, error } = useSelector((state) => state.rooms);
  const { accessToken } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [wsError, setWsError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('active');
  const [passwordRoomId, setPasswordRoomId] = useState(null);
  const [passwords, setPasswords] = useState({});
  const wsListenerId = useRef('rooms');

  useEffect(() => {
    

    WebSocketService.connect(accessToken);

    const handleMessage = (data) => {
      console.log('Rooms WebSocket message:', data);
      if (data.type === 'room_list' || data.type === 'room_update') {
        dispatch(updateRooms(data.rooms));
      } else if (data.type === 'error') {
        setWsError(data.message);
        toast.error(data.message);
        if (data.message.includes('401') || data.message.includes('4001') || data.message.includes('4002')) {
          dispatch(logoutSuccess());
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          navigate('/login');
        }
      } else {
        console.warn('Unknown message type:', data.type);
      }
    };

    WebSocketService.addListener(wsListenerId.current, handleMessage);

    return () => {
      WebSocketService.removeListener(wsListenerId.current);
      WebSocketService.disconnect();
    };
  }, [accessToken, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const handleRoomCreated = (newRoom) => {
    dispatch(setLoading({ isLoading: true, message: 'Updating room list...', style: 'battle', progress: 0 }));
    try {
      dispatch(addRoom({
        room_id: newRoom.id,
        name: newRoom.name,
        owner__username: newRoom.host,
        topic: newRoom.topic || 'Array',
        difficulty: newRoom.difficulty,
        time_limit: newRoom.is_ranked ? 0 : parseInt(newRoom.duration) || 30,
        capacity: newRoom.maxParticipants,
        participant_count: newRoom.participants,
        visibility: newRoom.isPrivate ? 'private' : 'public',
        status: newRoom.status,
        join_code: newRoom.joinCode,
        is_ranked: newRoom.is_ranked,
      }));
      toast.success('Room created successfully');
      setShowModal(false);
    } catch (err) {
      console.error('Failed to update room list:', err);
      toast.error('Failed to update room list');
    } finally {
      dispatch(resetLoading());
    }
  };

  const handleJoinRoom = async (room) => {
    dispatch(setLoading({ isLoading: true, message: 'Joining room...', style: 'battle', progress: 0 }));

    try {
      let password = null;

      if (room.visibility === 'private') {
        password = passwords[room.room_id];

        if (!password) {
          setPasswordRoomId(room.room_id);
          dispatch(resetLoading());
          return;
        }
      }

      const response = await api.post(`/rooms/${room.room_id}/join/`, password ? { password } : {});

      toast.success('Joined room successfully');

      const data = response.data;
      WebSocketService.disconnect();

      navigate(`/user/room/${room.room_id}`, {
        state: {
          roomName: room.name,
          role: data.role,
          isPrivate: room.visibility === 'private',
          joinCode: room.join_code,
          difficulty: room.difficulty,
          timeLimit: room.time_limit,
          capacity: room.capacity,
          is_ranked: room.is_ranked,
        },
      });
    } catch (err) {
      console.error('Error joining room:', err);

      if (err.response?.status === 401) {
        dispatch(logoutSuccess());
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        navigate('/login');
      }

      toast.error(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to join room'
      );
    } finally {
      dispatch(resetLoading());
    }
  };

  const handlePasswordSubmit = (roomId) => {
    const room = rooms.find((r) => r.room_id === roomId);
    if (room) handleJoinRoom(room);
  };

  const handlePasswordChange = (roomId, value) => {
    setPasswords((prev) => ({ ...prev, [roomId]: value }));
  };

  const handleCancel = (roomId) => {
    setPasswordRoomId(null);
    setPasswords((prev) => ({ ...prev, [roomId]: '' }));
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.owner__username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.join_code.includes(searchTerm);

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'active') return matchesSearch && room.status === 'active';
    if (activeFilter === 'public') return matchesSearch && room.visibility === 'public';
    if (activeFilter === 'private') return matchesSearch && room.visibility === 'private';
    if (activeFilter === 'ranked') return matchesSearch && room.is_ranked;
    if (activeFilter === 'casual') return matchesSearch && !room.is_ranked;

    return matchesSearch;
  });

  return {
    rooms,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    showModal,
    setShowModal,
    activeFilter,
    setActiveFilter,
    passwordRoomId,
    passwords,
    handleJoinRoom,
    handlePasswordSubmit,
    handlePasswordChange,
    handleCancel,
    filteredRooms,
    handleRoomCreated,
  };
};