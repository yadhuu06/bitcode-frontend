import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileText, X, CheckCircle, ChevronDown, ChevronUp, Play, Check, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchQuestionById } from '../../services/ProblemService';
import { verifyAnswer, fetchSolvedCodes } from '../../services/VerificationService';
import CodeEditor from '../../components/ui/CodeEditor';

const AnswerVerification = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [customInput, setCustomInput] = useState('');
  const [compilerOutput, setCompilerOutput] = useState(null);
  const [loadingRun, setLoadingRun] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [error, setError] = useState(null);
  const [isQuestionCollapsed, setIsQuestionCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [solvedCodes, setSolvedCodes] = useState({});

  const languageMap = {
    javascript: 63,
    python: 71,
    java: 62,
    cpp: 54,
  };

  const fetchQuestionAndTestCases = useCallback(async () => {
    try {
      setLoadingVerify(true);
      const questionData = await fetchQuestionById(questionId);
      setQuestion(questionData);
      setTestCases(questionData.test_cases || []);
      
      const solvedResponse = await fetchSolvedCodes(questionId);
      const codes = solvedResponse.solved_codes || {};
      setSolvedCodes(codes);
      setCode(codes[language]?.solution_code || '');
      setError(null);
    } catch (err) {
      const errorMessage = JSON.parse(err.message || JSON.stringify({ error: 'Failed to load question or test cases' }));
      setError(errorMessage.error || 'Failed to load question or test cases');
      toast.error(errorMessage.error || 'Failed to load question or test cases');
    } finally {
      setLoadingVerify(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchQuestionAndTestCases();
  }, [fetchQuestionAndTestCases]);

  const handleClose = useCallback(() => {
    navigate('/admin/questions');
  }, [navigate]);

  const handleRunCode = useCallback(async () => {
    if (!code || !language) {
      toast.error('Please provide code and select a language');
      return;
    }

    if (!languageMap[language]) {
      toast.error('Unsupported language');
      return;
    }

    setLoadingRun(true);
    try {
      const response = await verifyAnswer(questionId, code, language);
      setCompilerOutput({
        stdout: response.results[0]?.actual || '',
        stderr: response.results[0]?.error || '',
        status: response.results[0]?.passed ? 'Passed' : 'Failed',
      });
      setActiveTab('compiler');
      setError(null);
      toast.success('Code executed successfully');
    } catch (err) {
      const errorMessage = err.message || 'Failed to execute code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingRun(false);
    }
  }, [code, language, questionId]);

  const handleVerifyCode = useCallback(async () => {
    if (!code || !language) {
      toast.error('Please provide code and select a language');
      return;
    }

    setLoadingVerify(true);
    try {
      const response = await verifyAnswer(questionId, code, language);
      setTestResults(response.results);
      if (response.all_passed) {
        toast.success('All test cases passed! Question verified.');
        setQuestion((prev) => ({
          ...prev,
          is_validate: true,
          solved_codes: [{ language, solution_code: response.solved_code?.solution_code || code }],
        }));
        setSolvedCodes((prev) => ({
          ...prev,
          [language]: response.solved_code || { solution_code: code }
        }));
      } else {
        toast.error('Some test cases failed.');
      }
      setActiveTab('results');
      setError(null);
    } catch (err) {
      const errorMessage = err.message || 'Failed to verify answer';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingVerify(false);
    }
  }, [questionId, code, language]);

  const toggleQuestionCollapse = () => {
    setIsQuestionCollapsed(!isQuestionCollapsed);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setCode(solvedCodes[newLanguage]?.solution_code || '');
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

      {loadingVerify && (
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
                        <span className="text-white font-mono ml-2 truncate">{question.question_id.slice(-10) || 'N/A'}</span>
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
                                  Test Case {index + 1}: {result.passed ? 'Passed' : `Failed`}
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
                      <p className="text-gray-400">Verify the sample answer to see test case results.</p>
                    ) : (
                      <p className="text-gray-400">No test cases available for this question.</p>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-[#73E600] mb-2">Previously Solved Code</h3>
                      {solvedCodes[language] ? (
                        <div className="bg-gray-800/50 p-2 rounded-lg text-sm">
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-[#73E600]" />
                            <span className="text-white capitalize">{language || 'Unknown'}</span>
                          </div>
                          <pre className="mt-2 text-gray-300 font-mono text-xs">
                            {solvedCodes[language].solution_code}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-gray-400">No code for {language}</p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
          <div className="lg:w-[65%] flex flex-col gap-6 flex-1">
            <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-800 flex-1 flex flex-col">
<div className="flex justify-between items-center mb-4">
  <h3 className="text-lg font-semibold text-[#73E600]">Sample Answer</h3>
  <div className="flex items-center gap-4">
    <select
      value={language}
      onChange={handleLanguageChange}
      className="bg-gray-800 text-white rounded px-3 py-2 text-sm focus:outline-none"
    >
      <option value="javascript">JavaScript</option>
      <option value="python">Python</option>
      <option value="java">Java</option>
      <option value="cpp">C++</option>
    </select>

    <button
      onClick={handleVerifyCode}
      disabled={loadingVerify || testCases.length === 0}
      className={`group relative flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition
        ${
          loadingVerify || testCases.length === 0
            ? 'bg-transparent border border-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-[#18181B] border-[#2D2D2D] text-gray-300 hover:text-[#73E600] hover:border-[#73E600]'
        }`}
      aria-label="Verify Code"
    >
      <Check className="w-5 h-5" />
      <span>Verify</span>
      <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
        Verify code
      </span>
    </button>
  </div>
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