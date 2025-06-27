import { Trophy } from 'lucide-react';

const BattleLeaderboard = ({ battleResults }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-green-500 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        Leaderboard ({battleResults.length} submission{battleResults.length !== 1 ? 's' : ''})
      </h3>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-gray-900">
        {battleResults.length === 0 ? (
          <p className="text-sm text-gray-400">No participants have completed yet.</p>
        ) : (
          battleResults
            .sort((a, b) => a.position - b.position)
            .map((result, index) => (
              <div key={index} className="bg-gray-950 p-3 rounded-lg text-sm border border-green-500/50">
                <p className="flex items-center gap-2">
                  <Trophy className={`w-4 h-4 ${result.position <= 3 ? 'text-yellow-400' : 'text-gray-400'}`} />
                  <span className="text-white">{result.username}</span>
                  <span className="text-green-500">#{result.position}</span>
                </p>
                <p className="text-gray-400">Completed: {new Date(result.completion_time).toLocaleTimeString()}</p>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default BattleLeaderboard;