import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuthApi } from "../../hooks/useAuthApi";

const PasswordForm = ({ email, setStep }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { completeRegistration, isLoading } = useAuthApi();

  // Handle registration submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await completeRegistration(email, password, confirmPassword);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-white text-sm">
        Creating account for <span className="text-green-500">{email}</span>
      </div>
      <div className="bg-gray-800 p-1 rounded-md">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div className="bg-gray-800 p-1 rounded-md">
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
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
          disabled={isLoading}
          className="w-2/3 px-4 py-2 bg-white text-black rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300"
        >
          {isLoading ? "Processing..." : "Complete Registration"}
        </button>
      </div>
    </form>
  );
};

export default PasswordForm;