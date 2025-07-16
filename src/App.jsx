import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';
import store from './store';
import { setupInterceptors } from './api';
import LoadingIndicator from './components/ui/LoadingIndicator';
import NotFound from './components/user/NotFound';
import UserNavbar from './components/user/UserNavbar';
import AdminLayout from './components/admin/AdminLayout';
import { useLocation } from 'react-router-dom';
import { ROUTES } from './routes/paths';

const AuthPage = lazy(() => import('./components/auth/AuthPage'));
const AuthCallback = lazy(() => import('./components/auth/AuthCallback'));
const BitWarAdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Battles = lazy(() => import('./pages/admin/Battles'));
const Users = lazy(() => import('./pages/admin/Users'));
const Questions = lazy(() => import('./pages/admin/Questions'));
const QuestionForm = lazy(() => import('./components/admin/questions/QuestionForm'));
const TestCaseManager = lazy(() => import('./components/admin/questions/TestCaseManager'));
const Dashboard = lazy(() => import('./pages/user/UserDashboard'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Compiler = lazy(() => import('./pages/user/Compiler'));
const Rooms = lazy(() => import('./pages/user/Rooms'));
const RoomLobby = lazy(() => import('./pages/user/RoomLobby'));
const Battle = lazy(() => import('./pages/user/Battle')); 
const PrivateRoute = lazy(() => import('./routes/PrivateRoute'));
const AdminRoute = lazy(() => import('./routes/AdminRoute'));
const AnswerVerification = lazy(() => import('./pages/admin/AnswerVerification'));
const Contribute = lazy(() => import('./pages/user/Contribute'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 rounded-md text-red-400 border border-red-700 font-mono text-center">
          Your Battle is Getting Crashed. Please retry or contact support.
       
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
  const { pathname } = useLocation();
  const hideNavbar = pathname === ROUTES.USER_COMPILER || pathname.startsWith('/user/room/') || pathname === ROUTES.USER_CONTRIBUTE || pathname.startsWith('/battle/');

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
    const cleanup = setupInterceptors();
    return cleanup;
  }, []);

  return (
    <ErrorBoundary>
      <LoadingIndicator /> 
      <Suspense fallback={<LoadingIndicator />}>
        <Routes>
          <Route path={ROUTES.HOME} element={<AuthPage />} />
          <Route path={ROUTES.LOGIN} element={<AuthPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
          <Route path={ROUTES.ADMIN_LOGIN} element={<BitWarAdminLogin />} />
          <Route element={<PrivateRoute />}>
            <Route
              element={
                <UserLayout>
                  <Outlet />
                </UserLayout>
              }
            >
              <Route path={ROUTES.USER_DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.USER_PROFILE} element={<Profile />} />
              <Route path={ROUTES.USER_COMPILER} element={<Compiler />} />
              <Route path={ROUTES.USER_ROOMS} element={<Rooms />} />
              <Route path={ROUTES.USER_ROOM} element={<RoomLobby />} />
              <Route path={ROUTES.USER_BATTLE} element={<Battle />} /> 
              <Route path={ROUTES.USER_CONTRIBUTE} element={<Contribute />} />
            </Route>
          </Route>
          <Route element={<AdminRoute />}>
            <Route
              element={
                <AdminLayout>
                  <Outlet />
                </AdminLayout>
              }
            >
              <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
              <Route path={ROUTES.ADMIN_USERS} element={<Users />} />
              <Route path={ROUTES.ADMIN_BATTLES} element={<Battles />} />
              <Route path={ROUTES.ADMIN_QUESTIONS} element={<Questions />} />
              <Route path={ROUTES.ADMIN_QUESTION_ADD} element={<QuestionForm isAdmin={true} />} />
              <Route path={ROUTES.ADMIN_QUESTION_EDIT} element={<QuestionForm isAdmin={true} />} />
              <Route path={ROUTES.ADMIN_QUESTION_VERIFY} element={<AnswerVerification />} />
              <Route path={ROUTES.ADMIN_QUESTION_TEST_CASES} element={<TestCaseManager />} />
            </Route>
          </Route>
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  if (!googleClientId) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="p-4 bg-red-900/20 rounded-md text-red-400 border border-red-700 text-center">
          Configuration Error: Google Client ID is missing. Please contact support.
        </div>
      </div>
    );
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