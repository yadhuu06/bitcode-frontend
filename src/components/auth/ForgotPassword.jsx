import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { generateOtp, verifyOtp, resetPassword } from '../../services/AuthService';
import { Home } from "lucide-react";
const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [showMatrix, setShowMatrix] = useState(true);
  const type = "forgot_password";

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!minLength || !hasUppercase || !hasSpecialChar) {
      return { strength: 'weak', message: 'Must be 8+ chars, include 1 uppercase & 1 special char' };
    } else if (hasNumber) {
      return { strength: 'strong', message: 'Strong password! Includes numbers' };
    } else {
      return { strength: 'medium', message: 'Medium password. Add numbers for strength' };
    }
  };

  useEffect(() => {
    if (newPassword) {
      const strength = checkPasswordStrength(newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [newPassword]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    dispatch(setLoading({ isLoading: true, message: 'Sending OTP...', style: 'default' }));
    try {
      const data = await generateOtp(email, type);
      setStep(2);
      toast.success('OTP sent successfully!');
      console.log('OTP expires in:', data.expires_in);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
      console.error('OTP generation error:', err);
    } finally {
      dispatch(resetLoading());
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    dispatch(setLoading({ isLoading: true, message: 'Verifying OTP...', style: 'terminal' }));
    try {
      await verifyOtp(email, otp, type);
      setOtp('');
      setStep(3);
      toast.success('OTP verified successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'OTP verification failed');
    } finally {
      dispatch(resetLoading());
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const strength = checkPasswordStrength(newPassword);
    if (strength.strength === 'weak') {
      toast.error(strength.message);
      return;
    }
    if (newPassword502 !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    dispatch(setLoading({ isLoading: true, message: 'Resetting password...', style: 'compile' }));
    try {
      await resetPassword(email, otp, newPassword);
      toast.success('Password reset successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(null);
      setTimeout(() => window.location.href = '/login', 1000);
    } catch (err) {
      toast.error(err.message || 'Password reset failed');
    } finally {
      dispatch(resetLoading());
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setOtp('');
      setStep(1);
    } else if (step === 3) {
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(null);
      setStep(2);
    }
  };

  const getRandomMatrixElement = () => {
    const chars = '01';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {showMatrix && (
        <>
          {Array.from({ length: 60 }, (_, i) => (
            <span
              key={i}
              className="absolute text-xs text-green-500 opacity-20"
              style={{
                left: `${Math.random() * 100}vw`,
                top: `${Math.random() * 100}vh`,
                animation: `pulse ${Math.random() * 4 + 1}s infinite ${Math.random() * 2}s`,
                fontSize: `${Math.random() * 12 + 8}px`,
              }}
            >
              {getRandomMatrixElement()}
            </span>
          ))}
        </>
      )}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
      <div className="fixed top-8 left-8 z-20"onClick={() => window.location.href = '/'}>
        <h2 className="text-xl font-bold text-white">
          <span className="text-green-500">{'<'}</span>
          BitCode/
          <span className="text-green-500">{">"}</span>
        </h2>
      </div>
      <div className="fixed top-5 right-8 z-20">
        <button
          onClick={() => window.location.href = '/'}
          className="bg- text-white  py-2 px-4 rounded-lg hover:text-green-400 transition-colors duration-200"
        >
          Back to Home
        </button>
      </div>
      <div className="w-full max-w-sm z-10">
        <h3 className="text-lg text-gray-300 mb-6 text-center">Password Reset</h3>
        <AnimatePresence mode="wait" custom={step}>
          <motion.div
            key={step}
            custom={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">{">"}</span>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent text-white border-b border-gray-500/50 focus:border-green-500 outline-none py-2 transition-colors duration-300 placeholder-gray-400"
                    placeholder="Email address"
                    required
                    aria-label="Email address"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-green-500 hover:text-white transition-colors duration-200 mt-4"
                >
                  Send OTP
                </button>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit}>
                <div className="text-sm text-gray-400 mb-2">
                  <span className="text-green-500">Email:</span> {email}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">{">"}</span>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-transparent text-white border-b border-gray-500/50 focus:border-green-500 outline-none py-2 transition-colors duration-300 placeholder-gray-400"
                    placeholder="6-digit OTP"
                    maxLength={6}
                    required
                    aria-label="6-digit OTP"
                  />
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black font-bold py-2 rounded-lg hover:bg-green-500 hover:text-white transition-colors duration-200"
                  >
                    Verify OTP
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-700 text-white font-bold py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-500">{">"}</span>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 bg-transparent text-white border-b border-gray-500/50 focus:border-green-500 outline-none py-2 transition-colors duration-300 placeholder-gray-400"
                    placeholder="New password"
                    required
                    aria-label="New password"
                  />
                </div>
                {passwordStrength && (
                  <div className="text-sm mb-2">
                    <span
                      className={`font-mono ${
                        passwordStrength.strength === 'strong'
                          ? 'text-green-500'
                          : passwordStrength.strength === 'medium'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                    >
                      {passwordStrength.message}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">{">"}</span>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1 bg-transparent text-white border-b border-gray-500/50 focus:border-green-500 outline-none py-2 transition-colors duration-300 placeholder-gray-400"
                    placeholder="Confirm password"
                    required
                    aria-label="Confirm password"
                  />
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black font-bold py-2 rounded-lg hover:bg-green-500 hover:text-white transition-colors duration-200"
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-700 text-white font-bold py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ForgotPassword;