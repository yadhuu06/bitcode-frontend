import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute = () => {
  const accessToken = Cookies.get('access_token');

  return accessToken ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;