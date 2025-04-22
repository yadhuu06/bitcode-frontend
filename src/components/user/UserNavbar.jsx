import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const UserNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const navLinkClass = ({ isActive }) =>
    `text-lg font-semibold transition-colors duration-200 ${
      isActive ? 'text-green-500' : 'text-white hover:text-green-500'
    }`;

  return (
    <nav className="bg-black border-b-2 border-green-500 h-16 fixed top-0 left-0 w-full z-10 shadow-md text-white font-mono flex items-center">
      <div className="container mx-auto flex justify-between items-center h-full px-4">
        {/* Logo */}
        <div className="text-2xl font-bold flex items-center h-full">
          <NavLink to="/user/dashboard" className={navLinkClass}>
            <span className="text-green-500">{'</>'}</span>
            <span className="text-white">BitCode</span>
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
        </ul>

        {/* Hamburger Menu (Mobile) */}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <ul className="md:hidden mt-2 space-y-2 bg-gray-900 p-4 absolute w-full top-16 left-0 shadow-md animate-slide-down">
          <li>
            <NavLink to="/user/profile" className={navLinkClass} onClick={toggleMenu}>
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/user/dashboard" className={navLinkClass} onClick={toggleMenu}>
              Problems
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
        </ul>
      )}

      {/* CSS for animation */}
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