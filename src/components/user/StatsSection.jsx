const StatsSection = ({ stats }) => {
  console.log("Stats:", stats); // Moved outside return

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
      {/* Total Battles */}
      <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl text-center">
        <h2 className="text-lg font-mono text-green-500 mb-4">Total Battles</h2>
        <p className="text-5xl font-mono text-white">{stats.total_battles || 0}</p>
      </div>

      {/* Total Wins */}
      <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl text-center">
        <h2 className="text-lg font-mono text-green-500 mb-4">Total Wins</h2>
        <p className="text-5xl font-mono text-white">{stats.battles_won || 0}</p>
      </div>

      {/* Motivation Card */}
      <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl text-center">
        <h2 className="text-lg font-mono text-green-500 mb-4">Coding Spirit</h2>
        <p className="text-base text-white">
          Participate in rooms regularly to build consistency and improve your coding game.
        </p>
      </div>

      {/* Ranking Promotion */}
      <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl text-center">
        <h2 className="text-lg font-mono text-green-500 mb-4">Climb the Ranks</h2>
        <p className="text-base text-white">
          Join ranked rooms and push your limits!
        </p>
      </div>

      {/* Footer Message */}
      <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl col-span-1 sm:col-span-2 lg:col-span-2 text-center">
        <p className="text-white font-mono text-xl">
          Ready to prove yourself? Jump into a battle and code your way to the top!
        </p>
      </div>
    </div>
  );
};

export default StatsSection;