export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth-callback',
  ADMIN_LOGIN: '/admin_login',

  USER_BASE: '/user',
  USER_DASHBOARD: '/user/dashboard',
  USER_PROFILE: '/user/profile',
  USER_COMPILER: '/user/compiler',
  USER_ROOMS: '/user/rooms',
  USER_ROOM: '/user/room/:roomId',
  USER_BATTLE: '/user/battle/:roomId/:questionId',
  USER_CONTRIBUTE: '/user/contribute',

  ADMIN_BASE: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_BATTLES: '/admin/battles',
  ADMIN_QUESTIONS: '/admin/questions',
  ADMIN_QUESTION_ADD: '/admin/questions/add',
  ADMIN_QUESTION_EDIT: '/admin/questions/edit/:questionId',
  ADMIN_QUESTION_VERIFY: '/admin/questions/verify/:questionId',
  ADMIN_QUESTION_TEST_CASES: '/admin/questions/:questionId/test-cases',

  NOT_FOUND: '*',
  FORGOT_PASSWORD: '/forgot_password'
};
