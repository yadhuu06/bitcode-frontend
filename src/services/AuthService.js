import api from '../api';
import store from '../store';

// Utility function to validate email format
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim().toLowerCase());
};

// Utility function to validate password (enhanced requirements)
const validatePassword = (password) => {
  // Require at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password.trim());
};

// Utility function to validate OTP
const validateOtp = (otp) => {
  return otp.trim().length === 6 && /^\d{6}$/.test(otp.trim());
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
    throw new Error('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character');
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
      redirect_url: response.data.redirect_url, // Frontend should redirect to this URL
    };
  } catch (error) {
    console.error('Error during login:', error.message);
    const errorMessage = error.response?.data?.error || error.message || 'Login failed';
    throw new Error(errorMessage);
  }
};
export const logout = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new Error('No refresh token available for logout');
    }

    const response = await api.post('/api/auth/logout/', { refresh_token: refreshToken });
    return {
      message: response.data.message,
    };
  } catch (error) {
    console.error('Error during logout:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error || error.message || 'Logout failed';
    throw new Error(errorMessage);
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
      refresh: response.data.refresh || refreshToken, // Use new refresh token if rotated
    };
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error || error.message || 'Token refresh failed';
    throw new Error(errorMessage);
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
      expires_in: response.data.expires_in, // Time in seconds until OTP expires
    };
  } catch (error) {
    console.error('Error generating OTP:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error || error.message || 'OTP generation failed';
    throw new Error(errorMessage);
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
    return {
      message: response.data.message,
      redirect_url: response.data.redirect_url, 
    };
  } catch (error) {
    console.error('Error verifying OTP:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error || error.message || 'OTP verification failed';
    throw new Error(errorMessage);
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
    console.error('Error resending OTP:', error.response?.data || error.message);
    if (error.response?.data?.error?.includes('Please wait')) {
      const cooldownMatch = error.response.data.error.match(/(\d+)/);
      const cooldown = cooldownMatch ? parseInt(cooldownMatch[0], 10) : 0;
      throw Object.assign(new Error(error.response.data.error), { cooldown });
    }
    const errorMessage = error.response?.data?.error || error.message || 'OTP resend failed';
    throw new Error(errorMessage);
  }
};

export const completeRegistration = async (email, password, confirmPassword) => {
  if (!email || !password || !confirmPassword) {
    throw new Error('All fields are required');
  }
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }
  if (!validatePassword(password)) {
    throw new Error('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character');
  }
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  try {
    const response = await api.post('/api/auth/register/complete/', {
      email: email.trim(),
      username: email.trim(), // Using email as username; consider allowing separate usernames
      password: password.trim(),
      confirm_password: confirmPassword.trim(),
    });
    return {
      refresh: response.data.refresh,
      access: response.data.access,
      role: response.data.role,
      redirect_url: response.data.redirect_url || 'user/dashboard',
    };
  } catch (error) {
    console.error('Error completing registration:', error.response?.data || error.message);
    const errorMessage = Object.values(error.response?.data || {})
      .flat()
      .join(', ') || error.message || 'Registration failed';
    throw new Error(errorMessage);
  }
};