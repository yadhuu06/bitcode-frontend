
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showMatrix, setShowMatrix] = useState(true);

  const getRandomMatrixElement = () => {
    const chars = '01';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  // Simulated email validation
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('OTP sent to your email');
    setStep(2);
  };

  // Simulated OTP verification
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    toast.success('OTP verified successfully');
    setStep(3);
  };

  // Simulated password reset
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password reset successfully');
    // Add navigation here when integrating with routing
  };

  // Back button handler
  const handleBack = () => {
    if (step === 2) {
      setOtp('');
      setStep(1);
    } else if (step === 3) {
      setNewPassword('');
      setConfirmPassword('');
      setStep(2);
    }
  };

  // Animation variants for sliding
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
            0%, 100% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
      <div className="fixed top-4 left-4 z-20">
        <h2 className="text-xl font-semibold text-white">
          <span className="text-green-500">{'<'}</span>
          Bit Code
          <span className="text-green-500">{">"}</span>
        </h2>
      </div>
      <button
  onClick={() => setShowMatrix(!showMatrix)}
  className="fixed top-4 right-4 z-50 w-14 h-7 bg-gray-800 rounded-full p-1 transition-colors duration-300 focus:outline-none relative shadow-lg"
>
  <span
    className={`block w-5 h-5 bg-white rounded-full transform transition-transform duration-300 ${
      showMatrix ? 'translate-x-7' : 'translate-x-0'
    }`}
  ></span>

  {/* ON label */}
  <span
    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold transition-opacity duration-300 ${
      showMatrix ? 'opacity-100 text-green-500' : 'opacity-0'
    }`}
  >
    ON
  </span>

  {/* OFF label */}
  <span
    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold transition-opacity duration-300 ${
      !showMatrix ? 'opacity-100 text-red-500' : 'opacity-0'
    }`}
  >
    OFF
  </span>
</button>

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
                    className="flex-1 bg-transparent text-white border-b border-green-500/50 focus:border-green-500 outline-none py-2 transition-colors duration-300 placeholder-gray-600"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-black font-semibold py-2 rounded-md hover:bg-green-500 transition-colors duration-300 mt-4"
                >
                  Send OTP
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <div className="text-sm text-gray-400 mb-2">
                  <span className="text-green-500">Email:</span> {email}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">{">"}</span>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 bg-transparent text-white border-b border-green-500/50 focus:border-green-500 outline-none py-2 transition-colors duration-300 placeholder-gray-600"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black font-semibold py-2 rounded-md hover:bg-green-500 transition-colors duration-300"
                  >
                    Verify OTP
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-white text-black font-semibold py-2 rounded-md hover:bg-green-500 transition-colors duration-300"
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
                    className="flex-1 bg-transparent text-white border-b border-green-500/50 focus:border-green-500 outline-none py-2 transition-colors duration-300 placeholder-gray-600"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">{">"}</span>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1 bg-transparent text-white border-b border-green-500/50 focus:border-green-500 outline-none py-2 transition-colors duration-300 placeholder-gray-600"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black font-semibold py-2 rounded-md hover:bg-green-500 transition-colors duration-300"
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-white text-black font-semibold py-2 rounded-md hover:bg-green-500 transition-colors duration-300"
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
