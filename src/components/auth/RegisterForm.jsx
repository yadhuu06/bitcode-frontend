import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuthApi } from "../../hooks/useAuthApi";
import { useTimer } from "../../hooks/useTimer";
import GoogleAuthButton from "./GoogleAuthButton";
import OtpForm from "./OtpForm";
import PasswordForm from "./PasswordForm";

const RegisterForm = () => {
  const savedState = JSON.parse(localStorage.getItem("authPageState")) || {};
  const [step, setStep] = useState(savedState.step || 1);
  const [email, setEmail] = useState(savedState.email || "");
  const { otpExpiration, resendCooldown, resetTimers } = useTimer();
  const { generateOtp, isLoading } = useAuthApi();

  useEffect(() => {
    if (step === 1) {
      resetTimers();
    }
  }, [step, resetTimers]);

  useEffect(() => {
    const stateToSave = { step, email, otpSent: step >= 2, otpExpiration, resendCooldown };
    localStorage.setItem("authPageState", JSON.stringify(stateToSave));
  }, [step, email, otpExpiration, resendCooldown]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await generateOtp(email);
      setStep(2); 
      console.log("OTP expires in:", data.expires_in);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP"); 
      console.error("OTP generation error:", err.message);
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
            />
          </div>
          <GoogleAuthButton label="Continue with Google" disabled={isLoading} />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300"
          >
            {isLoading ? "Processing..." : "Next"}
          </button>
        </form>
      )}
      {step === 2 && <OtpForm email={email} setStep={setStep} />}
      {step === 3 && <PasswordForm email={email} setStep={setStep} />}
    </div>
  );
};

export default RegisterForm;