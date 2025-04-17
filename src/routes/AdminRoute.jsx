import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const AdminRoute = () => {
  const accessToken = Cookies.get('access_token');
  const adminId = Cookies.get('admin_id');

  if (!accessToken || !adminId) {
    return <Navigate to="/admin_login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;