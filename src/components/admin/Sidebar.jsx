import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Swords
} from 'lucide-react';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { logoutSuccess } from '../../store/slices/authSlice';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { toast } from 'react-toastify';
import { logout as authLogout } from '../../services/AuthService';

const Sidebar = ({ onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleToggle = () => {
    setIsCollapsed(prev => !prev);
    if (onCollapseChange) {
      onCollapseChange(!isCollapsed); 
    }
  };

  const handleLogout = async () => {
    dispatch(setLoading({ isLoading: true, message: 'Logging out...', style: 'default' }));
    try {
      await authLogout();
      dispatch(logoutSuccess());
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logoutSuccess());
      toast.error('Logout failed, but session cleared');
      navigate('/');
    } finally {
      dispatch(resetLoading());
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Battles', path: '/admin/battles', icon: Swords },
    { name: 'Questions', path: '/admin/questions', icon: HelpCircle },
  ];

  return (
    <div 
      className={`fixed top-0 left-0 h-full bg-[#000000] text-white transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{ fontFamily: "'Fira Code', monospace" }}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {!isCollapsed && (
          <Link to="/admin/dashboard" className="flex flex-col">
            <h1 className="text-xl font-bold tracking-wider">
              <span className="text-white">{'<'}</span>
              <span className="text-white">Bit</span>
              <span className="text-[#73E600]">Code</span>
              <span className="text-white">{'/>'}</span>
            </h1>
          </Link>
        )}
        <button
          onClick={handleToggle}
          className="p-2 rounded-md hover:bg-gray-900 transition-colors t"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="mt-6 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center p-4 mx-2 my-1 rounded-md transition-all ${
                isActive 
                  ? 'bg-gray-900 text-[#73E600] border-l-4 border-[#73E600] shadow-[0_0_10px_rgba(115,230,0,0.3)]' 
                  : 'hover:bg-gray-900 hover:text-[#73E600] '
              }`}
            >
              <item.icon 
                className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} 
              />
              {!isCollapsed && (
                <span className="ml-4 text-sm font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-4 mx-2 rounded-md text-gray-400 hover:text-[#73E600] hover:bg-gray-900 hover:shadow-[0_0_10px_rgba(115,230,0,0.2)] transition-all duration-300"
        >
          <LogOut className="w-6 h-6" />
          {!isCollapsed && (
            <span className="ml-4 text-sm font-medium">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;