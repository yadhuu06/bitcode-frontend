// src/routes/PublicRoute.js
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const PublicRoute = () => {
  const accessToken = Cookies.get('access_token');
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;

  if (accessToken && user) {
    // Decide the redirect path based on role
    const redirectPath = user?.role === 'admin'
      ? '/admin/dashboard'
      : '/user/dashboard';

    return <Navigate to={redirectPath} replace />;
  }


  return <Outlet />;
};

export default PublicRoute;
