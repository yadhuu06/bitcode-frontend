import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const accessToken = localStorage.getItem('access_token');
  const adminId = localStorage.getItem('admin_id');


  if (!accessToken || !adminId) {
    return <Navigate to="/admin_login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;