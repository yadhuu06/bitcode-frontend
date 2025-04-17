import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Cookies from 'js-cookie';

const GoogleAuthButton = ({ label, disabled }) => {
  const handleSuccess = async (credentialResponse) => {
    console.log('Google credential response:', credentialResponse);
    const credential = credentialResponse.credential;
    if (!credential) {
      console.error('No credential received from Google');
      window.location.href = '/?error=no_credential';
      return;
    }
    try {
      console.log('Sending credential to backend:', credential);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/google/callback/`,
        { credential },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const { user, access_token, refresh_token } = response.data;
      Cookies.set('user_email', user.email, { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('user_id', user.id, { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('user_role', user.is_superuser ? 'admin' : 'user', { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('access_token', access_token, { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set('refresh_token', refresh_token, { secure: true, sameSite: 'Strict', expires: 7 });
      window.location.href = user.is_superuser ? '/admin/dashboard' : '/user/dashboard';
    } catch (error) {
      console.error('Google login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      window.location.href = '/?error=auth_failed';
    }
  };

  const handleError = () => {
    console.error('Google login failed');
    window.location.href = '/?error=auth_failed';
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      disabled={disabled}
    />
  );
};

export default GoogleAuthButton;