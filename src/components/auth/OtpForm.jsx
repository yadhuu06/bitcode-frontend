import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuthApi } from "../../hooks/useAuthApi";

// Custom hook for managing OTP timers
const useTimer = (initialExpiration = 600, initialCooldown = 0) => {
  const [otpExpiration, setOtpExpiration] = useState(initialExpiration);
  const [resendCooldown, setResendCooldown] = useState(initialCooldown);

  // Format time in MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP expiration countdown
  useEffect(() => {
    if (otpExpiration > 0) {
      const timer = setInterval(() => {
        setOtpExpiration((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpExpiration]);

  // Handle resend cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Reset timers
  const resetTimer = (newExpiration = initialExpiration, newCooldown = initialCooldown) => {
    setOtpExpiration(newExpiration);
    setResendCooldown(newCooldown);
  };

  // Set cooldown specifically
  const setCooldown = (seconds) => {
    setResendCooldown(seconds);
  };

  return { 
    otpExpiration, 
    resendCooldown, 
    formatTime, 
    resetTimer,
    setCooldown
  };
};

const OtpForm = ({ email, setStep }) => {
  const [otp, setOtp] = useState("");
  const { verifyOtp, resendOtp, isLoading } = useAuthApi();
  const { otpExpiration, resendCooldown, formatTime, resetTimer, setCooldown } = useTimer(600, 60); // Start with 60s cooldown

  // Handle OTP submission
  const handleSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }
    try {
      await verifyOtp(email, otp);
      setOtp("");
      setStep(3);
      toast.success("OTP verified successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "OTP verification failed");
    }
  };

  // Handle OTP resend
//   const handleResend = async () => {
//     if (resendCooldown > 0) {
//       toast.warning(`Please wait ${formatTime(resendCooldown)} before requesting a new OTP`);
//       return;
//     }
    
//     try {
//       setCooldown(60); // Set cooldown immediately to prevent double-clicks
//       const response = await resendOtp(email);
//       setOtp("");
      
//       // Update timers based on backend response
//       if (response.data && response.data.expires_in) {
//         resetTimer(response.data.expires_in, 60);
//       } else {
//         resetTimer(600, 60); // Fallback to 600s expiry and 60s cooldown
//       }
      
//       toast.success("OTP resent successfully!");
//     } catch (err) {
//       console.error("Resend OTP error:", err);
      
//       // If there's a cooldown error from backend
//       if (err.response && err.response.data && err.response.data.cooldown_remaining) {
//         setCooldown(err.response.data.cooldown_remaining);
//         toast.warning(`Please wait ${formatTime(err.response.data.cooldown_remaining)} before requesting a new OTP`);
//       }else {
//   // Detailed error logging
//   console.error("Full error object:", err);
//   console.error("Response available?", !!err.response);
//   if (err.response) {
//     console.error("Status:", err.response.status);
//     console.error("Response data:", err.response.data);
//     console.error("Headers:", err.response.headers);
//   }
  

//   let errorMessage = "Failed to resend OTP";
  
//   if (err.response && err.response.data) {
//     if (typeof err.response.data === 'string') {
//       errorMessage = err.response.data;
//     } else if (err.response.data.error) {
//       errorMessage = err.response.data.error;
//     } else if (err.response.data.message) {
//       errorMessage = err.response.data.message;
//     } else if (err.response.data.detail) {
//       errorMessage = err.response.data.detail;
//     }
//   } else if (err.message) {
//     errorMessage = err.message;
//   }
  
//   // Display error message
//   toast.error(`${errorMessage} (${err.response?.status || 'Unknown'})`);
//   console.error("Final error message:", errorMessage);
  
//   // Reset cooldown if it's a different type of error
//   setCooldown(0);
// }
//     }
//   };

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
          {/* <div className="text-sm">
            {resendCooldown > 0 ? (
              <span className="text-gray-600">
                Resend available in: {formatTime(resendCooldown)}
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
          </div> */}
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
            isLoading || otpExpiration === 0 || otp.length !== 6 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OtpForm;