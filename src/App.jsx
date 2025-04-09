// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import Users from './pages/admin/Users';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import NotFound from './components/user/NotFound';
import Profile from './pages/user/Profile';
import Compiler from './pages/user/Compiler';
import Rooms from './pages/user/Rooms';
import UserNavbar from './components/user/UserNavbar';



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
    <Router>
      <Routes>

        <Route path="/" element={<AuthPage />} />


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
    </Router>
  );
}

export default App;