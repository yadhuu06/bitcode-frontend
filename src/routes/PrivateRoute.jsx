import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute = () => {
  const accessToken = Cookies.get('access_token');

  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;