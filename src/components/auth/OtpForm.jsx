import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuthApi } from "../../hooks/useAuthApi";
import { useTimer } from "../../hooks/useTimer";

const OtpForm = ({ email, setStep }) => {
  const [otp, setOtp] = useState("");
  const { verifyOtp, generateOtp, isLoading } = useAuthApi();
  const { otpExpiration, resendCooldown, formatTime } = useTimer();

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
    } catch (err) {
      // Error handled in useAuthApi
    }
  };

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
              <span className="text-gray-600">Resend in: {formatTime(resendCooldown)}</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-green-500 hover:underline"
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
            otpExpiration === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Processing..." : "Next"}
        </button>
      </div>
    </form>
  );
};

export default OtpForm;