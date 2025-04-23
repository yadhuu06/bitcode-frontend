import React, { useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';

const AdminDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleCollapseChange = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div style={{ backgroundColor: '#000000', color: 'white', minHeight: '100vh' }}>
      <Sidebar onCollapseChange={handleCollapseChange} />
      <div 
        style={{ 
          marginLeft: isSidebarCollapsed ? '4rem' : '16rem', 
          padding: '2rem',
          height: '100%',
          transition: 'margin-left 0.3s',
          backgroundColor: '#000000', 
        }}
      >
        <h1 style={{ fontFamily: "'Fira Code', monospace" }}>
          Welcome to Admin Dashboard
        </h1>
      </div>
    </div>
  );
};

export default AdminDashboard;