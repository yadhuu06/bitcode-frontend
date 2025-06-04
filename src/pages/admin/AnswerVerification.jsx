import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileText, X, CheckCircle, ChevronDown, ChevronUp, Play, Check, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchQuestionById, fetchTestCases } from '../../services/ProblemService';
import CodeEditor from '../../components/ui/CodeEditor';
import axios from 'axios';

const AnswerVerification = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [code, setCode] = useState('// Write your solution here\n');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isQuestionCollapsed, setIsQuestionCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Language mapping for Judge0
  const languageMap = {
    javascript: { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
    python: { id: 71, name: 'Python (3.8.1)' },
    java: { id: 62, name: 'Java (OpenJDK 13.0.1)' },
    cpp: { id: 54, name: 'C++ (GCC 9.2.0)' },
  };

  const fetchQuestionAndTestCases = useCallback(async () => {
    try {
      setLoading(true);
      const questionData = await fetchQuestionById(questionId);
      setQuestion(questionData);
      setTestCases(questionData.test_cases || []);
      setError(null);
    } catch (err) {
      const errorMessage = JSON.parse(err.message || JSON.stringify({ error: 'Failed to load question or test cases' }));
      setError(errorMessage.error || 'Failed to load question or test cases');
      toast.error(errorMessage.error || 'Failed to load question or test cases');
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchQuestionAndTestCases();
  }, [fetchQuestionAndTestCases]);

  const handleClose = useCallback(() => {
    navigate('/admin/questions');
  }, [navigate]);

  const handleVerifyQuestion = useCallback(() => {
    toast.info('Verification feature coming soon!');
  }, []);

  const handleRunCode = useCallback(async () => {
    if (!testCases.length) {
      setError('No test cases available to run.');
      toast.error('No test cases available to run.');
      return;
    }

    setLoading(true);
    setError(null);
    setTestResults([]);

    try {
      const submissions = testCases.map((testCase) => ({
        source_code: code,
        language_id: languageMap[language].id,
        stdin: testCase.input || '',
        expected_output: testCase.output || '',
      }));

      // Submit to Judge0
      const response = await axios.post(
        'https://judge0-ce.p.rapidapi.com/submissions/batch?base64_encoded=false',
        { submissions },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': 'YOUR_JUDGE0_API_KEY', // Replace with actual API key
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        }
      );

      // Poll for results
      const tokenString = response.data.map((sub) => sub.token).join(',');
      let results = [];
      let completed = false;

      while (!completed) {
        const resultResponse = await axios.get(
          `https://judge0-ce.p.rapidapi.com/submissions/batch?tokens=${tokenString}&base64_encoded=false`,
          {
            headers: {
              'X-RapidAPI-Key': 'YOUR_JUDGE0_API_KEY', // Replace with actual API key
            },
          }
        );

        results = resultResponse.data.submissions.map((result, index) => ({
          passed: result.status.description === 'Accepted',
          expected: testCases[index].output || '',
          actual: result.stdout || '',
          error: result.stderr || result.compile_output || result.message || '',
          status: result.status.description,
        }));

        completed = resultResponse.data.submissions.every(
          (sub) => sub.status.description !== 'In Queue' && sub.status.description !== 'Processing'
        );

        if (!completed) await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setTestResults(results);
      const allPassed = results.every((result) => result.passed);
      toast.success(allPassed ? 'All test cases passed!' : 'Some test cases failed.');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to execute code';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [code, language, testCases]);

  const toggleQuestionCollapse = () => {
    setIsQuestionCollapsed(!isQuestionCollapsed);
  };

  const passedCount = testResults.filter((result) => result.passed).length;
  const totalTests = testResults.length;
  const allTestsPassed = totalTests > 0 && passedCount === totalTests;

  return (
    <div className="min-h-screen bg-[#030712] text-white font-mono p-4 md:p-6 flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold border-b-2 border-[#73E600] pb-2">
          Verify Sample Answer
        </h1>
        <button
          onClick={handleClose}
          className="group relative p-2 text-gray-400 hover:text-[#73E600] transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
          <span className="absolute hidden group-hover:block bg-gray-800 text-xs px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2">
            Close
          </span>
        </button>
      </header>

      {loading && (
        <div className="text-center text-gray-400 py-10">Loading question...</div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-400 rounded-lg flex items-center">
          <span className="w-5 h-5 mr-2">⚠️</span>
          {error}
        </div>
      )}

      {question && (
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Left Side: Description or Results (35%) */}
          <div
            className={`lg:w-[35%] bg-gray-900/80 p-6 rounded-lg border border-gray-800 transition-all duration-300 ${
              isQuestionCollapsed ? 'h-12 overflow-hidden' : 'min-h-[200px]'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#73E600]" />
                <h2 className="text-xl md:text-2xl font-bold text-[#73E600]">
                  {question.title || 'Untitled'}
                </h2>
                <CheckCircle
                  className={`w-5 h-5 ml-2 ${
                    question.is_validate ? 'text-green-400' : 'text-red-400'
                  }`}
                  aria-label={question.is_validate ? 'Verified' : 'Not Verified'}
                />
              </div>
              <button
                onClick={toggleQuestionCollapse}
                className="group relative p-2 text-gray-400 hover:text-[#73E600]"
                aria-label={isQuestionCollapsed ? 'Expand' : 'Collapse'}
              >
                {isQuestionCollapsed ? (
                  <ChevronDown className="w-6 h-6" />
                ) : (
                  <ChevronUp className="w-6 h-6" />
                )}
                <span className="absolute hidden group-hover:block bg-gray-800 text-xs px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2">
                  {isQuestionCollapsed ? 'Expand' : 'Collapse'}
                </span>
              </button>
            </div>
            {!isQuestionCollapsed && (
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      activeTab === 'description'
                        ? 'bg-[#73E600] text-black'
                        : 'bg-gray-800 text-gray-400 hover:text-[#73E600]'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      activeTab === 'results'
                        ? 'bg-[#73E600] text-black'
                        : 'bg-gray-800 text-gray-400 hover:text-[#73E600]'
                    }`}
                  >
                    Results
                  </button>
                </div>
                {activeTab === 'description' && (
                  <div className="space-y-4 text-sm text-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400">Question ID:</span>
                        <span className="text-white font-mono ml-2 truncate">{question.question_id || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Slug:</span>
                        <span className="text-white ml-2 truncate">{question.slug || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Difficulty:</span>
                        <span
                          className={`ml-2 capitalize ${
                            question.difficulty === 'EASY'
                              ? 'text-green-400'
                              : question.difficulty === 'MEDIUM'
                              ? 'text-yellow-400'
                              : question.difficulty === 'HARD'
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {question.difficulty || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tag:</span>
                        <span className="ml-2 text-blue-400">{question.tags || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Created By:</span>
                        <span className="text-white ml-2 truncate">{question.created_by || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Created At:</span>
                        <span className="text-white ml-2">
                          {question.created_at ? new Date(question.created_at).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#73E600] mb-3">Description</h3>
                      <div className="bg-gray-800/50 p-4 rounded-lg prose prose-invert max-w-none text-gray-300">
                        <ReactMarkdown>{question.description || 'No description available.'}</ReactMarkdown>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#73E600] mb-3">Examples</h3>
                      {question.examples && question.examples.length > 0 ? (
                        <ul className="space-y-2 max-h-40 overflow-auto">
                          {question.examples.slice(0, 2).map((example, index) => (
                            <li key={index} className="bg-gray-800/50 p-2 rounded-lg text-sm">
                              <div className="font-semibold text-white">Example {index + 1}</div>
                              <div>
                                <span className="text-gray-400">Input:</span>
                                <pre className="text-white font-mono">{example.input_example || 'N/A'}</pre>
                              </div>
                              <div>
                                <span className="text-gray-400">Output:</span>
                                <pre className="text-white font-mono">{example.output_example || 'N/A'}</pre>
                              </div>
                              {example.explanation && (
                                <div>
                                  <span className="text-gray-400">Explanation:</span>
                                  <p className="text-white">{example.explanation}</p>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400">No examples available.</p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#73E600] mb-3">Sample Test Cases</h3>
                      {testCases && testCases.length > 0 ? (
                        <ul className="space-y-2 max-h-40 overflow-auto">
                          {testCases
                            .filter((tc) => tc.is_sample)
                            .slice(0, 3)
                            .map((testCase, index) => (
                              <li key={index} className="bg-gray-800/50 p-2 rounded-lg text-sm">
                                <div className="font-semibold text-white">Test Case {index + 1}</div>
                                <div>
                                  <span className="text-gray-400">Input:</span>
                                  <pre className="text-white font-mono">{testCase.input_data || 'N/A'}</pre>
                                </div>
                                <div>
                                  <span className="text-gray-400">Output:</span>
                                  <pre className="text-white font-mono">{testCase.expected_output || 'N/A'}</pre>
                                </div>
                                {testCase.explanation && (
                                  <div>
                                    <span className="text-gray-400">Explanation:</span>
                                    <p className="text-white">{testCase.explanation}</p>
                                  </div>
                                )}
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400">No sample test cases available.</p>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'results' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#73E600] mb-2">Test Case Results</h3>
                    {testResults.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">
                            {passedCount}/{totalTests} Test Cases Passed
                          </span>
                          {allTestsPassed ? (
                            <span className="text-green-400">Accepted</span>
                          ) : (
                            <span className="text-red-400">Not Accepted</span>
                          )}
                        </div>
                        <ul className="space-y-2 max-h-40 overflow-auto">
                          {testResults.map((result, index) => (
                            <li key={index} className="bg-gray-800/50 p-2 rounded-lg text-sm">
                              <div className="flex items-center gap-2">
                                {result.passed ? (
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                  <X className="w-5 h-5 text-red-400" />
                                )}
                                <span className="text-white">
                                  Test Case {index + 1}: {result.passed ? 'Passed' : `Failed (${result.status})`}
                                </span>
                              </div>
                              {!result.passed && (
                                <div className="mt-1">
                                  <span className="text-gray-400">Expected:</span>
                                  <pre className="text-white font-mono">{result.expected}</pre>
                                  <span className="text-gray-400">Actual:</span>
                                  <pre className="text-white font-mono">{result.actual}</pre>
                                  {result.error && (
                                    <div>
                                      <span className="text-gray-400">Error:</span>
                                      <pre className="text-red-400 font-mono">{result.error}</pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : testCases.length > 0 ? (
                      <p className="text-gray-400">Run the sample answer to see test case results.</p>
                    ) : (
                      <p className="text-gray-400">No test cases available for this question.</p>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-[#73E600] mb-2">Previously Solved Codes</h3>
                      {question.solved_codes && question.solved_codes.length > 0 ? (
                        <ul className="space-y-2 max-h-40 overflow-auto">
                          {question.solved_codes.map((solution, index) => (
                            <li key={index} className="bg-gray-800/50 p-2 rounded-lg text-sm">
                              <div className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-[#73E600]" />
                                <span className="text-white capitalize">{solution.language || 'Unknown'}</span>
                              </div>
                              <pre className="mt-2 text-gray-300 font-mono text-xs">
                                {solution.code || 'No code available'}
                              </pre>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400">No previously solved codes available.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Code Editor (65%) */}
          <div className="lg:w-[65%] flex flex-col gap-6 flex-1">
            <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-800 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#73E600]">Sample Answer</h3>
                              <div className="mt-4 flex gap-4">
                <button
                  onClick={handleRunCode}
                  disabled={loading || testCases.length === 0}
                  className={`group relative p-2 ${
                    loading || testCases.length === 0
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-[#73E600]'
                  } transition-colors`}
                  aria-label="Run Code"
                >
                  <Play className="w-5 h-5" />
                  <span className="absolute hidden group-hover:block bg-gray-800 text-xs px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2">
                    Run Code
                  </span>
                </button>
                <button
                  onClick={handleVerifyQuestion}
                  disabled={question?.is_validate || !allTestsPassed}
                  className={`group relative p-2 ${
                    question?.is_validate || !allTestsPassed
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-[#73E600]'
                  } transition-colors`}
                  aria-label="Verify Question"
                >
                  <Check className="w-5 h-5" />
                  <span className="absolute hidden group-hover:block bg-gray-800 text-xs px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2">
                    {question?.is_validate ? 'Question Verified' : 'Verify Question'}
                  </span>
                </button>
              </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-800 text-white rounded px-2 py-1 text-sm"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div className="flex-1">
                <CodeEditor
                  code={code}
                  setCode={setCode}
                  language={language}
                />
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerVerification;