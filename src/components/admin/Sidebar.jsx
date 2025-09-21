import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, HelpCircle, LogOut, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { logoutSuccess } from '../../store/slices/authSlice';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { logout as authLogout } from '../../services/AuthService';
import { toast } from 'react-toastify';
const Sidebar = ({ onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const [isMobileOpen, setIsMobileOpen] = useState(false); 
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const refreshToken = useSelector((state) => state.auth.refreshToken) || Cookies.get('refresh_token');

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapseChange) onCollapseChange(newCollapsedState);
  };

  const handleMobileToggle = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    dispatch(setLoading({ isLoading: true, message: 'Logging out...', style: 'default' }));
    try {
      await authLogout(refreshToken);
      dispatch(logoutSuccess());
      toast.success('Admin logout successful.');

      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logoutSuccess());
      
      navigate('/');
    } finally {
      dispatch(resetLoading());
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Battles', path: '/admin/battles', icon: HelpCircle },
    { name: 'Questions', path: '/admin/questions', icon: HelpCircle },
  ];

  return (
    <>
      {/* 📱 Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-[#000000] text-white z-50 border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <Link to="/admin/dashboard" className="flex flex-col">
            <h1 className="text-xl font-bold tracking-wider">
              <span className="text-white">{'<'}</span>
              <span className="text-white">Bit</span>
              <span className="text-[#73E600]">Code</span>
              <span className="text-white">{'/>'}</span>
            </h1>
          </Link>
          <button
            onClick={handleMobileToggle}
            className="p-2 rounded-md hover:bg-gray-900 transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileOpen && (
          <div className="absolute top-16 left-0 w-full bg-[#000000] border-t border-gray-800 transition-all duration-300">
            <nav className="flex flex-col">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)} // Close after clicking
                    className={`flex items-center p-4 mx-2 my-1 rounded-md transition-all ${
                      isActive
                        ? 'bg-gray-900 text-[#73E600] shadow-[0_0_10px_rgba(115,230,0,0.3)]'
                        : 'hover:bg-gray-900 hover:text-[#73E600]'
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="ml-4 text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={() => { handleLogout(); setIsMobileOpen(false); }}
                className="flex items-center w-full p-4 mx-2 rounded-md text-gray-400 hover:text-[#73E600] hover:bg-gray-900 transition-all"
              >
                <LogOut className="w-6 h-6" />
                <span className="ml-4 text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 💻 Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed top-0 left-0 h-full bg-[#000000] text-white transition-all duration-300 z-50 flex-col ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-800`}>
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
            className="p-2 rounded-md hover:bg-gray-900 transition-colors"
            aria-label="Toggle Sidebar"
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
                    ? 'bg-gray-900 text-[#73E600] shadow-[0_0_10px_rgba(115,230,0,0.3)]'
                    : 'hover:bg-gray-900 hover:text-[#73E600]'
                }`}
              >
                <item.icon className={`w-6 h-6 ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && <span className="ml-4 text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-gray-800">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full p-4 mx-2 rounded-md text-gray-400 hover:text-[#73E600] hover:bg-gray-900 transition-all ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-6 h-6" />
            {!isCollapsed && <span className="ml-4 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
