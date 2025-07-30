import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <Sidebar onCollapseChange={setCollapsed} />

      {/* Main content */}
      <main
        className={`flex-1 p-4 overflow-y-auto transition-all duration-300 md:ml-${collapsed ? '16' : '64'}`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
