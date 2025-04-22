import React, { useState, useEffect } from 'react';
import { Search, Lock, Trophy, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomButton from '../../components/ui/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import api, { setupInterceptors } from '../../api';

const Rooms = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, refreshToken } = useAuth();
  const { showLoading } = useLoading();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({

    topic: 'Array',
    difficulty: 'easy',
    time_limit: '15',
    password: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [capacity, setCapacity] = useState('2');

  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: 'Binary Tree Challenge',
      host: 'matrix_master',
      participants: 3,
      maxParticipants: 5,
      difficulty: 'Medium',
      status: 'In progress',
      duration: '45 min',
      isPrivate: false,
    },
    {
      id: 2,
      name: 'Algorithm Speedrun',
      host: 'codehack3r',
      participants: 8,
      maxParticipants: 10,
      difficulty: 'Hard',
      status: 'In progress',
      duration: '60 min',
      isPrivate: false,
    },
    {
      id: 3,
      name: "Beginner's Challenge",
      host: 'newbie_helper',
      participants: 2,
      maxParticipants: 8,
      difficulty: 'Easy',
      status: 'In progress',
      duration: '30 min',
      isPrivate: false,
    },
    {
      id: 4,
      name: 'Private Team Practice',
      host: 'team_lead',
      participants: 4,
      maxParticipants: 6,
      difficulty: 'Medium',
      status: 'In progress',
      duration: '60 min',
      isPrivate: true,
    },
  ]);

  // Set up axios interceptors
  useEffect(() => {
    setupInterceptors(refreshToken, logout);
  }, [refreshToken, logout]);

  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      showLoading('USER NOT FOUND');
      navigate('/login');
    }
  }, [isAuthenticated, showLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const CreateRoom = async () => {
    console.log("call coming");
    setIsLoading(true);
    try {
      
      if (!formData.topic) {
        console.log("no topic");
        toast.error('Please select a topic');
        return;
      }
      if (!formData.difficulty) {
        console.log("no difficulty");
        toast.error('Please select a difficulty');
        return;
      }
      if (!formData.time_limit) {
        console.log("no time_limit");
        toast.error('Please select a time limit');
        return;
      }

      const payload = {
        
        topic: formData.topic,
        difficulty: formData.difficulty,
        time_limit: parseInt(formData.time_limit),
        capacity: parseInt(capacity),
        visibility: visibility,
        ...(visibility === 'private' && formData.password && { password: formData.password }),
      };

      console.log("Making API call with payload:", payload);
      const response = await api.post('/room/create/', payload);
      console.log("API called, response:", response.data);

      toast.success('Room created successfully!');
      setRooms((prevRooms) => [
        ...prevRooms,
        {
          id: response.data.id || Date.now(),
         
          host: response.data.host || user?.role || 'current_user',
          participants: 1,
          maxParticipants: parseInt(capacity),
          difficulty: formData.difficulty,
          status: 'In progress',
          duration: `${formData.time_limit} min`,
          isPrivate: visibility === 'private',
        },
      ]);

      setFormData({

        topic: 'Array',
        difficulty: 'easy',
        time_limit: '15',
        password: '',
      });
      setCapacity('2');
      setVisibility('public');
      setShowModal(false);

      navigate(`/room/${response.data.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create room';
      toast.error(errorMessage);

      if (error.response?.status === 401) {
        toast.error('Please log in to create a room');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRooms((prevRooms) =>
        prevRooms
          .map((room) => ({
            ...room,
            participants: Math.min(
              room.participants + (Math.random() > 0.7 ? 1 : 0),
              room.maxParticipants
            ),
          }))
          .filter((room) => room.participants <= room.maxParticipants)
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setVisibility('public');
    setCapacity('2');
    setFormData({
     
      topic: 'Array',
      difficulty: 'easy',
      time_limit: '15',
      password: '',
    });
  };

  const getCapacityDescription = () => {
    switch (capacity) {
      case '5':
        return 'Minimum 3 participants required';
      case '10':
        return 'Minimum 7 participants required';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-12 overflow-y-auto relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }, (_, i) => (
          <span
            key={i}
            className="absolute text-xs text-green-500 opacity-50"
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl text-white flex items-center">
            <span className="text-green-500 mr-2">0</span>Challenge Rooms
          </h1>
          <CustomButton
            
            onClick={() => setShowModal(true)}
          >
            <span className="mr-2">+</span> Create Room
          </CustomButton>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search rooms by name or host..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-all duration-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-gray-900 p-5 rounded-lg border border-gray-800 transition-all duration-300 relative"
            >
              {room.isPrivate && (
                <Lock className="absolute top-5 right-5 text-yellow-500" size={18} />
              )}
              <h3 className="text-lg font-semibold text-white mb-2">{room.name}</h3>
              <div className="flex items-center mb-3 text-sm">
                <svg
                  className="w-4 h-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="8" r="4" fill="currentColor" />
                  <path
                    d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <p className="text-gray-400">Hosted by {room.host}</p>
              </div>
              <div className="flex items-center mb-3 text-sm">
                <svg
                  className="w-4 h-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="8" r="4" fill="currentColor" />
                  <circle cx="16" cy="18" r="2" fill="currentColor" />
                  <circle cx="8" cy="18" r="2" fill="currentColor" />
                </svg>
                <p className="text-gray-400">
                  {room.participants}/{room.maxParticipants} participants
                </p>
              </div>
              <div className="flex items-center mb-4 text-sm">
                <svg
                  className="w-4 h-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M12 7V12L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <p className="text-gray-400">{room.duration}</p>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    room.difficulty === 'Easy'
                      ? 'bg-green-500 text-black'
                      : room.difficulty === 'Medium'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {room.difficulty}
                </span>
                <span className="text-yellow-500 text-xs">In progress</span>
              </div>
              <div className="flex justify-between mt-4">
                <button className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-all duration-300 flex items-center">
                  <Trophy size={16} className="mr-1" /> Leaderboard
                </button>
                <button
                  onClick={() => navigate(`/room/${room.id}`)}
                  className={`px-3 py-1 ${
                    room.id === 3 ? 'bg-yellow-500' : 'bg-white'
                  } ${room.id === 3 ? 'text-black' : 'text-black'} rounded hover:opacity-90 transition-all duration-300 flex items-center`}
                >
                  <Play size={16} className="mr-1" />{' '}
                  {room.id === 3 ? 'Join Room' : 'Enter Room'}
                </button>
              </div>
            </div>
          ))}
          {filteredRooms.length === 0 && (
            <p className="text-gray-400 text-center col-span-full">No rooms found.</p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-black p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-green-400">
                Create Battle Room
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Topic</label>
                <select
                  name="topic"
                  required
                  value={formData.topic}
                  onChange={handleChange}
                  className="w-full p-3 bg-black border border-green-700 text-white rounded-md focus:outline-none"
                >
                  <option value="Array">Array</option>
                  <option value="String">String</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Difficulty</label>
                <select
                  name="difficulty"
                  required
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full p-3 bg-black border border-green-700 text-white rounded-md focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Time Limit (Minutes)</label>
                <select
                  value={formData.time_limit}
                  name="time_limit"
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-black border border-green-700 text-white rounded-md focus:outline-none"
                >
                  <option value="" disabled>Select time limit</option>
                  <option value="15">15 MIN</option>
                  <option value="30">30 MIN</option>
                  <option value="60">1 HR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Capacity</label>
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  className="w-full p-3 bg-black border border-green-700 text-white rounded-md focus:outline-none"
                >
                  <option value="2">1 vs 1</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                </select>
                {getCapacityDescription() && (
                  <p className="mt-1 text-xs text-gray-500">{getCapacityDescription()}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full p-3 bg-black border border-green-700 text-white rounded-md focus:outline-none"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              {visibility === 'private' && (
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 bg-black border border-green-700 text-white rounded-md placeholder-gray-500 focus:outline-none"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <CustomButton
                  variant="cancel"
                  onClick={handleCloseModal}
                 
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="create"
                  onClick={CreateRoom}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;