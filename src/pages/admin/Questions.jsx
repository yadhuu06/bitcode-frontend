import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import CustomButton from '../../components/ui/CustomButton';
import { toast } from 'react-toastify';
import { fetchQuestions } from '../../services/ProblemService';
import { FileText, CheckCircle, Edit, Code, BookOpen, X } from 'lucide-react';

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

  const handleBackgroundClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  }, [closeModal]);

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
              title="Test Cases"
            >
              <Code className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Test Cases</span>
            </button>
            <button
              onClick={(e) => handleComingSoon('Examples', e)}
              className="flex items-center px-3 py-1 bg-gray-800 text-[#73E600] rounded hover:bg-gray-700 transition-all duration-300 text-xs font-medium"
              title="Examples"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">answers</span>
            </button>
            <button
              onClick={(e) => handleEdit(question.question_id, e)}
              className="flex items-center px-3 py-1 bg-gray-800 text-[#73E600] rounded hover:bg-gray-700 transition-all duration-300 text-xs font-medium"
              title="Edit"
            >
              <Edit className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>
        </div>
      </div>
    ));
  }, [questions, openModal, handleComingSoon, handleEdit, handleTestCases]);

  return (
    <div className="min-h-screen text-white">
<header className="mb-8 px-4 md:px-6">
  <h1 className="text-3xl font-bold border-b-2 border-[#73E600] pb-2 mb-4">
    Questions
  </h1>
  <div className="flex justify-end">
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
  </div>
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
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={handleBackgroundClick}
          role="dialog"
          aria-labelledby="question-modal-title"
          aria-modal="true"
        >
          <div className="relative bg-black p-6 md:p-8 rounded-xl border-[1.5px] border-[#73E600] w-full h-full max-w-[95vw] max-h-[95vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#73E600] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 id="question-modal-title" className="text-2xl font-bold text-[#73E600] mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              {selectedQuestion.title}
            </h2>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Question ID:</span>
                  <span className="text-white font-mono ml-2 truncate">{selectedQuestion.question_id}</span>
                </div>
                <div>
                  <span className="text-gray-400">Slug:</span>
                  <span className="text-white ml-2 truncate">{selectedQuestion.slug}</span>
                </div>
                <div>
                  <span className="text-gray-400">Difficulty:</span>
                  <span
                    className={`ml-2 capitalize ${
                      selectedQuestion.difficulty === 'EASY' ? 'text-green-400' :
                      selectedQuestion.difficulty === 'MEDIUM' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}
                  >
                    {selectedQuestion.difficulty}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Tag:</span>
                  <span className="ml-2 text-blue-400">{selectedQuestion.tags}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`ml-2 ${
                      selectedQuestion.is_validate ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {selectedQuestion.is_validate ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Created By:</span>
                  <span className="text-white ml-2 truncate">{selectedQuestion.created_by || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Created At:</span>
                  <span className="text-white ml-2">{new Date(selectedQuestion.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Updated At:</span>
                  <span className="text-white ml-2">{new Date(selectedQuestion.updated_at).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#73E600] mb-3">Description</h3>
                <div className="bg-gray-800/50 p-4 rounded-lg prose prose-invert max-w-none text-gray-300">
                  <ReactMarkdown>{selectedQuestion.description}</ReactMarkdown>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={(e) => handleTestCases(selectedQuestion.question_id, e)}
                className="flex items-center px-4 py-2 bg-gray-800 text-[#73E600] rounded hover:bg-gray-700 transition-all duration-300 font-medium"
                title="Test Cases"
              >
                <Code className="w-5 h-5 mr-2" />
                Test Cases
              </button>
              <button
                onClick={(e) => handleEdit(selectedQuestion.question_id, e)}
                className="flex items-center px-4 py-2 bg-gray-800 text-[#73E600] rounded hover:bg-gray-700 transition-all duration-300 font-medium"
                title="Edit"
              >
                <Edit className="w-5 h-5 mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;