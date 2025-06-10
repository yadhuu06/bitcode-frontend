const StatsSection = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
    <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl text-center">
      <h2 className="text-lg font-mono text-green-500 mb-4">Solved Questions</h2>
      <p className="text-5xl font-mono text-white">{stats.solvedQuestions}</p>
    </div>
    <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl text-center">
      <h2 className="text-lg font-mono text-green-500 mb-4">Attempted Days</h2>
      <p className="text-5xl font-mono text-white">{stats.attemptedDays}</p>
    </div>
    <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl text-center">
      <h2 className="text-lg font-mono text-green-500 mb-4">Active Streak</h2>
      <p className="text-5xl font-mono text-white">{stats.activeStreak}</p>
    </div>
    <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl text-center">
      <h2 className="text-lg font-mono text-green-500 mb-4">Last Win</h2>
      <p className="text-3xl font-mono text-white">{stats.lastWin}</p>
    </div>
    <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl col-span-1 sm:col-span-2 lg:col-span-2">
      <h2 className="text-lg font-mono text-green-500 mb-4">Recent History</h2>
      <ul className="list-disc pl-5 text-white font-mono text-base">
        {stats.recentHistory.map((item, index) => (
          <li key={index} className="mb-2">{item}</li>
        ))}
      </ul>
    </div>
  </div>
);

export default StatsSection;