import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/admin-panel/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens and admin_id
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('admin_id', data.admin_id);

        toast.success(data.message || 'Login successful!', {
          position: 'top-right',
          autoClose: 3000,
        });

        // Navigate to admin dashboard
        navigate('/admin/dashboard');
      } else {
        toast.error(data.error || 'Login failed', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header with Logo */}
      <header className="p-6">
        <div className="text-2xl font-bold">
          <span className="text-white">{'< '}</span>
          <span style={{ color: '#00FF40' }}>Bit</span>
          <span className="text-white">Code</span>
          <span style={{ color: '#00FF40' }}>{' >'}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 rounded-lg border" style={{ borderColor: '#00FF40' }}>
          <div className="text-center">
            <h2 className="text-3xl font-extrabold">Admin Login</h2>
            <p className="mt-2" style={{ color: '#00FF40' }}>Enter your credentials to access the dashboard</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border-2 bg-black text-white rounded-md focus:outline-none"
                  style={{ borderColor: '#00FF40' }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border-2 bg-black text-white rounded-md focus:outline-none"
                  style={{ borderColor: '#00FF40' }}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full flex justify-center items-center py-2 px-4 border-2 rounded-md text-sm font-medium transition-all duration-300 relative border-[#00FF40] bg-[#00FF40] text-black hover:bg-transparent hover:text-[#00FF40] overflow-hidden group`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#00FF40]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="relative z-10 transition-all duration-300 group-hover:animate-pulse">
                    Sign In
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        © 2025 BitCode. All rights reserved.
      </footer>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}