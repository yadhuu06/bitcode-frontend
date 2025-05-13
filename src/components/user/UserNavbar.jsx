import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutSuccess } from '../../store/slices/authSlice';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { toast } from 'react-toastify';
import { logout } from '../../services/AuthService';
import { LogOut } from 'lucide-react';

const UserNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleLogout = async () => {
    dispatch(setLoading({
      isLoading: true,
      message: 'Logging out...',
      style: 'terminal',
    }));
    try {
      await logout();
      dispatch(logoutSuccess());
      toast.success('Logged out successfully!', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'dark',
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error.message);
      dispatch(logoutSuccess()); 
      toast.error('Logout failed, but session cleared', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'dark',
      });
      navigate('/');
    } finally {
      dispatch(resetLoading());
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-lg font-semibold transition-colors duration-200 ${
      isActive ? 'text-green-500' : 'text-white hover:text-green-500'
    }`;

  return (
    
    <nav className="bg-black border-b-2 border-green-500 h-16 fixed top-0 left- w-full z-50 shadow-md text-white font-mono flex items-center">
      <div className="container mx-auto flex justify-between items-center h-full px-6">
      <div className="text-[60px] font-bold flex items-center h-full">
  <NavLink to="/user/dashboard" className={navLinkClass}>
    <span className="text-green-500">{'<'}</span>
    <span className="text-white">BitCode</span>
    <span className="text-green-500">{'/>'}</span>
  </NavLink>
</div>



        <ul className="hidden md:flex space-x-8 items-center h-full">
          <li className="h-full flex items-center">
            <NavLink to="/user/dashboard" className={navLinkClass}>
              Problems
            </NavLink>
          </li>
          <li className="h-full flex items-center">
            <NavLink to="/user/profile" className={navLinkClass}>
              Profile
            </NavLink>
          </li>
          <li className="h-full flex items-center">
            <NavLink to="/user/rooms" className={navLinkClass}>
              Rooms
            </NavLink>
          </li>
          <li className="h-full flex items-center">
            <NavLink to="/user/compiler" className={navLinkClass}>
              Compiler
            </NavLink>
          </li>
          {isAuthenticated && (
            <li className="h-full flex items-center relative group">
              <button
                onClick={handleLogout}
                className="text-white hover:text-red-500 transition-colors duration-200 p-2"
                aria-label="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
              <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-sm font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Logout
              </span>
            </li>
          )}
        </ul>

        <button
          className="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded p-2"
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <ul className="md:hidden mt-2 space-y-2 bg-gray-900 p-4 absolute w-full top-16 left-0 shadow-md animate-slide-down z-50">
          <li>
            <NavLink to="/user/dashboard" className={navLinkClass} onClick={toggleMenu}>
              Problems
            </NavLink>
          </li>
          <li>
            <NavLink to="/user/profile" className={navLinkClass} onClick={toggleMenu}>
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/user/rooms" className={navLinkClass} onClick={toggleMenu}>
              Rooms
            </NavLink>
          </li>
          <li>
            <NavLink to="/user/compiler" className={navLinkClass} onClick={toggleMenu}>
              Compiler
            </NavLink>
          </li>
          {isAuthenticated && (
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="text-lg font-semibold text-white hover:text-red-500 transition-colors duration-200 flex items-center space-x-2"
              >
                <LogOut className="w-6 h-6" />
                <span>Logout</span>
              </button>
            </li>
          )}
        </ul>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default UserNavbar;