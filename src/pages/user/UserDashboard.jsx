import React, { useState } from 'react';

const Problems = () => {
  // Sample problem data
  const [problems] = useState([
    {
      id: 1,
      title: 'Binary Search Implementation',
      description: 'Implement a binary search algorithm to efficiently find elements in a sorted array.',
      difficulty: 'Easy',
      tags: ['algorithms', 'search', 'array'],
      successRate: '65%',
      status: 'Solved',
    },
    {
      id: 2,
      title: 'Matrix Path Finder',
      description: 'Find the shortest path through a matrix of 1s and 0s, where 0s are walls and 1s are valid paths.',
      difficulty: 'Medium',
      tags: ['algorithms', 'graph', 'bfs'],
      successRate: '47%',
      status: 'Attempted',
    },
    {
      id: 3,
      title: 'Dynamic Programming - Coin Change',
      description: 'Find the minimum number of coins required to make a given amount of change.',
      difficulty: 'Medium',
      tags: ['dynamic programming', 'array'],
      successRate: '38%',
      status: 'Unsolved',
    },
    {
      id: 4,
      title: 'Balanced Binary Tree',
      description: 'Determine if a given binary tree is height-balanced.',
      difficulty: 'Easy',
      tags: ['tree', 'dfs', 'recursion'],
      successRate: '58%',
      status: 'Solved',
    },
    {
      id: 5,
      title: 'LRU Cache Implementation',
      description: 'Design and implement a data structure for Least Recently Used (LRU) cache.',
      difficulty: 'Hard',
      tags: ['design', 'hash table', 'linked list'],
      successRate: '29%',
      status: 'Unsolved',
    },
  ]);

  // State for filters
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProblems = problems.filter((problem) => {
    const matchesDifficulty = !difficultyFilter || problem.difficulty === difficultyFilter;
    const matchesStatus = !statusFilter || problem.status === statusFilter;
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDifficulty && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-24 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-800">
      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto ml-75 mr-75 px-0 py-8">
        {/* Header */}
        <h1 className="text-2xl text-green-500 mb-8">Problems</h1>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <input
            type="text"
            placeholder="Search problems by name, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-2/3 p-3 bg-gray-800/60 border border-transparent rounded text-white placeholder-white focus:border-green-500 focus:outline-none transition-all duration-300"
          />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full md:w-1/4 p-3 bg-gray-800/60 border border-transparent rounded text-white focus:border-green-500 focus:outline-none transition-all duration-300"
          >
            <option value="">Filter by Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Filters and Problem List */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/5 bg-gray-800/60 p-5 rounded-lg border-2 border-green-500 shadow-[0_0_8px_#00ff00]">
            <h2 className="text-lg text-green-500 mb-5">DIFFICULTY</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 hover:text-shadow-[0_0_4px_#00ff00] transition-all duration-300">
                <input
                  type="radio"
                  name="difficulty"
                  value="Easy"
                  checked={difficultyFilter === 'Easy'}
                  onChange={() => setDifficultyFilter('Easy')}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-green-500">Easy</span>
              </label>
              <label className="flex items-center space-x-2 hover:text-shadow-[0_0_4px_#00ff00] transition-all duration-300">
                <input
                  type="radio"
                  name="difficulty"
                  value="Medium"
                  checked={difficultyFilter === 'Medium'}
                  onChange={() => setDifficultyFilter('Medium')}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-yellow-500">Medium</span>
              </label>
              <label className="flex items-center space-x-2 hover:text-shadow-[0_0_4px_#00ff00] transition-all duration-300">
                <input
                  type="radio"
                  name="difficulty"
                  value="Hard"
                  checked={difficultyFilter === 'Hard'}
                  onChange={() => setDifficultyFilter('Hard')}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-red-500">Hard</span>
              </label>
            </div>
            <h2 className="text-lg text-green-500 mt-6 mb-5">STATUS</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 hover:text-shadow-[0_0_4px_#00ff00] transition-all duration-300">
                <input
                  type="radio"
                  name="status"
                  value="Solved"
                  checked={statusFilter === 'Solved'}
                  onChange={() => setStatusFilter('Solved')}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-green-500">Solved</span>
              </label>
              <label className="flex items-center space-x-2 hover:text-shadow-[0_0_4px_#00ff00] transition-all duration-300">
                <input
                  type="radio"
                  name="status"
                  value="Attempted"
                  checked={statusFilter === 'Attempted'}
                  onChange={() => setStatusFilter('Attempted')}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-yellow-500">Attempted</span>
              </label>
              <label className="flex items-center space-x-2 hover:text-shadow-[0_0_4px_#00ff00] transition-all duration-300">
                <input
                  type="radio"
                  name="status"
                  value="Unsolved"
                  checked={statusFilter === 'Unsolved'}
                  onChange={() => setStatusFilter('Unsolved')}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-gray-400">Unsolved</span>
              </label>
            </div>
          </div>

          {/* Problem List */}
          <div className="w-full lg:w-4/5">
            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className="bg-gray-900/80 p-5 mb-6 rounded-lg border-2 border-green-500 hover:border-transparent hover:shadow-[0_0_8px_#00ff00] transition-all duration-300 flex justify-between items-start"
              >
                <div>
                  <h3 className="text-lg font-bold text-white">{problem.title}</h3>
                  <p className="text-gray-400 text-sm">{problem.description}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {problem.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-transparent border border-white text-white text-xs shadow-[0_0_2px_#ffffff]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded ${
                      problem.difficulty === 'Easy' ? 'bg-green-500 text-black' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-500 text-black' :
                      'bg-red-500 text-white'
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                  <p className="text-gray-400 text-sm mt-3">Success Rate: {problem.successRate}</p>
                </div>
              </div>
            ))}
            {filteredProblems.length === 0 && (
              <p className="text-gray-400 text-center">No problems found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Inline CSS for custom styles */}
      <style jsx>{`
        @keyframes glow {
          0% { text-shadow: 0 0 4px #00ff00; }
          50% { text-shadow: 0 0 8px #00ff00; }
          100% { text-shadow: 0 0 4px #00ff00; }
        }
        .glowing-text {
          animation: glow 1.5s ease-in-out infinite;
        }
        .ml-75 {
          margin-left: 75px;
        }
        .mr-75 {
          margin-right: 75px;
        }
      `}</style>
    </div>
  );
};

export default Problems;