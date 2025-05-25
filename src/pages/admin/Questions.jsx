import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import CustomButton from '../../components/ui/CustomButton';
import { toast } from 'react-toastify';
import { fetchQuestions } from '../../services/ProblemService';
import { FileText, Code, BookOpen, CheckCircle, Edit } from 'lucide-react';

const Questions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  const fetchQuestionsList = useCallback(async () => {
    try {
      const response = await fetchQuestions();
      console.log("Questions:", response);
      setQuestions(response.questions || []);
      setError(null);
    } catch (err) {
      const errorMessage = err.response
        ? `Server error: ${err.response.status} - ${err.response.data?.detail || err.message}`
        : `Network error: ${err.message}`;
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchQuestionsList();
  }, [fetchQuestionsList]);

  const handleComingSoon = useCallback((feature, e) => {
    e.stopPropagation(); // Prevent card click when clicking buttons
    toast.info(`${feature} feature coming soon!`);
  }, []);

  const handleEdit = useCallback((questionId, e) => {
    e.stopPropagation(); // Prevent card click when clicking the edit button
    toast.info(`Editing question ${questionId} - Coming soon!`);
  }, []);

  const toggleCard = useCallback((questionId, e) => {
    // Prevent toggle if clicking on buttons or their children
    if (e.target.closest('button')) return;
    setExpandedCard((prev) => (prev === questionId ? null : questionId));
  }, []);

  const questionList = useMemo(() => {
    return questions.map((question) => {
      const isExpanded = expandedCard === question.question_id;
      return (
        <div
          key={question.question_id}
          onClick={(e) => toggleCard(question.question_id, e)}
          className="relative bg-gray-900/80 p-4 md:p-6 rounded-lg border border-gray-800 hover:border-[#73E600] transition-all duration-300 cursor-pointer hover:shadow-[0_0_15px_rgba(115,230,0,0.3)] transform hover:-translate-y-1"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleCard(question.question_id, e)}
          aria-label={`Toggle details for ${question.title}`}
        >
          {/* Verified Label (Top Right) */}
          <span
            className={`absolute top-5 right-5 px-2 py-1 rounded text-xs font-medium ${
              question.is_validated
                ? 'bg-green-900/50 text-green-400 border border-green-500/50'
                : 'bg-red-900/50 text-red-400 border border-red-500/50'
            }`}
          >
            {question.is_validated ? 'Verified' : 'Not Verified'}
          </span>

          {/* Compact View (Always Visible) */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg md:text-xl font-semibold text-white truncate">{question.title}</h3>
           
          </div>

          <div className="flex gap-2 mb-3">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                question.difficulty === 'EASY'
                  ? 'bg-green-900/50 text-green-400 border border-green-500/50'
                  : question.difficulty === 'MEDIUM'
                  ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/50'
                  : 'bg-red-900/50 text-red-400 border border-red-500/50'
              }`}
            >
              {question.difficulty}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900/50 text-blue-400 border border-blue-500/50">
              {question.tags}
            </span>
          </div>

          {/* Expanded View (Toggled) */}
          {isExpanded && (
            <div className="space-y-2 text-sm">
              <p className="flex items-center text-gray-400">
                <span className="text-white mr-2">ID:</span>
                <span className="font-mono text-[#73E600] break-all">{question.question_id}</span>
              </p>
              <p className="flex items-center text-gray-400">
                <span className="text-white mr-2">Created By:</span>
                {question.created_by}
              </p>
              <p className="flex items-center text-gray-400">
                <span className="text-white mr-2">Created At:</span>
                {new Date(question.created_at).toLocaleDateString()}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={(e) => handleComingSoon('Test Cases', e)}
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
          )}
        </div>
      );
    });
  }, [questions, expandedCard, handleComingSoon, handleEdit, toggleCard]);

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2 border-b-2 border-[#73E600] pb-2">
          <FileText className="w-8 h-8" />
          Questions
        </h1>
        <CustomButton variant="create" onClick={() => navigate('/admin/questions/add')}>
          Create Question
        </CustomButton>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-400 rounded-lg flex items-center">
          <span className="w-5 h-5 mr-2">⚠️</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.length > 0 ? questionList : (
          <p className="col-span-full text-center text-gray-500 text-lg">
            No questions found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Questions;