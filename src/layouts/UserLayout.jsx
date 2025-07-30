import { Outlet, useLocation } from 'react-router-dom';
import UserNavbar from '../components/user/UserNavbar';
import { ROUTES } from '../routes/paths';

const UserLayout = () => {
  const { pathname } = useLocation();
  const hideNavbar =
    pathname === ROUTES.USER_COMPILER ||
    pathname.startsWith('/user/room/') ||
    pathname === ROUTES.USER_CONTRIBUTE ||
    pathname.startsWith('/battle/');

  return (
    <div role="main" aria-label="User Dashboard">
      {!hideNavbar && <UserNavbar />}
      <Outlet />
    </div>
  );
};

export default UserLayout;
