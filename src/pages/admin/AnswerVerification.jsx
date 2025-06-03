import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileText, X, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchQuestionById, fetchTestCases } from '../../services/ProblemService';
import AdminCompiler from '../../components/admin/AdminCompiler';
import CustomButton from '../../components/ui/CustomButton';

const AnswerVerification = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testCasesPassed, setTestCasesPassed] = useState(false); // Placeholder for test case status

  const fetchQuestionAndTestCases = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch question details
      const questionData = await fetchQuestionById(questionId);
      setQuestion(questionData);

      // Fetch test cases
      const testCaseData = await fetchTestCases(questionId);
      setTestCases(testCaseData.test_cases || []);
      setError(null);
    } catch (err) {
      const errorMessage = JSON.parse(err.message);
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
    // Placeholder for verification logic
    toast.info('Verification feature coming soon!');
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 md:p-6">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold border-b-2 border-[#73E600] pb-2">
          Verify Sample Answer
        </h1>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-[#73E600] transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {loading && <div className="text-center text-gray-400">Loading question...</div>}

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-400 rounded-lg flex items-center">
          <span className="w-5 h-5 mr-2">⚠️</span>
          {error}
        </div>
      )}

      {question && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section: Question Details */}
          <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-[#73E600]" />
              <h2 className="text-2xl font-bold text-[#73E600]">{question.title}</h2>
              <CheckCircle
                className={`w-5 h-5 ml-2 ${
                  question.is_validate ? 'text-green-400' : 'text-red-400'
                }`}
                aria-label={question.is_validate ? 'Verified' : 'Not Verified'}
              />
            </div>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Question ID:</span>
                  <span className="text-white font-mono ml-2 truncate">{question.question_id}</span>
                </div>
                <div>
                  <span className="text-gray-400">Slug:</span>
                  <span className="text-white ml-2 truncate">{question.slug}</span>
                </div>
                <div>
                  <span className="text-gray-400">Difficulty:</span>
                  <span
                    className={`ml-2 capitalize ${
                      question.difficulty === 'EASY'
                        ? 'text-green-400'
                        : question.difficulty === 'MEDIUM'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {question.difficulty}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Tag:</span>
                  <span className="ml-2 text-blue-400">{question.tags}</span>
                </div>
                <div>
                  <span className="text-gray-400">Created By:</span>
                  <span className="text-white ml-2 truncate">{question.created_by || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Created At:</span>
                  <span className="text-white ml-2">{new Date(question.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#73E600] mb-3">Description</h3>
                <div className="bg-gray-800/50 p-4 rounded-lg prose prose-invert max-w-none text-gray-300">
                  <ReactMarkdown>{question.description}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Compiler and Test Case Results */}
          <div className="space-y-6">
            <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-800">
              <h3 className="text-lg font-semibold text-[#73E600] mb-4">Sample Answer</h3>
              <AdminCompiler questionId={questionId} testCases={testCases} onTestCasesRun={(passed) => setTestCasesPassed(passed)} />
            </div>
            <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-800">
              <h3 className="text-lg font-semibold text-[#73E600] mb-4">Test Case Results</h3>
              {testCases.length > 0 ? (
                <p className="text-gray-400">Run the sample answer to see test case results.</p>
              ) : (
                <p className="text-gray-400">No test cases available for this question.</p>
              )}
              {/* Placeholder for test case result table */}
            </div>
            <div className="flex gap-4">
              <CustomButton
                variant="create"
                onClick={handleVerifyQuestion}
                disabled={question?.is_validate || !testCasesPassed}
              >
                {question?.is_validate ? 'Question Verified' : 'Verify Question'}
              </CustomButton>
              <CustomButton variant="secondary" onClick={handleClose}>
                Back to Questions
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerVerification;