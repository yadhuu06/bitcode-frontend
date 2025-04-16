// src/hooks/useAuthApi.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoading } from "../context/LoadingContext";
import { useAuth } from "../context/AuthContext"; // Import useAuth

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useAuthApi = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const { updateAuthState } = useAuth(); // Get updateAuthState from context

  const validateEmail = (email) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return { isValid: false, error: "Email cannot be empty" };
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(trimmedEmail.toLowerCase());
    return { isValid, error: isValid ? "" : "Please enter a valid email" };
  };

  const validatePassword = (password, confirmPassword = null) => {
    const trimmedPassword = password.trim();
    if (!trimmedPassword) return { isValid: false, error: "Password cannot be empty" };
    if (trimmedPassword.length < 8) return { isValid: false, error: "Password must be at least 8 characters" };
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!strongPasswordRegex.test(trimmedPassword)) {
      return { isValid: false, error: "Password must contain uppercase, lowercase, number, and special character" };
    }
    if (confirmPassword !== null && trimmedPassword !== confirmPassword.trim()) {
      return { isValid: false, error: "Passwords do not match" };
    }
    return { isValid: true, error: "" };
  };

  const validateOtp = (otp) => {
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) return { isValid: false, error: "OTP cannot be empty" };
    if (trimmedOtp.length !== 6 || !/^\d{6}$/.test(trimmedOtp)) {
      return { isValid: false, error: "Please enter a valid 6-digit OTP" };
    }
    return { isValid: true, error: "" };
  };

  const login = async (email, password) => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) throw new Error(emailValidation.error);

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) throw new Error(passwordValidation.error);

    setIsLoading(true);
    showLoading("Logging in...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      if (data.role === "admin") {
        toast.info("You are an admin, please login as admin.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("role");
        navigate("/admin_login");
      } else {
        updateAuthState(data); // Update context state
        toast.success("Login successful!");
        localStorage.removeItem("authPageState");
        const redirectUrl = data.redirect_url.startsWith("http")
          ? new URL(data.redirect_url).pathname
          : data.redirect_url;
        navigate(redirectUrl);
      }
      return data;
    } catch (error) {
      console.error("Login error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  const generateOtp = async (email) => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) throw new Error(emailValidation.error);

    setIsLoading(true);
    showLoading("Sending OTP...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data.error || "Failed to send OTP";
        console.error("Generate OTP error:", errorMsg, data.details || "");
        throw new Error(errorMsg);
      }

      toast.success("OTP sent successfully!");
      return data;
    } catch (error) {
      console.error("Generate OTP error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  const verifyOtp = async (email, otp) => {
    const otpValidation = validateOtp(otp);
    if (!otpValidation.isValid) throw new Error(otpValidation.error);

    setIsLoading(true);
    showLoading("Verifying OTP...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data.error || "OTP verification failed";
        console.error("Verify OTP error:", errorMsg);
        throw new Error(errorMsg);
      }

      toast.success("OTP verified successfully!");
      return data;
    } catch (error) {
      console.error("Verify OTP error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  const completeRegistration = async (email, password, confirmPassword) => {
    const passwordValidation = validatePassword(password, confirmPassword);
    if (!passwordValidation.isValid) throw new Error(passwordValidation.error);

    setIsLoading(true);
    showLoading("Completing Registration...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/complete/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username: email.split("@")[0],
          password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data.error || "Registration failed";
        console.error("Complete registration error:", errorMsg);
        throw new Error(errorMsg);
      }

      updateAuthState(data); // Update context state
      toast.success("Registration successful!");
      localStorage.removeItem("authPageState");
      const redirectUrl = data.redirect_url.startsWith("http")
        ? new URL(data.redirect_url).pathname
        : data.redirect_url;
      navigate(redirectUrl);
      return data;
    } catch (error) {
      console.error("Complete registration error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  return { login, generateOtp, verifyOtp, completeRegistration, isLoading };
};