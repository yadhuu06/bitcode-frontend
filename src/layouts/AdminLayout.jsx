import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white font-mono">
      {/* Sidebar */}
      <Sidebar onCollapseChange={setCollapsed} />

      {/* Main content */}
      <main
        className={`flex-1 p-4 md:p-8 transition-all duration-300 mt-16 md:mt-0 ${
          collapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
