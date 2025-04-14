// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toasts
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
import { LoadingProvider } from './context/LoadingContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// User layout with navbar
const UserLayout = ({ children }) => {
  return (
    <>
      <UserNavbar />
      {children}
    </>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <LoadingProvider>
          {/* Global ToastContainer, outside Routes */}
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
        </LoadingProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;