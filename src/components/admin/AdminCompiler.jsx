import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Editor from '@monaco-editor/react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { Play, CheckCircle, XCircle } from 'lucide-react';
import { fetchTestCases } from '../../services/ProblemService';
import { verifyAnswer, fetchSolvedCodes } from '../../services/VerificationService';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import CustomButton from '../ui/CustomButton';
import LoadingIndicator from '../ui/LoadingIndicator';

const AdminCompiler = ({ questionId }) => {
  const { questionId: paramQuestionId } = useParams();
  const effectiveQuestionId = questionId || paramQuestionId;
  const [code, setCode] = React.useState('');
  const [language, setLanguage] = React.useState('javascript');
  const [testCases, setTestCases] = React.useState([]);
  const [results, setResults] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [solvedCodes, setSolvedCodes] = React.useState({});

  // Access global loading state
  const { isLoading } = useSelector((state) => state.loading);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch(setLoading({ isLoading: true, message: 'Loading test cases and solved codes...' }));
        const testCaseResponse = await fetchTestCases(effectiveQuestionId);
        setTestCases(testCaseResponse.test_cases || []);

        const solvedResponse = await fetchSolvedCodes(effectiveQuestionId);
        const codes = solvedResponse.solved_codes || {};
        setSolvedCodes(codes);
        setCode(codes[language]?.solution_code || '');
        setError(null);
      } catch (err) {
        const errorMessage = JSON.parse(err.message || JSON.stringify({ error: 'Failed to fetch data' }));
        setError(errorMessage.error || 'Failed to load test cases or solved codes');
        toast.error(errorMessage.error || 'Failed to load data');
      } finally {
        dispatch(resetLoading());
      }
    };
    loadData();
  }, [effectiveQuestionId, dispatch]);

  const handleRunCode = useCallback(async () => {
    dispatch(setLoading({ isLoading: true, message: 'Running code...' }));
    setError(null);
    setResults([]);

    try {
      const response = await verifyAnswer(effectiveQuestionId, code || '// Write your solution here\n', language);
      setResults(response.results || []);
      const allPassed = response.all_passed;
      toast.success(allPassed ? 'All test cases passed!' : 'Some test cases failed.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to execute code');
      toast.error('Code execution failed');
    } finally {
      dispatch(resetLoading());
    }
  }, [code, language, effectiveQuestionId, dispatch]);

  const handleVerifyCode = useCallback(async () => {
    dispatch(setLoading({ isLoading: true, message: 'Verifying and saving code...' }));
    setError(null);
    setResults([]);

    try {
      const response = await verifyAnswer(effectiveQuestionId, code || '// Write your solution here\n', language);
      setResults(response.results || []);
      const allPassed = response.all_passed;

      if (allPassed) {
        toast.success('All test cases passed! Solution saved.');
        setSolvedCodes((prev) => ({
          ...prev,
          [language]: response.solved_code || { solution_code: code },
        }));
        setCode(response.solved_code?.solution_code || code);
      } else {
        toast.error('Some test cases failed.');
      }
    } catch (err) {
      // Enhanced error handling to capture all cases
      const errorMessage = err.response?.data?.error || err.message || 'Failed to verify code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      dispatch(resetLoading());
    }
  }, [code, language, effectiveQuestionId, dispatch]);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setCode(solvedCodes[newLanguage]?.solution_code || '');
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  return (
    <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-800">
      <h2 className="text-2xl font-bold text-[#73E600] mb-4">Admin Code Verification</h2>

      {isLoading && <LoadingIndicator />}
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

      <div className="flex gap-4">
        <CustomButton
          variant="create"
          onClick={handleRunCode}
          disabled={isLoading || testCases.length === 0}
        >
          <Play className="w-4 h-4 mr-2" />
          Run Code
        </CustomButton>
        <CustomButton
          variant="create"
          onClick={handleVerifyCode}
          disabled={isLoading || testCases.length === 0}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Verify & Save
        </CustomButton>
      </div>

      {results.length > 0 && (
        <div className="bg-gray-800/50 p-4 rounded-lg mt-4">
          <h3 className="text-lg font-semibold text-[#73E600] mb-2">Test Case Results</h3>
          <ul className="space-y-2">
            {results.map((result, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
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

      <div className="bg-gray-800/50 p-4 rounded-lg mt-4">
        <h3 className="text-lg font-semibold text-[#73E600] mb-2">Current Solved Code for {language}</h3>
        {solvedCodes[language] ? (
          <pre className="text-gray-300 font-mono text-sm">{solvedCodes[language].solution_code}</pre>
        ) : (
          <p className="text-gray-400">No code for {language}</p>
        )}
      </div>
    </div>
  );
};

AdminCompiler.propTypes = {
  questionId: PropTypes.string,
};

export default AdminCompiler;