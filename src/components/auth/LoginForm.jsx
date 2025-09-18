import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { loginSuccess } from '../../store/slices/authSlice';
import { login as authLogin } from '../../services/AuthService';
import { toast } from 'react-toastify';
import GoogleAuthButton from './GoogleAuthButton';
import { useNavigate } from 'react-router-dom';
import { Eye ,EyeOff} from 'lucide-react';
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading.isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmails = JSON.parse(localStorage.getItem('emailSuggestions')) || [];
    setEmailSuggestions(storedEmails);
  }, []);

  const validateEmail = (email) => {
    const trimmedEmail = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(trimmedEmail.toLowerCase());
  };

  const validatePassword = (password) => {
    const trimmedPassword = password.trim();
    return trimmedPassword.length >= 8;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const filteredSuggestions = emailSuggestions.filter((suggestion) =>
      suggestion.toLowerCase().startsWith(value.toLowerCase())
    );
    setEmailSuggestions(filteredSuggestions.length > 0 ? filteredSuggestions : JSON.parse(localStorage.getItem('emailSuggestions')) || []);
  };

  const handleSuggestionClick = (suggestion) => {
    setEmail(suggestion);
    setEmailSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('All fields are required');
      return;
    }
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    if (!validatePassword(password)) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    dispatch(setLoading({ isLoading: true, message: 'Logging in...', style: 'default' }));
    try {
      const data = await authLogin({ email: email.trim(), password: password.trim() });
      dispatch(
        loginSuccess({
          user: { email, role: data.role, is_superuser: data.role === 'admin' },
          accessToken: data.access,
          refreshToken: data.refresh,
        })
      );
      const storedEmails = JSON.parse(localStorage.getItem('emailSuggestions')) || [];
      if (!storedEmails.includes(email.trim())) {
        storedEmails.push(email.trim());
        localStorage.setItem('emailSuggestions', JSON.stringify(storedEmails));
      }
      setEmail('');
      setPassword('');
      navigate(data.redirect_url);
      toast.success('Logged in successfully!');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      dispatch(resetLoading());
    }
  };

  return (
    <form className="space-y-7" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-white">Login</h2>
      <div className="relative bg-gray-800 p-1 rounded-md">
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="name@example.com"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={isLoading}
          autoComplete="off"
        />
        {emailSuggestions.length > 0 && email && (
          <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto">
            {emailSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-3 py-2 text-white hover:bg-gray-600 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="relative bg-gray-800 p-1 rounded-md">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
          disabled={isLoading}
        />
            <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>

      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <h5 className="flex-shrink mx-4 text-white">Or Continue With</h5>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <GoogleAuthButton label="Google" />
      <h5
        className="flex-shrink mx-4 text-white cursor-pointer"
        onClick={() => navigate('/forgot_password')}
      >
        Forgot password?
      </h5>
    </form>
  );
};

export default LoginForm;