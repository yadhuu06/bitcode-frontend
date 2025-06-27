import { Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import BattleLeaderboard from './BattleLeaderboard';

const BattleSidebar = ({ activeTab, setActiveTab, question, testCases, results, allPassed, battleResults, remainingTime }) => {
  return (
    <div className="w-full lg:w-[35%] bg-gray-900 rounded-xl border border-green-500 p-4 sm:p-6 h-[80vh] flex flex-col">
      <div className="flex border-b border-green-500 mb-4">
        {['question', 'results', 'leaderboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-semibold ${
              activeTab === tab ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-green-500'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {remainingTime !== null && remainingTime > 0 && (
        <div className="mb-4 text-sm text-green-500 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Time Remaining: {remainingTime.toFixed(2)} minutes
        </div>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-gray-900">
        {activeTab === 'question' && question ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{question.title}</h2>
            <div className="prose prose-sm prose-invert max-w-none text-gray-200">
              <ReactMarkdown>{question.description || 'No description available'}</ReactMarkdown>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Difficulty</h3>
              <p className="text-sm text-gray-200">{question.difficulty?.toLowerCase() || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Topic</h3>
              <p className="text-sm text-gray-200">{question.tags || 'None'}</p>
            </div>
            {question.examples && question.examples.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold mb-2">Examples</h3>
                {question.examples.map((example, index) => (
                  <div key={index} className="bg-gray-950 p-4 rounded-lg text-sm mb-4 shadow-lg border border-green-500">
                    <p className="text-green-400 font-semibold mb-2">Example {index + 1}</p>
                    <div className="mb-2">
                      <p className="text-gray-400">Input:</p>
                      <div className="bg-black/40 text-white p-2 rounded-md overflow-x-auto">{example.input_example || 'N/A'}</div>
                    </div>
                    <div className="mb-2">
                      <p className="text-gray-400">Output:</p>
                      <div className="bg-black/40 text-white p-2 rounded-md overflow-x-auto">{example.output_example || 'N/A'}</div>
                    </div>
                    {example.explanation && (
                      <div className="mb-2">
                        <p className="text-gray-400">Explanation:</p>
                        <div className="bg-black/40 text-white p-2 rounded-md overflow-x-auto">{example.explanation}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold">Test Cases</h3>
              {testCases.length > 0 ? (
                testCases.map((tc, index) => (
                  <div key={index} className="bg-gray-950 p-3 rounded-lg text-sm mb-2">
                    <p><strong>Test Case {index + 1}</strong></p>
                    <p>Input: {tc.input_data || 'N/A'}</p>
                    <p>Expected Output: {tc.expected_output || 'N/A'}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No test cases available</p>
              )}
            </div>
          </div>
        ) : activeTab === 'question' ? (
          <p className="text-sm text-gray-400">Loading question or no question available</p>
        ) : null}
        {activeTab === 'results' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            {results.length === 0 ? (
              <p className="text-sm text-gray-400">No results yet. Run your code to see the outcome.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-gray-900">
                {results.map((result, index) => (
                  <div key={index} className="bg-gray-950 p-3 rounded-lg text-sm border border-green-500/50">
                    <p className="flex items-center gap-2">
                      <span className={result.passed ? 'text-green-500' : 'text-red-500'}>
                        {result.passed ? '✓ Passed' : '✗ Failed'}
                      </span>
                      <span>Test Case {index + 1}</span>
                    </p>
                    <p>Input: {result.input || 'N/A'}</p>
                    <p>Expected: {result.expected || 'N/A'}</p>
                    <p>Actual: {result.actual || 'N/A'}</p>
                    {result.error && (
                      <p className="text-red-500 p-3 bg-gray-600/90 rounded-md border border-red-500/50 min-h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/50 scrollbar-track-gray-900">
                        Error: {result.error}
                      </p>
                    )}
                  </div>
                ))}
                <p className={`text-sm font-semibold ${allPassed ? 'text-green-500' : 'text-red-500'}`}>
                  {allPassed ? 'All test cases passed!' : 'Some test cases failed.'}
                </p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'leaderboard' && <BattleLeaderboard battleResults={battleResults} />}
      </div>
    </div>
  );
};

export default BattleSidebar;