// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import Users from './pages/admin/Users';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route - Accessible to everyone */}
        <Route path="/" element={<AuthPage />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Route>

        {/* Admin-Only Routes  */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;