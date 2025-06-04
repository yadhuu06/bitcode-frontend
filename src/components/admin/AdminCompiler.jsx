import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { Play, CheckCircle, XCircle } from 'lucide-react';
import { fetchTestCases } from '../../services/ProblemService';
import axios from 'axios';
import CustomButton from '../ui/CustomButton';
import LoadingIndicator from '../ui/LoadingIndicator';

const AdminCompiler = ({ questionId }) => {
  const { questionId: paramQuestionId } = useParams();
  const effectiveQuestionId = questionId || paramQuestionId;
  const [code, setCode] = useState('// Write your solution here\n');
  const [language, setLanguage] = useState('javascript');
  const [testCases, setTestCases] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch test cases
  useEffect(() => {
    const loadTestCases = async () => {
      try {
        setLoading(true);
        const response = await fetchTestCases(effectiveQuestionId);
        setTestCases(response.test_cases || []);
        setError(null);
      } catch (err) {
        const errorMessage = JSON.parse(err.message);
        setError(errorMessage.error || 'Failed to fetch test cases');
        toast.error('Failed to load test cases');
      } finally {
        setLoading(false);
      }
    };
    loadTestCases();
  }, [effectiveQuestionId]);

  // Handle code execution
  const handleRunCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await axios.post('/api/run', {
        code,
        language,
        testCases,
      });
      setResults(response.data.results || []);
      const allPassed = response.data.results.every((result) => result.passed);
      toast.success(allPassed ? 'All test cases passed!' : 'Some test cases failed.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to execute code');
      toast.error('Code execution failed');
    } finally {
      setLoading(false);
    }
  }, [code, language, testCases]);

  // Handle language change
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  // Handle editor change
  const handleEditorChange = (value) => {
    setCode(value);
  };

  return (
    <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-800">
      <h2 className="text-2xl font-bold text-[#73E600] mb-4">Admin Code Verification</h2>

      {loading && <LoadingIndicator />}
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 text-red-400 rounded-lg flex items-center">
          <span className="w-5 h-5 mr-2">⚠️</span>
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="language" className="text-white mr-2">
          Language:
        </label>
        <select
          id="language"
          value={language}
          onChange={handleLanguageChange}
          className="bg-gray-800 text-white rounded px-2 py-1"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div className="mb-4">
        <Editor
          height="400px"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      <CustomButton
        variant="create"
        onClick={handleRunCode}
        disabled={loading || testCases.length === 0}
       
      >
        <Play className="w-4 h-4 mr-2" />
        Run Code  
      </CustomButton>

      {results.length > 0 && (
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-[#73E600] mb-2">Test Case Results</h3>
          <ul className="space-y-2">
            {results.map((result, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm"
              >
                {result.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-white">
                  Test Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                </span>
                {!result.passed && (
                  <span className="text-red-400">
                    (Expected: {result.expected}, Got: {result.actual})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

AdminCompiler.propTypes = {
  questionId: PropTypes.string,
};

export default AdminCompiler;