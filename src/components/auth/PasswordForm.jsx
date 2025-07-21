import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { completeRegistration } from '../../services/AuthService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const PasswordForm = ({ email, setStep }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    if (password.length < 8) return { strength: 'Weak', color: 'text-red-500' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      return { strength: 'Moderate', color: 'text-yellow-500' };
    }
    return { strength: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!password || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordStrength.strength !== 'Strong') {
      toast.error('Password must include uppercase, number, and special character');
      return;
    }

    dispatch(setLoading({ isLoading: true, message: 'Completing registration...', style: 'battle' }));
    try {
      await completeRegistration(email, password, confirmPassword);
      setPassword('');
      setConfirmPassword('');
      localStorage.removeItem('authPageState'); 
      navigate('/dashboard');
      toast.success('Registration completed successfully!');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      dispatch(resetLoading());
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="text-white text-sm">
        Creating account for <span className="text-green-500">{email}</span>
      </div>

      <div className="space-y-2">
        <div className="relative bg-gray-800 p-1 rounded-md">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {password && (
          <div className={`text-sm ${passwordStrength.color}`}>
            Password Strength: {passwordStrength.strength}
          </div>
        )}
      </div>

      <div className="relative bg-gray-800 p-1 rounded-md">
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>



      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="w-1/3 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-300"
        >
          Back
        </button>
        <button
          type="submit"
          className="w-2/3 px-4 py-2 bg-white text-black rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300"
        >
          Complete Registration
        </button>
      </div>
    </form>
  );
};

export default PasswordForm;