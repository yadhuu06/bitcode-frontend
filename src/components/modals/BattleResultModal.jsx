import { Trophy } from 'lucide-react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';

const BattleResultModal = ({ winners, roomCapacity, currentUser, onClose }) => {
  const navigate = useNavigate();
  const maxWinners = { 2: 1, 5: 2, 10: 3 }[roomCapacity] || 1;
  const displayedWinners = winners.slice(0, maxWinners).sort((a, b) => a.position - b.position);
  const isTopWinner = displayedWinners[0]?.username === currentUser;

  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
      {isTopWinner && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <div className="bg-gray-900 border border-green-500 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-green-500 mb-4 text-center">
          {displayedWinners.length === 0 ? "Time’s up! No winners." : "Battle Ended!"}
        </h2>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-green-500 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Final Leaderboard
          </h3>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-gray-900">
            {displayedWinners.length === 0 ? (
              <p className="text-sm text-gray-400">No winners yet.</p>
            ) : (
              displayedWinners.map((result, index) => (
                <div
                  key={index}
                  className={`bg-gray-950 p-3 rounded-lg text-sm border border-green-500/50 ${
                    result.username === currentUser ? 'bg-green-900/50' : ''
                  }`}
                >
                  <p className="flex items-center gap-2">
                    <Trophy className={`w-4 h-4 ${result.position === 1 ? 'text-yellow-400' : 'text-gray-400'}`} />
                    <span className="text-white">{result.username}</span>
                    <span className="text-green-500">#{result.position}</span>
                  </p>
                  <p className="text-gray-400">Completed: {new Date(result.completion_time).toLocaleTimeString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate('/user/rooms')}
            className="bg-green-500 text-black font-semibold py-2 px-4 rounded-lg hover:bg-green-400 transition-colors flex items-center gap-2"
          >
            <span>🏁</span> Start New Battle
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleResultModal;