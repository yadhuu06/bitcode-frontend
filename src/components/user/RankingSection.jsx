const RankingSection = () => (
  <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl">
    <h2 className="text-lg font-mono text-green-500 mb-4">Ranking</h2>
    <div className="space-y-4 text-white font-mono">
      <div className="flex justify-between">
        <span>Global Rank</span>
        <span>#142</span>
      </div>
      <div className="flex justify-between">
        <span>Regional Rank</span>
        <span>#23</span>
      </div>
      <div className="flex justify-between">
        <span>Points</span>
        <span>1,245</span>
      </div>
      <div className="flex justify-between">
        <span>Level</span>
        <span>Code Warrior (Lv. 5)</span>
      </div>
      <div className="mt-4">
        <h3 className="text-green-500 mb-2">Achievements</h3>
        <ul className="list-disc pl-5">
          <li>Code Master - 50 Problems Solved</li>
          <li>Streak King - 7 Days Active</li>
          <li>Challenge Winner - Code Battle #3</li>
        </ul>
      </div>
    </div>
  </div>
);

export default RankingSection;