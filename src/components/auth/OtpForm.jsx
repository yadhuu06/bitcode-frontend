import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuthApi } from "../../hooks/useAuthApi";
import { useTimer } from "../../hooks/useTimer";

const OtpForm = ({ email, setStep }) => {
  const [otp, setOtp] = useState("");
  const { verifyOtp, generateOtp, isLoading } = useAuthApi();
  const { otpExpiration, resendCooldown, formatTime } = useTimer();
  
  // State for resend delay (2 minutes) and resend countdown (10 seconds)
  const [resendDelay, setResendDelay] = useState(120); // 120 seconds = 2 minutes
  const [resendCountdown, setResendCountdown] = useState(0); // Countdown after resend

  // Handle the 2-minute delay before showing "Resend OTP"
  useEffect(() => {
    if (resendDelay > 0) {
      const timer = setInterval(() => {
        setResendDelay((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendDelay]);

  // Handle OTP submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp(email, otp);
      setOtp("");
      setStep(3);
    } catch (err) {
      toast.error(err.message || "OTP verification failed");
    }
  };

  // Handle OTP resend
  const handleResend = async () => {
    try {
      await generateOtp(email);
      setOtp("");
      setResendCountdown(10); // Start 10-second countdown
      toast.success("OTP resent successfully!");
    } catch (err) {
      // Error handled in useAuthApi
    }
  };

  // Handle the 10-second countdown after resending
  useEffect(() => {
    if (resendCountdown > 0) {
      const countdownTimer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdownTimer);
    }
  }, [resendCountdown]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="text-white text-sm">
          OTP sent to <span className="text-green-500">{email}</span>
        </div>
        <div className="bg-gray-800 p-1 rounded-md">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
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
            {resendDelay > 0 ? (
              <span className="text-gray-600">
                Resend available in: {formatTime(resendDelay)}
              </span>
            ) : resendCountdown > 0 ? (
              <span className="text-gray-600">
                Resend in: {formatTime(resendCountdown)}
              </span>
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
          type="submit"
          disabled={isLoading || otpExpiration === 0}
          className={`w-2/3 px-4 py-2 bg-white text-black rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300 ${
            isLoading || otpExpiration === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next {/* Rely on global LoadingAnimation */}
        </button>
      </div>
    </form>
  );
};

export default OtpForm;