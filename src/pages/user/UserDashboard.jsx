import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MatrixBackground from '../../components/ui/MatrixBackground';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../../services/ProfileService';
import { updateProfile } from '../../store/slices/authSlice';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth-callback',
  ADMIN_LOGIN: '/admin_login',
  USER_DASHBOARD: '/user/dashboard',
  USER_PROFILE: '/user/profile',
  USER_COMPILER: '/user/compiler',
  USER_ROOMS: '/user/rooms',
  USER_ROOM: '/user/room/:roomId',
  USER_BATTLE: '/battle/:roomId/:questionId',
  USER_CONTRIBUTE: '/contribute',
};

export default function BitCodeHomepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && !user?.username) {
        dispatch(setLoading({ isLoading: true, message: 'Loading user profile...', style: 'default', progress: 50 }));
        try {
          const userData = await fetchProfile();
          dispatch(updateProfile({ user: userData })); // Sync user data with Redux
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error(error.message || 'Failed to load user profile');
          navigate(ROUTES.LOGIN);
        } finally {
          dispatch(resetLoading());
        }
      } else if (!isAuthenticated) {
        navigate(ROUTES.LOGIN);
      }
    };

    fetchUserData();
  }, [dispatch, isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-black text-gray-100 relative overflow-hidden">
      <MatrixBackground particleCount={65} color="#00FF40" opacityRange={[0.1, 0.5]} />
      <ToastContainer />
      <div className="max-w-6xl mx-auto px-4 mt-8 z-10 relative">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center py-16">
          <p className="text-xl mb-10 text-center max-w-2xl">
            Master coding with our real-time compiler, compete in thrilling battles, and contribute problems to challenge the community.
          </p>
          <div className="flex gap-4">
            <button
              className="border-2 border-[#00FF40] text-[#00FF40] font-bold py-3 px-8 rounded uppercase tracking-wide hover:bg-[#00FF40]/10 transition-colors"
              onClick={() => navigate(ROUTES.USER_COMPILER)}
            >
              Try Compiler
            </button>
            <button
              className="bg-[#00FF40] text-black font-bold py-3 px-8 rounded uppercase tracking-wide hover:bg-[#22c55e] transition-colors"
              onClick={() => navigate(ROUTES.USER_ROOMS)}
            >
              Join Battle
            </button>
            <button
              className="border-2 border-[#00FF40] text-[#00FF40] font-bold py-3 px-8 rounded uppercase tracking-wide hover:bg-[#00FF40]/10 transition-colors"
              onClick={() => navigate(ROUTES.USER_CONTRIBUTE)}
            >
              Contribute
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              title: 'Real-Time Compiler',
              desc: 'Practice coding with instant feedback using our powerful compiler. Test your skills on a variety of problems.',
            },
            {
              title: 'Live Coding Battles',
              desc: 'Compete in 1v1, 5-participant, or 10-participant battles with ranked or timed modes to prove your coding prowess.',
            },
            {
              title: 'Contribute Problems',
              desc: 'Create and share your own coding challenges to test the skills of the BitCode community.',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gray-900 p-6 rounded-lg border-l-4 border-[#00FF40] hover:-translate-y-1 transition-transform"
            >
              <h3 className="text-[#00FF40] text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.desc}</p>
            </div>
          ))}
        </section>

        {/* Battle Rooms Section */}
        <section className="bg-gray-900 rounded-lg p-6 mb-16">
          <h2 className="text-[#00FF40] text-2xl font-bold mb-6 text-center">Join a Coding Battle</h2>
          <p className="text-gray-300 text-center mb-6 max-w-2xl mx-auto">
            Dive into real-time coding battles! Choose from 1v1, 5-participant, or 10-participant rooms. Compete in ranked mode to earn points (1v1: 50/0, 5p: 70/40/0, 10p: 100/60/40/0...) or timed mode with 15, 30, or 60-minute challenges. The fastest coders win: 1 winner in 1v1, 3 in 5-participant, and 5 in 10-participant rooms.
          </p>
          <div className="flex justify-center">
            <button
              className="bg-[#00FF40] text-black font-bold py-3 px-8 rounded uppercase tracking-wide hover:bg-[#22c55e] transition-colors"
              onClick={() => navigate(ROUTES.USER_ROOMS)}
            >
              Join Now
            </button>
          </div>
        </section>
      </div>

      <footer className="text-center py-6 opacity-70 text-sm border-t border-gray-800">
        <p>© 2025 BitCode - The Ultimate Coding Platform</p>
      </footer>
    </div>
  );
}