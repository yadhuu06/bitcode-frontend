import { useState, useEffect, useRef } from "react";

export const useTimer = () => {
  const savedState = JSON.parse(localStorage.getItem("authPageState")) || {};
  const [otpExpiration, setOtpExpiration] = useState(savedState.otpExpiration || 600); // 10 minutes
  const [resendCooldown, setResendCooldown] = useState(savedState.resendCooldown || 120); // 2 minutes
  const timerRef = useRef(null);

  // Manage timers
  useEffect(() => {
    const isActive = savedState.otpSent && (otpExpiration > 0 || resendCooldown > 0);
    if (isActive) {
      timerRef.current = setInterval(() => {
        setOtpExpiration((prev) => (prev > 0 ? prev - 1 : 0));
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [otpExpiration, resendCooldown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };


  const resetTimers = () => {
    setOtpExpiration(600);
    setResendCooldown(120);
    clearInterval(timerRef.current);
  };

  return { otpExpiration, resendCooldown, formatTime, resetTimers };
};