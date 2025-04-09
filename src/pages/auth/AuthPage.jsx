import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";

const API_BASE_URL = "http://localhost:8000";
const FRONTEND_BASE_URL = "http://localhost:5173"; 
const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSavedState = () => {
    try {
      const savedState = localStorage.getItem("authPageState");
      return savedState ? JSON.parse(savedState) : null;
    } catch (e) {
      console.error("Error parsing saved state:", e);
      return null;
    }
  };

  const savedState = getSavedState();

  const [isLogin, setIsLogin] = useState(savedState?.isLogin ?? true);
  const [step, setStep] = useState(savedState?.step ?? 1);
  const [email, setEmail] = useState(savedState?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(savedState?.timeRemaining ?? 60);
  const [otpSent, setOtpSent] = useState(savedState?.otpSent ?? false);

  const myRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const stateToSave = { isLogin, step, email, otpSent, timeRemaining };
    localStorage.setItem("authPageState", JSON.stringify(stateToSave));
  }, [isLogin, step, email, otpSent, timeRemaining]);

  useEffect(() => {
    if (otpSent && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [otpSent, timeRemaining]);

  useEffect(() => {
    if (isLogin) {
      setStep(1);
      setOtpSent(false);
      setTimeRemaining(60);
      clearInterval(timerRef.current);
    }
  }, [isLogin]);
// In AuthPage.jsx - Modify the useEffect that handles URL parameters
useEffect(() => {
  const query = new URLSearchParams(location.search);
  const accessToken = query.get("access_token");
  const refreshToken = query.get("refresh_token");
  

  if (accessToken && refreshToken) {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    

    localStorage.setItem("role", role);
    
    setSuccess("Google login successful!");
    localStorage.removeItem("authPageState");
    

    const path = location.pathname || '/user/dashboard';
    navigate(path);
  }
}, [location, navigate]);
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

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/social-auth/login/google-oauth2/`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) return setError(emailValidation.error);

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) return setError(passwordValidation.error);

    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("role", data.role);
      setSuccess("Login successful!");
      localStorage.removeItem("authPageState");

      const redirectUrl = data.redirect_url.startsWith("http")
        ? new URL(data.redirect_url).pathname 
        : data.redirect_url;
      navigate(redirectUrl);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!vantaEffect && myRef.current && typeof NET !== "undefined") {
      const originalLineMethod = THREE.Line.prototype.computeLineDistances;
      THREE.Line.prototype.computeLineDistances = function () {
        const result = originalLineMethod.apply(this, arguments);
        if (this.material && !this.material._hasBeenUpdated) {
          if (this.material.color) {
            this.material.color.set(0x00ff00);
          }
          this.material.transparent = true;
          this.material.opacity = 0.45;
          this.material.color = new THREE.Color(0x000000);
          this.material.blending = THREE.NormalBlending;
          this.material.blurRadius = 15;
          this.material.depthWrite = false;
          this.material._hasBeenUpdated = true;
        }
        return result;
      };

      const effect = NET({
        el: myRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x00ff00,
        backgroundColor: 0x000000,
        points: 12.0,
        maxDistance: 20.0,
        spacing: 15.0,
        showDots: true,
        thickness: 3.0,
        lineColor: 0x00ff00,
        highlightColor: 0x00ff00,
        midtoneColor: 0x00ff00,
        lowlightColor: 0x008000,
        forceAnimate: true,
      });

      if (myRef.current) {
        myRef.current.style.filter = "blur(.25px)";
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
        overlay.style.zIndex = "0";
        document.body.appendChild(overlay);

        const content = document.querySelector(".your-content-container");
        if (content) {
          content.style.position = "relative";
          content.style.zIndex = "1";
        }
      }

      if (effect && effect.scene) {
        effect.scene.traverse((object) => {
          if (object instanceof THREE.Line && object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => {
                if (mat.color) mat.color.set(0x00ff00);
                mat.transparent = true;
                mat.opacity = 0.45;
              });
            } else if (object.material.color) {
              object.material.color.set(0x00ff00);
              object.material.transparent = true;
              object.material.opacity = 0.45;
            }
          }
        });
      }

      setVantaEffect(effect);
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const handleStep1 = async (e) => {
    e.preventDefault();
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) return setError(emailValidation.error);

    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send OTP");

      setOtpSent(true);
      setTimeRemaining(60);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    const otpValidation = validateOtp(otp);
    if (!otpValidation.isValid) return setError(otpValidation.error);

    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "OTP verification failed");

      setStep(3);
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    const passwordValidation = validatePassword(password, confirmPassword);
    if (!passwordValidation.isValid) return setError(passwordValidation.error);

    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/complete/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          username: email.split("@")[0],
          password: password.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("role", data.role);
      setSuccess("Registration successful!");
      localStorage.removeItem("authPageState");
      setIsLogin(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setStep(1);
      setOtpSent(false);
      // Handle full URL or relative path
      const redirectUrl = data.redirect_url.startsWith("http")
        ? new URL(data.redirect_url).pathname // Extract path if full URL
        : data.redirect_url;
      navigate(redirectUrl);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const resetRegistration = () => {
    setStep(1);
    setOtp("");
    setOtpSent(false);
    setTimeRemaining(60);
    clearInterval(timerRef.current);
    localStorage.removeItem("authPageState");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(10, 10, 10, 0.08)",
          zIndex: 1,
        }}
      />
      <div
        ref={myRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
      />
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-20">
        <div className="text-left flex items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-white">{"<"}</span>
            <span className="text-white">Bit </span>
            <span className="text-green-500">Code</span>
            <span className="text-white">{">"}</span>
            <div className="text-xs text-green-500 ml-2">01010101</div>
          </h1>
        </div>
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            resetRegistration();
          }}
          className="text-white hover:text-green-500 transition-colors"
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-black bg-opacity-40 rounded-lg shadow-xl border border-gray-800">
        {success && <div className="text-green-500 text-sm">{success}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-6">
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
            {error && <div className="text-red-500 text-sm">{error}</div>}
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
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span className="font-medium">{isLoading ? "Processing..." : "Google"}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={step === 1 ? handleStep1 : step === 2 ? handleStep2 : handleStep3} className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Register - Step {step} of 3</h2>
            {step === 1 && (
              <>
                <div className="bg-gray-800 p-1 rounded-md">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                    />
                    <path
                      fill="#34A853"
                      d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                    />
                  </svg>
                  <span className="font-medium">{isLoading ? "Processing..." : "Continue with Google"}</span>
                </button>
              </>
            )}
            {step === 2 && (
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
                    {timeRemaining > 0 ? (
                      <span className="text-yellow-400">OTP expires in: {formatTime(timeRemaining)}</span>
                    ) : (
                      <span className="text-red-500">OTP expired</span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={timeRemaining > 0}
                    onClick={handleStep1}
                    className={`text-sm ${timeRemaining > 0 ? "text-gray-600" : "text-green-500 hover:underline"}`}
                  >
                    {timeRemaining > 0 ? `Resend in ${formatTime(timeRemaining)}` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <>
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
              </>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex space-x-4">
              {step !== 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="w-1/3 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-300"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || (step === 2 && timeRemaining === 0)}
                className={`${
                  step === 1 || step !== 2 ? "w-full" : "w-2/3"
                } px-4 py-2 bg-white text-black rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300 ${
                  step === 2 && timeRemaining === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Processing..." : step === 3 ? "Complete Registration" : "Next"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;