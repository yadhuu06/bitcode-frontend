import React, { useState } from "react";
import { toast } from "react-toastify";
import GoogleAuthButton from "./GoogleAuthButton";
import { useAuthApi } from "../../hooks/useAuthApi";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuthApi();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email.trim(), password.trim());
      setEmail("");
      setPassword("");
    } catch (err) {
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Login</h2>
      <div className="bg-gray-800 p-1 rounded-md">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
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
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <h5 className="flex-shrink mx-4 text-white">Or Continue With</h5>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <GoogleAuthButton label="Google" disabled={isLoading} />
    </form>
  );
};

export default LoginForm;