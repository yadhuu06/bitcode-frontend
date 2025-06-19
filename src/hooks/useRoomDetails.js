import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getRoomDetails } from '../services/RoomService';

const useRoomDetails = (roomId, accessToken) => {
  const navigate = useNavigate();
  const [roomDetails, setRoomDetails] = useState(null);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState('participant'); 
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

        if (response.role) {
          console.log(`Setting initial role to ${response.role} for user ${response.current_user}`);
          setRole(response.role);
        } else {
          console.warn(`No role provided in response for user ${response.current_user}`);

          const currentParticipant = (response.participants || []).find(
            (p) => p.user__username === response.current_user
          );
          if (currentParticipant?.role) {
            console.log(`Setting fallback role to ${currentParticipant.role} from participants`);
            setRole(currentParticipant.role);
          } else if (response.room.owner === response.current_user) {
            console.log(`Setting fallback role to host as user is owner`);
            setRole('host');
          }
        }
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

  return { roomDetails, setRoomDetails, username, role, setRole, isLoading };
};

export default useRoomDetails;