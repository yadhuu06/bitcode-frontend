import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../components/ui/CustomButton';
import { toast } from 'react-toastify';
import { fetchQuestions } from '../../services/ProblemService';
import { FileText, Code, BookOpen, CheckCircle, Edit } from 'lucide-react';

const Questions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQuestionsList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchQuestions();
      setQuestions(response.questions || []);
      setError(null);
    } catch (err) {
      const errorMessage = JSON.parse(err.message);
      setError(errorMessage.error || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestionsList();
  }, [fetchQuestionsList]);

  const handleComingSoon = useCallback((feature, e) => {
    e.stopPropagation();
    toast.info(`${feature} feature coming soon!`);
  }, []);

  const handleEdit = useCallback(
    (questionId, e) => {
      e.stopPropagation();
      navigate(`/admin/questions/edit/${questionId}`);
    },
    [navigate]
  );

  const handleTestCases = useCallback(
    (questionId, e) => {
      e.stopPropagation();
      navigate(`/admin/questions/${questionId}/test-cases`);
    },
    [navigate]
  );

  const openModal = useCallback((question) => {
    setSelectedQuestion(question);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedQuestion(null);
  }, []);

  const questionList = useMemo(() => {
    return questions.map((question) => (
      <div
        key={question.question_id}
        onClick={() => openModal(question)}
        className="relative bg-gray-900/80 p-4 md:p-6 rounded-lg border border-gray-800 hover:border-[#73E600] transition-all duration-300 cursor-pointer hover:shadow-[0_0_15px_rgba(115,230,0,0.3)] transform hover:-translate-y-1"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && openModal(question)}
        aria-label={`View details for ${question.title}`}
      >
        <span
          className="absolute top-5 right-5"
          aria-label={question.is_validate ? 'Verified' : 'Not Verified'}
        >
          <CheckCircle
            className={`w-5 h-5 ${question.is_validate ? 'text-green-400' : 'text-red-400'}`}
          />
        </span>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg md:text-xl font-semibold text-white truncate">{question.title}</h3>
        </div>
        <div className="flex gap-2 mb-3">
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              question.difficulty === 'EASY'
                ? 'bg-green-900/50 text-green-400 border border-green-500/50'
                : question.difficulty === 'MEDIUM'
                ? 'bg-yellow-500/50 text-yellow-400 border border-yellow-500/50'
                : 'bg-red-600/50 text-red-400 border border-red-600/50'
            }`}
          >
            {question.difficulty}
          </span>
          <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-900/50 text-blue-400 border border-blue-500/50">
            {question.tags}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <p className="flex items-center text-gray-400">
            <span className="text-white mr-2">ID:</span>
            <span className="font-mono break-all">{question.question_id.slice(-12)}</span>
          </p>
          <p className="flex items-center text-gray-400">
            <span className="text-white mr-2">Created At:</span>
            {new Date(question.created_at).toLocaleDateString()}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={(e) => handleTestCases(question.question_id, e)}
              className="flex items-center px-3 py-1 bg-gray-800 text-[#73E600] rounded hover:bg-gray-700 transition-all duration-300 text-xs font-medium"
            >
              <Code className="w-4 h-4 mr-1" />
              Test Cases
            </button>
            <button
              onClick={(e) => handleComingSoon('Examples', e)}
              className="flex items-center px-3 py-1 bg-gray-800 text-[#73E600] rounded hover:bg-gray-700 transition-all duration-300 text-xs font-medium"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Examples
            </button>
            <button
              onClick={(e) => handleComingSoon('Solutions', e)}
              className="flex items-center px-3 py-1 bg-gray-800 text-[#73E600] rounded hover:bg-gray-700 transition-all duration-300 text-xs font-medium"
            >
              <FileText className="w-4 h-4 mr-1" />
              Solutions
            </button>
            <button
              onClick={(e) => handleComingSoon('Verify', e)}
              className="flex items-center px-3 py-1 bg-gray-800 text-[#73E600] rounded hover:bg-gray-700 transition-all duration-300 text-xs font-medium"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Verify
            </button>
            <button
              onClick={(e) => handleEdit(question.question_id, e)}
              className="flex items-center px-3 py-1 bg-gray-800 text-[#73E600] rounded hover:bg-gray-700 transition-all duration-300 text-xs font-medium"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
          </div>
        </div>
      </div>
    ));
  }, [questions, openModal, handleComingSoon, handleEdit, handleTestCases]);

  return (
    <div className="min-h-screen text-white">
      <header className="mb-8 flex justify-between items-center px-4 md:px-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 border-b-2 border-[#73E600] pb-2">
          <FileText className="w-8 h-8" />
          Questions
        </h1>
        <CustomButton
          variant="create"
          onClick={() => {
            navigate('/admin/questions/add');
            toast.info('Opening new question form...');
          }}
        >
          <span className="hidden sm:inline">Add Question</span>
          <span className="inline sm:hidden">Add Qn</span>
        </CustomButton>
      </header>

      {loading && <div className="text-center text-gray-400">Loading questions...</div>}

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-400 rounded-lg flex items-center mx-4 md:mx-6">
          <span className="w-5 h-5 mr-2">⚠️</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-6">
        {questions.length > 0 ? (
          questionList
        ) : (
          <p className="col-span-full text-center text-gray-500 text-lg">
            No questions found.
          </p>
        )}
      </div>

      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative bg-black p-6 md:p-8 rounded-xl border-[1.5px] border-[#73E600] w-full max-w-3xl transform transition-all duration-300 scale-100 hover:scale-[1.02]">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#73E600] transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-[#73E600]/50 pb-2">
              {selectedQuestion.title}
            </h2>
            <div className="space-y-4 text-sm text-gray-300">
              <p>
                <span className="font-semibold text-white">ID:</span>{' '}
                <span className="font-mono text-[#73E600]">{selectedQuestion.question_id}</span>
              </p>
              <p>
                <span className="font-semibold text-white">Slug:</span>{' '}
                {selectedQuestion.slug}
              </p>
              <p>
                <span className="font-semibold text-white">Description:</span>{' '}
                {selectedQuestion.description}
              </p>
              <p>
                <span className="font-semibold text-white">Difficulty:</span>{' '}
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedQuestion.difficulty === 'EASY'
                      ? 'bg-green-900/50 text-green-400'
                      : selectedQuestion.difficulty === 'MEDIUM'
                      ? 'bg-yellow-500/50 text-yellow-400'
                      : 'bg-red-600/50 text-red-400'
                  }`}
                >
                  {selectedQuestion.difficulty}
                </span>
              </p>
              <p>
                <span className="font-semibold text-white">Tag:</span>{' '}
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900/50 text-blue-400">
                  {selectedQuestion.tags}
                </span>
              </p>
              <p>
                <span className="font-semibold text-white">Status:</span>{' '}
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedQuestion.is_validate
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}
                >
                  {selectedQuestion.is_validate ? 'Verified' : 'Not Verified'}
                </span>
              </p>
              <p>
                <span className="font-semibold text-white">Created By:</span>{' '}
                {selectedQuestion.created_by || 'Unknown'}
              </p>
              <p>
                <span className="font-semibold text-white">Created At:</span>{' '}
                {new Date(selectedQuestion.created_at).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold text-white">Updated At:</span>{' '}
                {new Date(selectedQuestion.updated_at).toLocaleString()}
              </p>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Examples</h3>
                {selectedQuestion.examples?.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedQuestion.examples.map((example) => (
                      <li key={example.id} className="bg-gray-800/50 p-4 rounded-lg">
                        <p><span className="font-semibold">Input:</span> {example.input_example}</p>
                        <p><span className="font-semibold">Output:</span> {example.output_example}</p>
                        {example.explanation && (
                          <p><span className="font-semibold">Explanation:</span> {example.explanation}</p>
                        )}
                        <p><span className="font-semibold">Order:</span> {example.order}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No examples available.</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Test Cases</h3>
                {selectedQuestion.test_cases?.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedQuestion.test_cases.map((testCase) => (
                      <li key={testCase.id} className="bg-gray-800/50 p-4 rounded-lg">
                        <p><span className="font-semibold">Input:</span> {testCase.input_data}</p>
                        <p><span className="font-semibold">Expected Output:</span> {testCase.expected_output}</p>
                        <p>
                          <span className="font-semibold">Sample:</span>{' '}
                          {testCase.is_sample ? 'Yes' : 'No'}
                        </p>
                        <p><span className="font-semibold">Order:</span> {testCase.order}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No test cases available.</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Solutions</h3>
                {selectedQuestion.solved_codes?.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedQuestion.solved_codes.map((solution) => (
                      <li key={solution.id} className="bg-gray-800/50 p-4 rounded-lg">
                        <p><span className="font-semibold">Language:</span> {solution.language}</p>
                        <pre className="bg-gray-900 p-2 rounded text-xs text-white whitespace-pre-wrap">
                          {solution.solution_code}
                        </pre>
                        <p>
                          <span className="font-semibold">Created At:</span>{' '}
                          {new Date(solution.created_at).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No solutions available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;