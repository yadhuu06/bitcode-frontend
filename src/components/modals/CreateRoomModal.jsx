// src/components/modals/CreateRoomModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../ui/CustomButton';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreateRoomModal = ({ onClose, onRoomCreated }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    topic: 'Array',
    difficulty: 'easy',
    time_limit: '',
    password: '',
  });
  const [visibility, setVisibility] = useState('public');
  const [capacity, setCapacity] = useState('2');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const CreateRoom = async () => {
    setIsLoading(true);
    try {
      if (!formData.name || !formData.time_limit || !formData.topic || !formData.difficulty) {
        toast.error('Please fill in all required fields');
        return;
      }

      const payload = {
        name: formData.name,
        topic: formData.topic,
        difficulty: formData.difficulty,
        time_limit: parseInt(formData.time_limit),
        capacity: parseInt(capacity),
        visibility: visibility,
        ...(visibility === 'private' && formData.password && { password: formData.password }),
      };

      const response = await axios.post(`${API_BASE_URL}/api/create`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      toast.success('Room created successfully!');
      onRoomCreated({
        id: response.data.id || Date.now(),
        name: formData.name,
        host: response.data.host || 'current_user',
        participants: 1,
        maxParticipants: parseInt(capacity),
        difficulty: formData.difficulty,
        status: 'In progress',
        duration: `${formData.time_limit} min`,
        isPrivate: visibility === 'private',
      });

      setFormData({
        name: '',
        topic: 'Array',
        difficulty: 'easy',
        time_limit: '',
        password: '',
      });
      setCapacity('2');
      setVisibility('public');
      onClose();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-black p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-green-400">Create Battle Room</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">Room Name</label>
            <input
              type="text"
              name="name"
              placeholder="Ex: Clash Arena"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 bg-black border border-green-700 text-white rounded-md placeholder-gray-500 focus:outline-none"
            />
          </div>

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
            <label className="block text-sm font-medium text-green-400 mb-2">Time Limit (minutes)</label>
            <input
              type="number"
              name="time_limit"
              placeholder="10"
              min="1"
              required
              value={formData.time_limit}
              onChange={handleChange}
              className="w-full p-3 bg-black border border-green-700 text-white rounded-md placeholder-gray-500 focus:outline-none"
            />
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
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm text-gray-300 border border-gray-600 rounded hover:bg-gray-800"
            >
              Cancel
            </button>
            <CustomButton variant="create" onClick={CreateRoom} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create'}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;