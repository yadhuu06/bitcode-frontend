import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);


    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error) {
      setError('Authentication failed');
      navigate('/', { replace: true });
      setLoading(false);
      return;
    }


    const userRole = localStorage.getItem('user_role');
    if (userRole) {
      const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard';
      navigate(redirectPath, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
    setLoading(false);
  }, [navigate, setLoading]);

  if (error) {
    return <div>Authentication failed. Redirecting...</div>;
  }

  return <div>Authenticating...</div>;
};

export default AuthCallback;