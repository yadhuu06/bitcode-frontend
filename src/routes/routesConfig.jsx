import { lazy } from 'react';
import { ROUTES } from './paths';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
import PublicRoute from './PublicRoute';
const AuthPage = lazy(() => import('../components/auth/AuthPage'));
const AuthCallback = lazy(() => import('../components/auth/AuthCallback'));
const ForgotPassword = lazy(() => import('../components/auth/ForgotPassword'));

const Dashboard = lazy(() => import('../pages/user/UserDashboard'));
const Profile = lazy(() => import('../pages/user/Profile'));
const Compiler = lazy(() => import('../pages/user/Compiler'));
const Rooms = lazy(() => import('../pages/user/Rooms'));
const RoomLobby = lazy(() => import('../pages/user/RoomLobby'));
const Battle = lazy(() => import('../pages/user/Battle'));
const Contribute = lazy(() => import('../pages/user/Contribute'));

const BitWarAdminLogin = lazy(() => import('../pages/admin/Login'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const Users = lazy(() => import('../pages/admin/Users'));
const Battles = lazy(() => import('../pages/admin/Battles'));
const Questions = lazy(() => import('../pages/admin/Questions'));
const QuestionForm = lazy(() => import('../components/admin/questions/QuestionForm'));
const AnswerVerification = lazy(() => import('../pages/admin/AnswerVerification'));
const TestCaseManager = lazy(() => import('../components/admin/questions/TestCaseManager'));

const NotFound = lazy(() => import('../components/user/NotFound'));

export const routesConfig = [
   {
    element: <PublicRoute />,
    children: [
      { path: ROUTES.HOME, element: <AuthPage /> },
      { path: ROUTES.LOGIN, element: <AuthPage /> },
      { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPassword /> },
      { path: ROUTES.AUTH_CALLBACK, element: <AuthCallback /> },
      { path: ROUTES.ADMIN_LOGIN, element: <BitWarAdminLogin /> },
    ],
  },
  //  USER ROUTES
  {
    element: <PrivateRoute />,
    children: [
      {
        path: ROUTES.USER_BASE,
        element: <UserLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "profile", element: <Profile /> },
          { path: "compiler", element: <Compiler /> },
          { path: "rooms", element: <Rooms /> },
          { path: "room/:roomId", element: <RoomLobby /> },
          { path: "battle/:roomId/:questionId", element: <Battle /> },
          { path: "contribute", element: <Contribute /> },
        ],
      },
    ],
  },

  //  ADMIN ROUTES
  {
    element: <AdminRoute />,
    children: [
      {
        path: ROUTES.ADMIN_BASE,
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "users", element: <Users /> },
          { path: "battles", element: <Battles /> },
          { path: "questions", element: <Questions /> },
          { path: "questions/add", element: <QuestionForm isAdmin /> },
          { path: "questions/edit/:questionId", element: <QuestionForm isAdmin /> },
          { path: "questions/verify/:questionId", element: <AnswerVerification /> },
          { path: "questions/:questionId/test-cases", element: <TestCaseManager /> },
        ],
      },
    ],
  },

  { path: ROUTES.NOT_FOUND, element: <NotFound /> },
];