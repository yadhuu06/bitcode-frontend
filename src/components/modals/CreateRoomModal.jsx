import React, { useState, useEffect } from 'react';
import { X, Command, Clock, Users, Lock, Unlock, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../ui/CustomButton';
import { createRoom } from '../../services/RoomService';
import { useSelector } from 'react-redux';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TOPIC_OPTIONS = [
  { value: 'Array', label: 'Array' },
  { value: 'String', label: 'String' },
];

const TIME_LIMIT_OPTIONS = [15, 30, 60];

const CreateRoomModal = ({ onClose, onRoomCreated }) => {
  const navigate = useNavigate();
  const { accessToken } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    topic: 'Array',
    difficulty: 'easy',
    time_limit: 30,
    capacity: 2,
    visibility: 'public',
    password: '',
    is_ranked: false,
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.name) {
      toast.error('Room name is required');
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const validateForm = () => {
    if (!formData.name || !formData.topic || !formData.difficulty) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (!formData.is_ranked && !formData.time_limit) {
      toast.error('Time limit is required for non-ranked rooms');
      return false;
    }
    if (formData.visibility === 'private' && !formData.password) {
      toast.error('Password is required for private rooms');
      return false;
    }
    return true;
  };

  const handleCreateRoom = async () => {
    if (!accessToken) {
      toast.error('Please log in to create a room');
      navigate('/login');
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        topic: formData.topic,
        difficulty: formData.difficulty,
        time_limit: formData.is_ranked ? 0 : parseInt(formData.time_limit),
        capacity: parseInt(formData.capacity),
        visibility: formData.visibility,
        is_ranked: formData.is_ranked,
        ...(formData.visibility === 'private' && { password: formData.password }),
      };

      const response = await createRoom(payload);

      onRoomCreated({
        id: response.room_id,
        name: formData.name,
        host: response.owner || 'current_user',
        participants: 1,
        maxParticipants: parseInt(formData.capacity),
        difficulty: formData.difficulty,
        status: 'active',
        duration: formData.is_ranked ? 'Ranked' : `${formData.time_limit} min`,
        isPrivate: formData.visibility === 'private',
        joinCode: response.join_code,
        role: 'host',
        is_ranked: formData.is_ranked,
      });

     
      onClose();
      navigate(`/user/room/${response.room_id}`, {
        state: {
          roomId: response.room_id,
          roomName: formData.name,
          isHost: true,
          isPrivate: formData.visibility === 'private',
          joinCode: response.join_code,
          difficulty: formData.difficulty,
          timeLimit: formData.is_ranked ? 0 : formData.time_limit,
          capacity: formData.capacity,
          isRanked: formData.is_ranked,
        },
      });
    } catch (error) {
      console.error('Error creating room:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create room';
      toast.error(errorMessage);

      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              step === currentStep
                ? 'bg-[#00FF40] w-4 h-4 shadow-[0_0_5px_#00FF40]'
                : step < currentStep
                ? 'bg-[#00FF40]'
                : 'bg-gray-700'
            }`}
          />
          {step < 3 && (
            <div
              className={`h-0.5 w-8 ${step < currentStep ? 'bg-[#00FF40]' : 'bg-gray-700'}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'easy':
        return 'bg-[#22c55e]/20 border-[#00FF40] shadow-[0_0_5px_#00FF40]';
      case 'medium':
        return 'bg-orange-500/20 border-orange-500 shadow-[0_0_5px_#F97316]';
      case 'hard':
        return 'bg-red-500/20 border-red-500 shadow-[0_0_5px_#EF4444]';
      default:
        return 'border-gray-700';
    }
  };

  const getDifficultyTextColor = (level) => {
    switch (level) {
      case 'easy':
        return 'text-[#22c55e]';
      case 'medium':
        return 'text-orange-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[#22c55e]">Room Details</h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter room name (e.g., Cyber Arena)"
                  className="w-full p-3 pl-4 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00FF40] placeholder-gray-500 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#22c55e] mb-2 tracking-wider">
                  Game Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: false, label: 'Casual' },
                    { value: true, label: 'Ranked' },
                  ].map((mode) => (
                    <div
                      key={mode.value}
                      onClick={() => handleChange('is_ranked', mode.value)}
                      className={`cursor-pointer p-3 rounded-lg border transition-all duration-300 ${
                        formData.is_ranked === mode.value
                          ? 'border-[#22c55e] bg-[#22c55e]/20 shadow-[0_0_5px_#22c55e]'
                          : 'border-gray-700 hover:border-[#00FF40] hover:bg-gray-800/50'
                      }`}
                    >
                      <p className="text-center text-white">{mode.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#22c55e] tracking-wider">
                  Choose Topic
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TOPIC_OPTIONS.map((topic) => (
                    <div
                      key={topic.value}
                      onClick={() => handleChange('topic', topic.value)}
                      className={`cursor-pointer p-3 rounded-lg border transition-all duration-300 ${
                        formData.topic === topic.value
                          ? 'border-[#22c55e] bg-[#22c55e]/20 shadow-[0_0_5px_#22c55e]'
                          : 'border-gray-700 hover:border-[#00FF40] hover:bg-gray-800/50'
                      }`}
                    >
                      <p className="text-center text-white">{topic.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[#22c55e]">Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#22c55e] mb-2 tracking-wider">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <div
                      key={level}
                      onClick={() => handleChange('difficulty', level)}
                      className={`cursor-pointer p-2 rounded-lg border transition-all duration-300 text-center capitalize ${
                        formData.difficulty === level
                          ? getDifficultyColor(level)
                          : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                      }`}
                    >
                      <span className={formData.difficulty === level ? getDifficultyTextColor(level) : 'text-white'}>
                        {level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {!formData.is_ranked && (
                <div>
                  <label className="flex items-center text-sm font-medium text-[#22c55e] mb-2 tracking-wider">
                    <Clock className="w-4 h-4 mr-1" /> Time Limit (minutes)
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max={TIME_LIMIT_OPTIONS.length - 1}
                      step="1"
                      value={TIME_LIMIT_OPTIONS.indexOf(formData.time_limit)}
                      onChange={(e) => handleChange('time_limit', TIME_LIMIT_OPTIONS[parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer range-lg accent-[#00FF40]"
                    />
                    <div className="absolute -top-6 left-0 w-full flex justify-between text-xs text-gray-400">
                      {TIME_LIMIT_OPTIONS.map((time) => (
                        <span key={time} className="w-1/3 text-center">
                          {time}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-6">
                      {TIME_LIMIT_OPTIONS.map((time) => (
                        <div
                          key={time}
                          onClick={() => handleChange('time_limit', time)}
                          className={`cursor-pointer p-2 rounded-lg border transition-all duration-300 text-center ${
                            formData.time_limit === time
                              ? 'border-[#22c55e] bg-[#00FF40]/20 shadow-[0_0_5px_#00FF40]'
                              : 'border-gray-700 hover:border-[#00FF40] hover:bg-gray-800/50'
                          }`}
                        >
                          {time} min
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="flex items-center text-sm font-medium text-[#22c55e] mb-2 tracking-wider">
                  <Users className="w-4 h-4 mr-1" /> Capacity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 5, 10].map((cap) => (
                    <div
                      key={cap}
                      onClick={() => handleChange('capacity', cap)}
                      className={`cursor-pointer p-2 rounded-lg border transition-all duration-300 text-center ${
                        formData.capacity === cap
                          ? 'border-[#22c55e] bg-[#22c55e]/20 shadow-[0_0_5px_#00FF40]'
                          : 'border-gray-700 hover:border-[#00FF40] hover:bg-gray-800/50'
                      }`}
                    >
                      {cap === 2 ? '1 vs 1' : cap}
                    </div>
                  ))}
                </div>
                {formData.capacity > 2 && (
                  <p className="mt-1 text-xs text-gray-400">
                    {formData.capacity === 5
                      ? 'Minimum 3 participants required'
                      : 'Minimum 7 participants required'}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[#22c55e]">Security</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#22c55e] mb-2 tracking-wider">
                  Room Visibility
                </label>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                    formData.visibility === 'public'
                      ? 'border-[#22c55e] bg-[#22c55e]/20 shadow-[0_0_5px_#00FF40]'
                      : 'border-gray-700 bg-gray-800/50 hover:border-[#22c55e] hover:bg-gray-800'
                  }`}
                  onClick={() =>
                    handleChange('visibility', formData.visibility === 'public' ? 'private' : 'public')
                  }
                >
                  <div>
                    <p className="font-medium text-white">
                      {formData.visibility === 'public' ? 'Public Room' : 'Private Room'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formData.visibility === 'public'
                        ? 'Anyone can join with the room code'
                        : 'Password required to join'}
                    </p>
                  </div>
                  <div className="text-[#22c55e]">
                    {formData.visibility === 'public' ? (
                      <Unlock className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>
              {formData.visibility === 'private' && (
                <div className="relative">
                  <label className="block text-sm font-medium text-[#22c55e] mb-2 tracking-wider">
                    <Lock className="w-4 h-4 inline mr-1" /> Room Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Set a password"
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00FF40] placeholder-gray-500 transition-all duration-300"
                    required={formData.visibility === 'private'}
                  />
                </div>
              )}
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <h4 className="text-[#22c55e] flex items-center mb-2">
                  <Command className="w-4 h-4 mr-1" /> Room Summary
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-gray-400">Name:</div>
                  <div className="text-white">{formData.name}</div>
                  <div className="text-gray-400">Mode:</div>
                  <div className="text-white">{formData.is_ranked ? 'Ranked' : 'Casual'}</div>
                  <div className="text-gray-400">Topic:</div>
                  <div className="text-white">{formData.topic}</div>
                  <div className="text-gray-400">Difficulty:</div>
                  <div className={`capitalize ${getDifficultyTextColor(formData.difficulty)}`}>
                    {formData.difficulty}
                  </div>
                  {!formData.is_ranked && (
                    <>
                      <div className="text-gray-400">Time Limit:</div>
                      <div className="text-white">{formData.time_limit} minutes</div>
                    </>
                  )}
                  <div className="text-gray-400">Capacity:</div>
                  <div className="text-white">
                    {formData.capacity === 2 ? '1 vs 1' : `${formData.capacity} players`}
                  </div>
                  <div className="text-gray-400">Visibility:</div>
                  <div className="text-white capitalize">{formData.visibility}</div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 animate-fadeIn">
      <div
        className="relative w-full max-w-md rounded-xl bg-black p-6 border border-gray-700 md:max-w-lg"
        style={{
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00FF40]/0 via-[#00FF40] to-[#00FF40]/0" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center md:text-2xl">
            <Command className="w-5 h-5 mr-2" />
            Create Battle Room
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 bg-gray-800/50 p-1.5 rounded-full transition-all duration-300"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>
        {renderStepIndicator()}
        <div>{renderContent()}</div>
        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <CustomButton variant="back" onClick={prevStep}>
              Back
            </CustomButton>
          ) : (
            <CustomButton variant="cancel" onClick={onClose}>
              Cancel
            </CustomButton>
          )}
          {currentStep < 3 ? (
            <CustomButton variant="primary" onClick={nextStep}>
              <span className="flex items-center">
                Next
                <ArrowRight className="ml-1 w-4 h-4" />
              </span>
            </CustomButton>
          ) : (
            <CustomButton variant="create" onClick={handleCreateRoom} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Launch Room'}
            </CustomButton>
          )}
        </div>
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            background: #00FF40;
            border-radius: 50%;
            box-shadow: 0 0 5px #00FF40;
            cursor: pointer;
          }
          input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #00FF40;
            border-radius: 50%;
            box-shadow: 0 0 5px #00FF40;
            cursor: pointer;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CreateRoomModal;