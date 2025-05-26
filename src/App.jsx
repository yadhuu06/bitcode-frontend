import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';
import store from './store';
import { setupInterceptors } from './api';
import AuthPage from './components/auth/AuthPage';
import AuthCallback from './components/auth/AuthCallback';
import AdminDashboard from './pages/admin/AdminDashboard';
import Battles from './pages/admin/Battles';
import Users from './pages/admin/Users';
import Questions from './pages/admin/Questions';
import BitWarAdminLogin from './pages/admin/Login';
import Dashboard from './pages/user/UserDashboard';
import Profile from './pages/user/Profile';
import Compiler from './pages/user/Compiler';
import Rooms from './pages/user/Rooms';
import RoomLobby from './pages/user/RoomLobby';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import NotFound from './components/user/NotFound';
import UserNavbar from './components/user/UserNavbar';
import LoadingIndicator from './components/ui/LoadingIndicator';
import AdminLayout from './components/admin/AdminLayout';
import QuestionForm from './components/admin/questions/QuestionForm';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 rounded-md text-red-400 border border-red-700 font-mono">
          Something went wrong. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

const UserLayout = ({ children }) => {
  const location = useLocation();
  const { pathname } = location;

  const hideNavbar =
    pathname === '/user/compiler' || pathname.startsWith('/user/room/');

  return (
    <div role="main" aria-label="User Dashboard">
      {!hideNavbar && <UserNavbar />}
      {children}
    </div>
  );
};

UserLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

const AppWrapper = () => {
  useEffect(() => {
    setupInterceptors();
  }, []);

  return (
    <ErrorBoundary>
      <LoadingIndicator />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/admin_login" element={<BitWarAdminLogin />} />

        <Route element={<PrivateRoute />}>
          <Route
            path="/user/*"
            element={
              <UserLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="compiler" element={<Compiler />} />
                  <Route path="rooms" element={<Rooms />} />
                  <Route path="room/:roomId" element={<RoomLobby />} />
                </Routes>
              </UserLayout>
            }
          />
        </Route>

        <Route element={<AdminRoute />}>
          <Route
            path="/admin/*"
            element={
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="battles" element={<Battles />} />
                  <Route path="questions" element={<Questions />} />
                  <Route path="questions/add" element={<QuestionForm />} />
                  <Route path="questions/edit/:questionId" element={<QuestionForm />} />
                </Routes>
              </AdminLayout>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  if (!googleClientId) {
    console.warn('Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
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
            theme="dark"
            aria-live="polite"
          />
          <AppWrapper />
        </Router>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;