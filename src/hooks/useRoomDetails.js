import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getRoomDetails } from '../services/RoomService';

const useRoomDetails = (roomId, accessToken) => {
  const navigate = useNavigate();
  const [roomDetails, setRoomDetails] = useState(null);
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!accessToken || !roomId) {
        toast.error('Invalid room or session');
        navigate('/login');
        return;
      }

      setIsLoading(true);
      try {
        const response = await getRoomDetails(roomId, accessToken);
        if (!response.current_user) {
          throw new Error('User not authenticated');
        }

        const roomData = {
          room_id: roomId,
          roomName: response.room.name,
          isPrivate: response.room.visibility === 'private',
          join_code: response.room.join_code,
          difficulty: response.room.difficulty,
          timeLimit: response.room.time_limit,
          capacity: response.room.capacity,
          participantCount: response.room.participant_count,
          ranked: response.room.is_ranked,
          status: response.room.status,
        };

        setRoomDetails(roomData);
        setUsername(response.current_user);
        localStorage.setItem('current_user', response.current_user);
      } catch (err) {
        console.error('fetchRoomDetails - Error:', err);
        toast.error(
          err.message.includes('not authorised') || err.message.includes('authenticated')
            ? 'You are not authorised to view this room'
            : 'Failed to load room details'
        );
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId, accessToken, navigate]);

  return { roomDetails, setRoomDetails, username, isLoading };
};

export default useRoomDetails;