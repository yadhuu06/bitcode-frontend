import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  LogOut,
  Menu,
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux'; // Added useSelector
import { logoutSuccess } from '../../store/slices/authSlice';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { logout as authLogout } from '../../services/AuthService';

const Sidebar = ({ onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false); // Default to expanded for desktop
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const refreshToken = useSelector((state) => state.auth.refreshToken) || Cookies.get('refresh_token'); // Retrieve refreshToken

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState); 
    }
  };

  const handleLogout = async () => {
    dispatch(setLoading({ isLoading: true, message: 'Logging out...', style: 'default' }));
    try {
      // Pass the refreshToken to authLogout
      await authLogout(refreshToken);
      dispatch(logoutSuccess());
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
      {/* Mobile Navbar (visible on small screens) */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-[#000000] text-white z-50 border-b border-gray-800" style={{ fontFamily: "'Fira Code', monospace" }}>
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
            onClick={handleToggle}
            className="p-2 rounded-md hover:bg-gray-900 transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu size={24} />
          </button>
        </div>
        {/* Mobile Dropdown Menu */}
        <div className={`absolute top-16 left-0 w-full bg-[#000000] border-t border-gray-800 transition-all duration-300 overflow-hidden ${isCollapsed ? 'h-0' : 'h-auto'}`}>
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsCollapsed(true)} // Close menu on selection
                  className={`flex items-center p-4 mx-2 my-1 rounded-md transition-all ${
                    isActive 
                      ? 'bg-gray-900 text-[#73E600] shadow-[0_0_10px_rgba(115,230,0,0.3)]' 
                      : 'hover:bg-gray-900 hover:text-[#73E600]'
                  }`}
                >
                  <item.icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="ml-4 text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => { handleLogout(); setIsCollapsed(true); }}
              className="flex items-center w-full p-4 mx-2 rounded-md text-gray-400 hover:text-[#73E600] hover:bg-gray-900 hover:shadow-[0_0_10px_rgba(115,230,0,0.2)] transition-all duration-300"
            >
              <LogOut className="w-6 h-6" />
              <span className="ml-4 text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (visible on medium screens and above) */}
      <div 
        className={`hidden md:flex fixed top-0 left-0 h-full bg-[#000000] text-white transition-all duration-300 z-50 flex-col ${isCollapsed ? 'w-16' : 'w-64'}`}
        style={{ fontFamily: "'Fira Code', monospace" }}
      >
        <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-800`}>
          <Link to="/admin/dashboard" className={`${isCollapsed ? 'hidden' : 'flex'} flex-col`}>
            <h1 className="text-xl font-bold tracking-wider">
              <span className="text-white">{'<'}</span>
              <span className="text-white">Bit</span>
              <span className="text-[#73E600]">Code</span>
              <span className="text-white">{'/>'}</span>
            </h1>
          </Link>
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
                <item.icon 
                  className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''} ${isCollapsed ? 'mx-auto' : ''}`} 
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
            className={`flex items-center w-full p-4 mx-2 rounded-md text-gray-400 hover:text-[#73E600] hover:bg-gray-900 hover:shadow-[0_0_10px_rgba(115,230,0,0.2)] transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-6 h-6" />
            {!isCollapsed && (
              <span className="ml-4 text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;