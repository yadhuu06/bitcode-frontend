// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import Cookies from 'js-cookie';
import api, { setupInterceptors } from './api';

const refreshToken = async () => {
  const refresh = Cookies.get('refresh_token');
  if (!refresh) throw new Error("Refresh token not found in cookies");

  const response = await api.post('/api/token/refresh/', { refresh });

  const { access } = response.data;

  Cookies.set('access_token', access); 
  return true;
};


const logout = () => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  window.location.href = '/login'; 
};


setupInterceptors(refreshToken, logout);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
