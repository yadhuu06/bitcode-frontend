// src/components/auth/AuthCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { loginSuccess } from '../../store/slices/authSlice';
import Cookies from 'js-cookie';

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const userRole = useSelector((state) => state.auth.user?.role);

  useEffect(() => {
    dispatch(setLoading({
      isLoading: true,
      message: 'Authenticating...',
      style: 'battle', // Use battle style for authentication
    }));

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error) {
      setError('Authentication failed');
      navigate('/', { replace: true });
      dispatch(resetLoading());
      return;
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const role = params.get('role') || 'user';

    if (accessToken && refreshToken) {
      dispatch(
        loginSuccess({
          user: { role, is_superuser: role === 'admin' },
          accessToken,
          refreshToken,
        })
      );
    }

    if (userRole) {
      const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard';
      navigate(redirectPath, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
    dispatch(resetLoading());
  }, [navigate, dispatch, userRole]);

  if (error) {
    return <div>Authentication failed. Redirecting...</div>;
  }

  return <div>Authenticating...</div>;
};

export default AuthCallback;