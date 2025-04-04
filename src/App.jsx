// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import Users from './pages/admin/Users';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/admin/users" element={<Users />} />
      </Routes>
    </Router>
  );
}

export default App;