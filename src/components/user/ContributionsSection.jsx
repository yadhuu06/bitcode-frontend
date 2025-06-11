import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CommonQuestionForm from '../common/CommonQuestionForm';
import CodeVerificationForm from '../common/CodeVerificationForm';
import { contributeQuestion } from '../../services/ProblemService';
import { verifyAnswer } from '../../services/VerificationService';

const ContributionsSection = ({ isAdmin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [questionId, setQuestionId] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingForm, setLoadingForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tags = [
    { value: 'ARRAY', label: 'Array' },
    { value: 'STRING', label: 'String' },
    { value: 'DSA', label: 'Dsa' },
  ];

  const difficultyOptions = [
    { value: 'EASY', label: 'Easy', color: 'green-400' },
    { value: 'MEDIUM', label: 'Medium', color: 'yellow-400' },
    { value: 'HARD', label: 'Hard', color: 'red-400' },
  ];

  const initialData = {
    title: '',
    description: '',
    difficulty: 'EASY',
    tags: 'ARRAY',
  };

  const initialExamples = [
    { input_example: '', output_example: '', explanation: '', order: 0 },
  ];

  const handleQuestionSubmit = async (formData) => {
    setLoadingForm(true);
    try {
      const response = await contributeQuestion({
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: formData.tags,
        examples: formData.examples.map((ex, idx) => ({
          input_example: ex.input_example,
          output_example: ex.output_example,
          explanation: ex.explanation || null,
          order: idx + 1,
        })),
        test_cases: [], // Test cases handled in Step 2
      });
      setQuestionId(response.question_id);
      setTestCases([]);
      setStep(2);
      setIsModalOpen(false);
      toast.success('Question submitted as a contribution! Now submit a solution.');
      setErrors({});
    } catch (err) {
      const errorMessage = JSON.parse(err.message || '{}');
      setErrors(errorMessage.errors || { general: errorMessage.error || 'Failed to submit question' });
      toast.error(errorMessage.error?.detail || 'Failed to submit question');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleQuestionCancel = () => {
    setIsModalOpen(false);
    navigate('/profile');
  };

  const handleVerifyCode = async () => {
    if (!code || !language) {
      toast.error('Please provide code and select a language');
      return;
    }
    setLoadingVerify(true);
    try {
      const response = await verifyAnswer(questionId, code, language);
      if (response.all_passed) {
        toast.success('All test cases passed! Solution submitted as a contribution.');
        if (isAdmin) {
          navigate(`/admin/answer-verification/${questionId}`);
        } else {
          navigate('/profile');
        }
      } else {
        toast.error('Some test cases failed.');
      }
    } catch (err) {
      const errorMessage = JSON.parse(err.message || '{}');
      toast.error(errorMessage.error?.detail || 'Failed to verify code');
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setCode('');
  };

  return (
    <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl">
      <h2 className="text-lg font-mono text-green-500 mb-4">Contributions</h2>
      {step === 1 && (
        <div className="space-y-4 text-white font-mono">
          <div className="flex justify-between">
            <span>Problems Submitted</span>
            <span>3</span>
          </div>
          <div className="flex justify-between">
            <span>Solutions Accepted</span>
            <span>28</span>
          </div>
          <div className="flex justify-between">
            <span>Forum Posts</span>
            <span>12</span>
          </div>
          <div className="mt-4">
            <h3 className="text-green-500 mb-2">Recent Contributions</h3>
            <ul className="list-disc pl-5">
              <li>Submitted "Reverse Linked List" - 2025-06-01</li>
              <li>Answered "How to optimize BFS?" - 2025-06-03</li>
              <li>Solution accepted for "Matrix Spiral" - 2025-06-07</li>
            </ul>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-green-500 text-black font-mono py-2 px-4 rounded-lg hover:bg-green-400 transition duration-300"
          >
            Contribute New Question
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4 text-white font-mono">
          <h3 className="text-green-500 mb-2">Submit Solution</h3>
          <CodeVerificationForm
            questionId={questionId}
            code={code}
            setCode={setCode}
            language={language}
            onLanguageChange={handleLanguageChange}
            testCases={testCases}
            onVerifyCode={handleVerifyCode}
            loadingVerify={loadingVerify}
            disabled={false}
          />
          <button
            onClick={() => {
              setStep(1);
              setQuestionId(null);
              setTestCases([]);
              setCode('');
              setErrors({});
            }}
            className="border border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Back to Question Submission
          </button>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="w-full h-full">
            <CommonQuestionForm
              initialData={initialData}
              examples={initialExamples}
              isEditMode={false}
              onSubmit={handleQuestionSubmit}
              onCancel={handleQuestionCancel}
              errors={errors}
              loading={loadingForm}
              tags={tags}
              difficultyOptions={difficultyOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributionsSection;