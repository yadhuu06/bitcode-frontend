import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';

// Define your API base URL
const API_BASE_URL = 'http://localhost:8000';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const myRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect && myRef.current && typeof NET !== 'undefined') {
      // Override Three.js material creation to ensure lines are green with 45% opacity
      const originalLineMethod = THREE.Line.prototype.computeLineDistances;
      THREE.Line.prototype.computeLineDistances = function() {
        const result = originalLineMethod.apply(this, arguments);
        if (this.material && !this.material._hasBeenUpdated) {
          if (this.material.color) {
            this.material.color.set(0x00ff00); // Set line color to green
          }
          // Set line transparency to 45%
          this.material.transparent = true;
          this.material.opacity = 0.45;
          this.material._hasBeenUpdated = true;
        }
        return result;
      };
      
      // Create the Vanta.js effect with modified settings
      const effect = NET({
        el: myRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x00ff00,           // Primary color for points
        backgroundColor: 0x000000, // Black background
        points: 12.00,
        maxDistance: 20.00,
        spacing: 15.00,
        showDots: true,
        lineColor: 0x00ff00,       // Explicit line color
        highlightColor: 0x00ff00,  // Highlight color (green)
        midtoneColor: 0x00ff00,    // Midtone color (green)
        lowlightColor: 0x008000,   // Darker green for depth
        forceAnimate: true,        // Force animation for smoother effect
      });
      
      // Force line colors and opacity in the scene
      if (effect && effect.scene) {
        effect.scene.traverse((object) => {
          if (object instanceof THREE.Line && object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => {
                if (mat.color) mat.color.set(0x00ff00);
                mat.transparent = true;
                mat.opacity = 0.45; // 45% opacity
              });
            } else if (object.material.color) {
              object.material.color.set(0x00ff00);
              object.material.transparent = true;
              object.material.opacity = 0.45; // 45% opacity
            }
          }
        });
      }
      
      setVantaEffect(effect);
    }
  
    // Cleanup function
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

  // Updated API calls with full URLs
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
        console.log('Making login request to:', `${API_BASE_URL}/api/auth/login/`);
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Include cookies if needed
        });
        
        console.log('Login response status:', response.status);
        
        // Handle potential empty response
        const text = await response.text();
        console.log('Response text:', text);
        
        // Only parse as JSON if there's content
        const data = text ? JSON.parse(text) : {};
        
        if (!response.ok) throw new Error(data.error || 'Login failed');
        
        // Store tokens
        if (data.access && data.refresh) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            setSuccess('Login successful!');
            console.log('Login successful', data);
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (err) {
        console.error('Login error:', err);
        setError(err.message || 'Something went wrong');
    } finally {
        setIsLoading(false);
    }
  };

  const handleStep1 = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting to send OTP to:', email);
      console.log('Making request to:', `${API_BASE_URL}/api/auth/otp/generate/`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/generate/`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
        credentials: 'include' // Include cookies if needed
      });
      
      console.log('OTP generation response status:', response.status);
      
      // Handle potential empty response
      const text = await response.text();
      console.log('Response text:', text);
      
      // Only parse as JSON if there's content
      const data = text ? JSON.parse(text) : {};
      
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
      setStep(2);
    } catch (err) {
      console.error('OTP generation error:', err);
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      console.log('Verifying OTP for:', email);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/verify/`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email, otp }),
        credentials: 'include' // Include cookies if needed
      });
      
      console.log('OTP verification response status:', response.status);
      
      // Handle potential empty response
      const text = await response.text();
      console.log('Response text:', text);
      
      // Only parse as JSON if there's content
      const data = text ? JSON.parse(text) : {};
      
      if (!response.ok) throw new Error(data.error || 'OTP verification failed');
      setStep(3);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
    }
    if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
    }
    setError('');
    setIsLoading(true);

    try {
        console.log('Completing registration for:', email);
        
        const response = await fetch(`${API_BASE_URL}/api/auth/register/complete/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, username: email.split('@')[0], password }),
            credentials: 'include' // Include cookies if needed
        });
        
        console.log('Registration response status:', response.status);
        
        // Handle potential empty response
        const text = await response.text();
        console.log('Response text:', text);
        
        // Only parse as JSON if there's content
        const data = text ? JSON.parse(text) : {};
        
        if (!response.ok) throw new Error(data.error || 'Registration failed');
        
        if (data.access && data.refresh) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            setSuccess('Registration successful! Redirecting...');
            setIsLogin(true);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setOtp('');
            setStep(1);
            // Redirect to dashboard or home
            // window.location.href = '/dashboard';
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (err) {
        console.error('Registration error:', err);
        setError(err.message || 'Registration failed');
    } finally {
        setIsLoading(false);
    }
  };

  // UI part (unchanged)
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.08)', zIndex: 1 }} />
      <div ref={myRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-20">
        <div className="text-left flex items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-white">{'<'}</span>
            <span className="text-white">Bit </span>
            <span className="text-green-500">Code</span>
            <span className="text-white">{'>'}</span>
            <div className="text-xs text-green-500 ml-2">01010101</div>
          </h1>
        </div>
        <button onClick={() => setIsLogin(!isLogin)} className="text-white hover:text-green-500 transition-colors">
          {isLogin ? 'Register' : 'Login'}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 space-y-8">
        {success && <div className="text-green-500 text-sm">{success}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Login</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={step === 1 ? handleStep1 : step === 2 ? handleStep2 : handleStep3} className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Register - Step {step} of 3</h2>
            
            {step === 1 && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            )}
            
            {step === 2 && (
              <>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={handleStep1}
                  className="text-sm text-gray-400 hover:text-green-500"
                >
                  Resend OTP
                </button>
              </>
            )}
            
            {step === 3 && (
              <>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </>
            )}

            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300"
            >
              {isLoading ? 'Processing...' : step === 3 ? 'Complete Registration' : 'Next'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;