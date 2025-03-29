import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';

const RegistrationPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
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
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const responseData = await response.json();
      console.log('Registration successful', responseData);
      // Handle successful registration - redirect or show success message
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Semi-transparent overlay for reduced opacity */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.08)', // Light black overlay
          zIndex: 1 
        }}
      />
      
      {/* Vanta.js background div */}
      <div 
        ref={myRef} 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          zIndex: 0 
        }}
      />

      {/* Header with custom-styled logo and login link */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-20">
        <div className="text-left flex items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-white">&lt;</span>
            <span className="text-white">Bit</span>
            <span className="text-green-500">Code</span>
            <span className="text-white">&gt;</span>
          </h1>
          <div className="text-xs text-green-500 ml-2">01010101</div>
        </div>
        <a href="#" className="text-white hover:text-green-500 transition-colors">Login</a>
      </div>

      {/* Registration Form */}
      <div className="relative z-10 w-full max-w-md p-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Create an account</h2>
          <p className="text-gray-400">Enter your email below to create your account.</p>

          <div>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300 flex items-center justify-center"
          >
            {isLoading ? 'Signing in...' : 'Sign in with Email'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-500">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          <button 
            type="button"
            className="w-full px-4 py-2 border border-gray-700 rounded-md text-white hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.09-1.73 3.28-4.3 3.28-7.37z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.75c-.99.67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.86-2.59 3.29-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <div className="text-center text-sm text-gray-500">
            By clicking continue, you agree to our{' '}
            <a href="#" className="underline hover:text-green-500 transition-colors">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-green-500 transition-colors">Privacy Policy</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;