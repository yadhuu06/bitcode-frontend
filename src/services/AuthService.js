import api from '../api'; // Use the api instance from api.js
import store from '../store';

// Utility function to validate email format
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim().toLowerCase());
};

// Utility function to validate password (minimum requirements)
const validatePassword = (password) => {
  return password.trim().length >= 8;
};

// Utility function to validate OTP
const validateOtp = (otp) => {
  return otp.trim().length === 6 && /^\d{6}$/.test(otp);
};

export const login = async (credentials) => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }
  if (!validatePassword(password)) {
    throw new Error('Password must be at least 8 characters long');
  }

  try {
    const response = await api.post('/api/auth/login/', {
      email: email.trim(),
      password: password.trim(),
    });
    return {
      refresh: response.data.refresh,
      access: response.data.access,
      role: response.data.role,
      redirect_url: response.data.redirect_url,
    };
  } catch (error) {
    console.error('Error during login:', error.message);
    throw new Error(error.response?.data?.error || `Login failed (Status: ${error.response?.status || 'unknown'})`);
  }
};

export const logout = async () => {
  try {
    const state = store.getState();
    const refreshToken = state.auth.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token available for logout');
    }

    const response = await api.post('/api/auth/logout/', { refresh_token: refreshToken });
    return response.data;
  } catch (error) {
    console.error('Error during logout:', error.message);
    throw error;
  }
};

export const refreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  try {
    const response = await api.post('/api/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return {
      access: response.data.access,
      refresh: response.data.refresh || refreshToken, // Fallback if refresh token not rotated
    };
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    throw new Error(error.response?.data?.error || `Token refresh failed (Status: ${error.response?.status || 'unknown'})`);
  }
};

export const generateOtp = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  try {
    const response = await api.post('/api/auth/otp/generate/', {
      email: email.trim(),
    });
    return {
      message: response.data.message,
      expires_in: response.data.expires_in,
    };
  } catch (error) {
    console.error('Error generating OTP:', error.message);
    throw new Error(error.response?.data?.error || `OTP generation failed (Status: ${error.response?.status || 'unknown'})`);
  }
};

export const verifyOtp = async (email, otp) => {
  if (!email || !otp) {
    throw new Error('Email and OTP are required');
  }
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }
  if (!validateOtp(otp)) {
    throw new Error('OTP must be a 6-digit number');
  }

  try {
    const response = await api.post('/api/auth/otp/verify/', {
      email: email.trim(),
      otp: otp.trim(),
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    throw new Error(error.response?.data?.error || `OTP verification failed (Status: ${error.response?.status || 'unknown'})`);
  }
};

export const resendOtp = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  try {
    const response = await api.post('/api/auth/otp/generate/', {
      email: email.trim(),
    });
    return {
      message: response.data.message,
      expires_in: response.data.expires_in,
    };
  } catch (error) {
    console.error('Error resending OTP:', error.message);
    if (error.response?.data?.error?.includes('Please wait')) {
      const cooldownMatch = error.response.data.error.match(/(\d+)/);
      const cooldown = cooldownMatch ? parseInt(cooldownMatch[0], 10) : 0;
      throw Object.assign(new Error(error.response.data.error), { cooldown });
    }
    throw new Error(error.response?.data?.error || `OTP resend failed (Status: ${error.response?.status || 'unknown'})`);
  }
};

export const completeRegistration = async (email, password, confirmPassword) => {
  console.log(email,password,confirmPassword)
  if (!email || !password || !confirmPassword) {
    throw new Error('All fields are required');
  }
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }
  if (!validatePassword(password)) {
    throw new Error('Password must be at least 8 characters long');
  }
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  try {
    const response = await api.post('/api/auth/register/complete/', {
      email: email.trim(),
      username:email,
      password: password.trim(),
      confirm_password: confirmPassword.trim(),
    });
    return {
      refresh: response.data.refresh,
      access: response.data.access,
      role: response.data.role,
      redirect_url: 'user/dashboard',
    };
  } catch (error) {
    console.error('Error completing registration:', error.message);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    const errorMessage = Object.values(error.response?.data || {})
      .flat()
      .join(', ') || `Registration failed (Status: ${error.response?.status || 'unknown'})`;
    throw new Error(errorMessage);
  }
};