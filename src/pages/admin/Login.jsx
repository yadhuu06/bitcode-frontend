import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { loginSuccess } from '../../store/slices/authSlice';
import { login as authLogin } from '../../services/AuthService';

import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading({ isLoading: true, message: 'Connecting', style: 'battle' }));
    try {
      const data = await authLogin({ email, password });
      Cookies.set('access_token', data.access, { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('refresh_token', data.refresh, { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('admin_id', data.admin_id, { secure: true, sameSite: 'Strict', expires: 7 });
      dispatch(loginSuccess({ user: { email }, accessToken: data.access, refreshToken: data.refresh }));
      toast.success(data.message || 'Login successful!', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      dispatch(resetLoading());
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="p-6">
        <div className="text-2xl font-bold">
          <span className="text-white">{'< '}</span>
          <span style={{ color: '#00FF40' }}>Bit</span>
          <span className="text-white">Code</span>
          <span style={{ color: '#00FF40' }}>{' >'}</span>
        </div>
      </header>

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
              >
                <span className="relative z-10 transition-all duration-300 group-hover:animate-pulse">
                  Sign In
                </span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500">
        © 2025 BitCode. All rights reserved.
      </footer>

    </div>
  );
}