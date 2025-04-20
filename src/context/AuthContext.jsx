import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import api, { setupInterceptors } from '../api'; // Import custom Axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = Cookies.get('access_token');
    const role = Cookies.get('role');

    if (accessToken && role) {
      setIsAuthenticated(true);
      setUser({ role, is_superuser: role === 'admin' });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    // Set up Axios interceptors
    setupInterceptors(refreshToken, logout);
  }, []);

  const refreshToken = async () => {
    const refreshToken = Cookies.get('refresh_token');
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const response = await api.post('/api/auth/token/refresh/', {
        refresh: refreshToken,
      });
      const { access, refresh } = response.data;
      Cookies.set('access_token', access, { secure: true, sameSite: 'Strict', expires: 30 / (24 * 60) }); // 30 minutes
      Cookies.set('refresh_token', refresh, { secure: true, sameSite: 'Strict', expires: 7 }); // 7 days
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('role');
    setIsAuthenticated(false);
    setUser(null);
    toast.success('Session expired. Please log in again.');
    navigate('/login');
  };

  const updateAuthState = (data) => {
    if (data.access && data.refresh && data.role) {
      Cookies.set('access_token', data.access, { secure: true, sameSite: 'Strict', expires: 30 / (24 * 60) });
      Cookies.set('refresh_token', data.refresh, { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('role', data.role, { secure: true, sameSite: 'Strict', expires: 7 });
      setIsAuthenticated(true);
      setUser({ role: data.role, is_superuser: data.role === 'admin' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        logout,
        updateAuthState,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};