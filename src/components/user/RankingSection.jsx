import { useEffect, useState } from 'react';
import api from '../../api';

const RankingSection = () => {
  const [rankings, setRankings] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [userPoints, setUserPoints] = useState('--');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await api.get('/battle/global-rankings'); // ✅ should be GET
        const data = res.data;
        setRankings(data);

        const currentUsername = localStorage.getItem('username');
        const currentUser = data.find(r => r.username === currentUsername);

        if (currentUser) {
          setUserRank(currentUser.rank);
          setUserPoints(currentUser.points);
        } else {
          setUserRank('Unranked');
        }
      } catch (err) {
        console.error("Error fetching rankings:", err);
      }
    };

    fetchRankings();
  }, []);

  return (
    <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl max-w-xl mx-auto">
      <h2 className="text-2xl font-bold font-mono text-green-500 mb-4">Ranking</h2>

      <div className="space-y-4 text-white font-mono text-sm">
        <div className="flex justify-between">
          <span>Global Rank</span>
          <span>#{userRank}</span>
        </div>
        <div className="flex justify-between">
          <span>Points</span>
          <span>{userPoints}</span>
        </div>

        <div className="mt-4">
          <h3 className="text-green-500 mb-2 font-semibold">Top 100 Leaderboard</h3>
          <ul className="max-h-72 overflow-y-auto space-y-1 text-sm border-t border-gray-600 pt-2 pr-2 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-transparent">
            {rankings.map((item) => (
              <li key={item.username} className={`flex justify-between px-2 py-1 rounded ${item.username === localStorage.getItem('username') ? 'bg-green-800 bg-opacity-30' : ''}`}>
                <span>#{item.rank} {item.username}</span>
                <span>{item.points} pts</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RankingSection;
