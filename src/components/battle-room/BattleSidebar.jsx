import { useState } from 'react';
import { Trophy } from 'lucide-react';
import BattleLeaderboard from './BattleLeaderboard';
import MDEditor from '@uiw/react-md-editor';
const BattleSidebar = ({
  activeTab,
  setActiveTab,
  question = {},
  testCases = [],
  results = [],
  allPassed = false,
  battleResults = [],
  remainingTime = null,
  currentUser = null,
}) => {
  const [tabs] = useState([
    { id: 'description', label: 'Description' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'results', label: 'Results' },
  ]);

  const formatTime = (seconds) => {
    if (seconds === null || seconds <= 0) return '0 min 0 sec';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes} min ${remainingSeconds} sec`;
  };

  return (
    <div className="w-full lg:w-1/3 bg-gray-900 p-4 rounded-lg border border-green-500/50 flex flex-col gap-4">
      {remainingTime !== null && (
        <div className="text-lg font-semibold text-green-500">
          Time Remaining: {formatTime(remainingTime)}
        </div>
      )}
      <div className="flex gap-2 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-green-500'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/50 scrollbar">
        {activeTab === 'description' && (
          <div className="space-y-4">
           <div className="space-y-4">
      {/* Question Title */}
      <h3 className="text-xl font-semibold text-green-500">
        {question?.title || "Question"}
      </h3>

      {/* Question Description (Markdown) */}
      <div data-color-mode="light">Discription:
        <MDEditor.Markdown
          source={question?.description || "No description available."}
          style={{
            backgroundColor: "transparent",
            color: "inherit",
            padding: 0,
          }}
          className="prose max-w-none"
        />
      </div>
    </div>

            <h4 className="text-md font-medium text-green-400 mt-2">Examples:</h4>
            {testCases.length > 0 ? (
              testCases.slice(0, 3).map((tc, index) => (
                <div key={index} className="bg-gray-950 p-3 rounded-lg text-sm border border-green-500/50 mb-2">
                  <p>
                    <span className="text-green-500">Input:</span> {tc.formatted_input || tc.input_data}
                  </p>
                  <p>
                    <span className="text-green-500">Output:</span> {tc.expected_output}
                  </p>
                  {tc.explanation && (
                    <p className="text-gray-400 italic mt-1">{tc.explanation}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No examples available.</p>
            )}
            <h4 className="text-md font-medium text-green-400 mt-2">Test Cases:</h4>
            <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-gray-900">
              {testCases.slice(0, 3).map((tc, index) => (
                <div key={index} className="bg-gray-950 p-3 rounded-lg text-sm border border-green-500/50 mb-2">
                  <p>
                    <span className="text-green-500">Input:</span> {tc.input_data}
                  </p>
                  <p>
                    <span className="text-green-500">Expected Output:</span> {tc.expected_output}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'leaderboard' && (
          <BattleLeaderboard battleResults={battleResults} currentUser={currentUser} />
        )}
        {activeTab === 'results' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-500">Results</h3>
            {results.length === 0 ? (
              <p className="text-sm text-gray-400">No results available. Run your code to see results.</p>
            ) : (
              results.map((result, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-sm border ${
                    result.passed ? 'border-green-600 bg-green-900/30' : 'border-red-600 bg-red-900/30'
                  }`}
                >
                  <p className="font-medium">
                    Test Case {index + 1}:{' '}
                    <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                      {result.passed ? 'Accepted' : 'Wrong Answer'}
                    </span>
                  </p>
                  <p className="text-gray-300">
                    <span className="text-green-500">Input:</span> {result.input}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-green-500">Expected:</span> {result.expected}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-green-500">Output:</span> {result.actual}
                  </p>
                  {result.error && (
                    <p className="text-red-400">
                      <span className="text-red-500">Error:</span> {result.error}
                    </p>
                  )}
                </div>
              ))
            )}
            {results.length > 0 && (
              <p className={`text-sm ${allPassed ? 'text-green-400' : 'text-red-400'}`}>
                {allPassed ? 'All test cases passed.' : 'Some test cases failed.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleSidebar;