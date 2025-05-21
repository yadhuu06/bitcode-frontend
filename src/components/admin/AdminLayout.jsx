import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';

const AdminLayout = ({ children }) => {
  const { accessToken } = useSelector((state) => state.auth);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!accessToken) {
    return <Navigate to="/admin_login" replace />;
  }

  const handleCollapseChange = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-mono" role="application" aria-label="Admin Dashboard">
      <Sidebar onCollapseChange={handleCollapseChange} />
      <main
        className={`flex-1 p-8 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-sidebar-collapsed' : 'ml-sidebar-expanded'
        }`}
        role="main"
        aria-label="Main Content"
      >
        {children}
      </main>
    </div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminLayout;