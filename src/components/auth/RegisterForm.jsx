import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { generateOtp } from '../../services/AuthService';
import { toast } from 'react-toastify';
import GoogleAuthButton from './GoogleAuthButton';
import OtpForm from './OtpForm';
import PasswordForm from './PasswordForm';
import { useTimer } from '../../hooks/useTimer';

const RegisterForm = () => {
  const savedState = JSON.parse(localStorage.getItem('authPageState')) || {};
  const [step, setStep] = useState(savedState.step || 1);
  const [email, setEmail] = useState(savedState.email || '');
  const dispatch = useDispatch();
  const { resetTimers } = useTimer();

  useEffect(() => {
    if (step === 1) {
      resetTimers();
    }
  }, [step, resetTimers]);

  useEffect(() => {
    const stateToSave = { step, email };
    localStorage.setItem('authPageState', JSON.stringify(stateToSave));
  }, [step, email]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading({ isLoading: true, message: 'Sending OTP...', style: 'default' }));
    try {
      const data = await generateOtp(email);
      setStep(2);
      console.log('OTP expires in:', data.expires_in);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
      console.error('OTP generation error:', err);
    } finally {
      dispatch(resetLoading());
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Register - Step {step} of 3</h2>
      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div className="bg-gray-800 p-1 rounded-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={false} 
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300"
          >
            Next
          </button>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-px w-1/4 bg-green-500" />
            <span className="text-white">or</span>
            <div className="h-px w-1/4 bg-green-500" />
          </div>
          <GoogleAuthButton label="Continue with Google" disabled={false} />
        </form>
      )}
      {step === 2 && <OtpForm email={email} setStep={setStep} />}
      {step === 3 && <PasswordForm email={email} setStep={setStep} />}
    </div>
  );
};

export default RegisterForm;