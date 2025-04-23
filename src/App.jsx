// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store';
import { updateTokens, logoutSuccess } from './store/slices/authSlice';
import { setLoading, resetLoading } from './store/slices/loadingSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { setupInterceptors } from './api';
import AuthPage from './components/auth/AuthPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import Users from './pages/admin/Users';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import NotFound from './components/user/NotFound';
import Profile from './pages/user/Profile';
import Compiler from './pages/user/Compiler';
import Rooms from './pages/user/Rooms';
import BitWarAdminLogin from './pages/admin/Login';
import UserNavbar from './components/user/UserNavbar';
import AuthCallback from './components/auth/AuthCallback';
import LoadingIndicator from './components/ui/LoadingIndicator';

const UserLayout = ({ children }) => {
  return (
    <>
      <UserNavbar />
      {children}
    </>
  );
};

const AppWrapper = () => {
  const dispatch = useDispatch();

  const refreshToken = async () => {
    const currentRefreshToken = useSelector((state) => state.auth.refreshToken);
    if (!currentRefreshToken) {
      dispatch(logoutSuccess());
      return false;
    }

    dispatch(setLoading({ isLoading: true, message: 'Refreshing token...', style: 'default' }));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: currentRefreshToken }),
      });
      const data = await response.json();
      if (response.ok) {
        dispatch(updateTokens({
          accessToken: data.access,
          refreshToken: data.refresh,
        }));
        return true;
      }
      throw new Error('Refresh failed');
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch(logoutSuccess());
      return false;
    } finally {
      dispatch(resetLoading());
    }
  };

  const logout = () => {
    dispatch(logoutSuccess());
    window.location.href = '/';
  };

  useEffect(() => {
    setupInterceptors(refreshToken, logout);
  }, [dispatch]);

  return (
    <>
      <LoadingIndicator />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/admin_login" element={<BitWarAdminLogin />} />

        <Route element={<PrivateRoute />}>
          <Route
            path="/user/*"
            element={
              <UserLayout>
                <Routes>
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="compiler" element={<Compiler />} />
                  <Route path="rooms" element={<Rooms />} />
                </Routes>
              </UserLayout>
            }
          />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <Router>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <AppWrapper />
        </Router>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;