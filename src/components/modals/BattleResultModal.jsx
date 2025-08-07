import { Trophy, Zap, Code, Crown, Medal, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';

const BattleResultModal = ({ winners, roomCapacity, currentUser, onClose }) => {
  const maxWinners = { 2: 1, 5: 2, 10: 3 }[roomCapacity] || 1;
  const displayedWinners = winners.slice(0, maxWinners).sort((a, b) => a.position - b.position);
  const userResult = displayedWinners.find((result) => result.username === currentUser);
  const isWinner = !!userResult;
  const isTopWinner = userResult?.position === 1;
  const [showConfetti, setShowConfetti] = useState(isTopWinner);

  useEffect(() => {
    if (isTopWinner) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isTopWinner]);

  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <Code className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      {/* Lightweight confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-green-500 opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animation: `fall 2s linear ${Math.random() * 2}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px #22c55e; }
          50% { box-shadow: 0 0 20px #22c55e; }
        }
      `}</style>

      <div className="bg-black border-2 border-green-500 rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="border-b border-green-500/50 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-[2px] bg-green-500"></div>
            <Terminal className="w-6 h-6 text-green-500" />
            <div className="w-8 h-[2px] bg-green-500"></div>
          </div>

          {isWinner ? (
            <>
              <h2 className="text-3xl font-bold text-green-500 mb-2">
                {isTopWinner ? 'VICTORY ACHIEVED' : `RANK #${userResult.position}`}
              </h2>
              {isTopWinner && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Trophy className="w-12 h-12 text-yellow-400" style={{ animation: 'glow 2s infinite' }} />
                </div>
              )}
              <p className="text-white">
                {isTopWinner 
                  ? 'Battle system dominated successfully' 
                  : `Position secured in battle sequence`
                }
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-red-500 mb-2">BATTLE ENDED</h2>
              <p className="text-white">Try Again</p>
            </>
          )}
        </div>

        {/* Leaderboard */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-green-500" />
            <h3 className="text-xl font-bold text-green-500">RANKINGS</h3>
          </div>

          <div className="space-y-3">
            {displayedWinners.length === 0 ? (
              <div className="bg-gray-900 border border-red-500/50 rounded p-4 text-center">
                <p className="text-red-400">No results available</p>
              </div>
            ) : (
              displayedWinners.map((result, index) => (
                <div
                  key={index}
                  className={`bg-gray-900 border rounded p-4 transition-colors ${
                    result.username === currentUser 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-green-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPositionIcon(result.position)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">
                            {result.username}
                          </span>
                          {result.username === currentUser && (
                            <span className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-xs">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">
                          {new Date(result.completion_time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-500">
                        #{result.position}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-green-500/50 p-6 text-center">
          <button
            onClick={onClose}
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-6 rounded transition-colors flex items-center gap-2 mx-auto"
          >
            <Terminal className="w-5 h-5" />
            NEW BATTLE
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleResultModal;