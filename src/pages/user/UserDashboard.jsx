import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
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
        phase: 'fadeIn', // fadeIn or fadeOut
        speed: Math.random() * 0.02 + 0.01, // Fade speed
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Subtle background fade
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      particles.forEach((p) => {
        ctx.fillStyle = `rgba(0, 255, 64, ${p.opacity})`; // Neon green with opacity
        ctx.fillText(p.char, p.x, p.y);

        if (p.phase === 'fadeIn') {
          p.opacity += p.speed;
          if (p.opacity >= 0.8) p.phase = 'fadeOut';
        } else {
          p.opacity -= p.speed;
          if (p.opacity <= 0) {
            // Respawn at new position
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

    const interval = setInterval(draw, 50); // 20 FPS for smooth fading
    const handleResize = () => {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
      // Adjust particle positions on resize
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
  const [activeTab, setActiveTab] = useState('timeBasedRooms');
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-black text-gray-100 relative overflow-hidden">
      <MatrixBackground />
      <div className="max-w-6xl mx-auto px-4 mt-8 z-10 relative">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center py-16">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-white">Bit</span>
            <span className="text-[#00FF40]">Code</span>
          </h1>
          <p className="text-xl mb-10 text-center max-w-2xl">
            Real-time coding battles. Prove your skills. Climb the ranks.
          </p>
          <div className="flex gap-4">
           
            <button className="border-2 border-[#00FF40] text-[#00FF40] font-bold py-3 px-8 rounded uppercase tracking-wide hover:bg-[#00FF40]/10 transition-colors"
            onClick={()=>navigate('/user/rooms')

            }>
              Join Battle
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              title: 'Real-Time Battles',
              desc: 'Challenge coders in live competitions. Solve algorithms and debug faster.',
            },
            {
              title: 'Skill-Based Matching',
              desc: 'Paired with similar-skilled opponents for fair, challenging battles.',
            },
            {
              title: 'Learn & Improve',
              desc: 'Analyze performance, learn from mistakes, and track progress.',
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

        {/* Room Types Section */}
        <section className="bg-gray-900 rounded-lg p-6 mb-16">
          <h2 className="text-[#00FF40] text-2xl font-bold mb-6 text-center">Battle Rooms</h2>
          <div className="flex mb-6 border-b border-gray-700">
            {['timeBasedRooms', 'playerBasedRooms', 'rankBasedRooms'].map((tab) => (
              <button
                key={tab}
                className={`py-2 px-4 font-medium ${
                  activeTab === tab ? 'text-[#00FF40] border-b-2 border-[#00FF40]' : 'text-gray-400'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
              </button>
            ))}
          </div>

          {activeTab === 'timeBasedRooms' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Quick Challenge', duration: '15 minutes', active: 42, difficulty: 'Easy-Medium' },
                { title: 'Standard Battle', duration: '30 minutes', active: 78, difficulty: 'Medium' },
                { title: 'Extended Challenge', duration: '60 minutes', active: 36, difficulty: 'Medium-Hard' },
              ].map((room, index) => (
                <div key={index} className="bg-black bg-opacity-40 p-4 rounded-lg border border-[#00FF40]/20">
                  <h3 className="text-[#00FF40] font-bold mb-2">{room.title}</h3>
                  <div className="flex justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-400">Duration: {room.duration}</p>
                      <p className="text-sm text-gray-400">Currently Active: {room.active}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Difficulty: {room.difficulty}</p>
                    </div>
                  </div>
                  <button className="w-full bg-[#00FF40] text-black py-2 px-4 rounded font-bold hover:bg-[#22c55e] transition-colors">
                    Join Now
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Add similar blocks for playerBasedRooms and rankBasedRooms as needed */}
        </section>

        {/* Leaderboard */}
        <section className="bg-gray-900 rounded-lg p-6 mb-16">
          <h2 className="text-[#00FF40] text-2xl font-bold mb-6 text-center">Top Ranked Coders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-3 px-4 text-[#00FF40]">Rank</th>
                  <th className="py-3 px-4 text-[#00FF40]">Username</th>
                  <th className="py-3 px-4 text-[#00FF40]">Wins</th>
                  <th className="py-3 px-4 text-[#00FF40]">Rating</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((coder, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-3 px-4 font-bold">{index + 1}</td>
                    <td className="py-3 px-4 text-[#00FF40]">{coder.username}</td>
                    <td className="py-3 px-4">{coder.wins}</td>
                    <td className="py-3 px-4">{coder.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="text-center py-6 opacity-70 text-sm border-t border-gray-800">
        <p>© 2025 Bit Code - The Ultimate Real-Time Coding Battle Platform</p>
      </footer>
    </div>
  );
}