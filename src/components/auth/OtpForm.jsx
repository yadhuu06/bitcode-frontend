import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { verifyOtp, resendOtp } from '../../services/AuthService';
import { toast } from 'react-toastify';
import { useTimer } from '../../hooks/useTimer';

const OtpForm = ({ email, setStep }) => {
  const [otp, setOtp] = useState('');
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading.isLoading);
  const { otpExpiration, resendCooldown, formatTime, resetTimer, setCooldown } = useTimer(600, 60);

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }
    dispatch(setLoading({ isLoading: true, message: 'Verifying OTP...', style: 'terminal' }));
    try {
      await verifyOtp(email, otp);
      setOtp('');
      setStep(3);
      toast.success('OTP verified successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'OTP verification failed');
    } finally {
      dispatch(resetLoading());
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) {
      toast.warning(`Please wait ${formatTime(resendCooldown)} before requesting a new OTP`);
      return;
    }
    dispatch(setLoading({ isLoading: true, message: 'Resending OTP...', style: 'compile' }));
    try {
      setCooldown(60);
      const response = await resendOtp(email);
      setOtp('');
      if (response.expires_in) {
        resetTimer(response.expires_in, 60);
      } else {
        resetTimer(600, 60);
      }
      toast.success('OTP resent successfully!');
    } catch (err) {
      if (err.response?.data?.cooldown_remaining) {
        setCooldown(err.response.data.cooldown_remaining);
        toast.warning(`Please wait ${formatTime(err.response.data.cooldown_remaining)} before requesting a new OTP`);
      } else {
        let errorMessage = 'Failed to resend OTP';
        if (err.response?.data) {
          errorMessage = err.response.data.error || err.response.data.message || err.response.data.detail || errorMessage;
        } else if (err.message) {
          errorMessage = err.message;
        }
        toast.error(`${errorMessage} (${err.response?.status || 'Unknown'})`);
        setCooldown(0);
      }
    } finally {
      dispatch(resetLoading());
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="text-white text-sm">
          OTP sent to <span className="text-green-500">{email}</span>
        </div>
        <div className="bg-gray-800 p-1 rounded-md">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">
            {otpExpiration > 0 ? (
              <span className="text-yellow-400">OTP expires in: {formatTime(otpExpiration)}</span>
            ) : (
              <span className="text-red-500">OTP expired</span>
            )}
          </div>
          <div className="text-sm">
            {resendCooldown > 0 ? (
              <span className="text-gray-600">Resend available in: {formatTime(resendCooldown)}</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-green-500 hover:underline disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="w-1/3 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-300"
        >
          Back
        </button>
        <button
          type="button"
          disabled={isLoading || otpExpiration === 0 || otp.length !== 6}
          onClick={handleSubmit}
          className={`w-2/3 px-4 py-2 bg-white text-black rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300 ${
            isLoading || otpExpiration === 0 || otp.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OtpForm;