import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const MatrixBackground = () => {
  useEffect(() => {
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const chars = '01';
    const fontSize = 14;
    const numChars = Math.floor(Math.random() * 21) + 60; // 60–80 chars
    const particles = [];

    // Initialize particles
    for (let i = 0; i < numChars; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: chars.charAt(Math.floor(Math.random() * chars.length)),
        opacity: 0,
        phase: 'fadeIn',
        speed: Math.random() * 0.02 + 0.01,
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      particles.forEach((p) => {
        ctx.fillStyle = `rgba(0, 255, 64, ${p.opacity})`;
        ctx.fillText(p.char, p.x, p.y);

        if (p.phase === 'fadeIn') {
          p.opacity += p.speed;
          if (p.opacity >= 0.8) p.phase = 'fadeOut';
        } else {
          p.opacity -= p.speed;
          if (p.opacity <= 0) {
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
            p.char = chars.charAt(Math.floor(Math.random() * chars.length));
            p.opacity = 0;
            p.phase = 'fadeIn';
            p.speed = Math.random() * 0.02 + 0.01;
          }
        }
      });
    };

    const interval = setInterval(draw, 50);
    const handleResize = () => {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
      particles.forEach((p) => {
        p.x = Math.min(p.x, canvas.width);
        p.y = Math.min(p.y, canvas.height);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas id="matrix" className="fixed top-0 left-0 z-0 opacity-30" />;
};

export default function BitCodeHomepage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-gray-100 relative overflow-hidden">
      <MatrixBackground />
      <ToastContainer />
      <div className="max-w-6xl mx-auto px-4 mt-8 z-10 relative">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center py-16">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-white">Bit</span>
            <span className="text-[#00FF40]">Code</span>
          </h1>
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