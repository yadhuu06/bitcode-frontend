import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CommonQuestionForm from '../../components/common/CommonQuestionForm';
import CodeVerificationForm from '../../components/common/CodeVerificationForm';
import { contributeQuestion } from '../../services/ProblemService';
import { verifyAnswer } from '../../services/VerificationService';
import { ROUTES } from '../../routes/paths';
import { useSelector } from 'react-redux';

const Contribute = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.is_admin || false;
  const [step, setStep] = useState(1);
  const [questionId, setQuestionId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadingForm, setLoadingForm] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loadingVerify, setLoadingVerify] = useState(false);

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

  const initialTestCases = [
    { input_data: '', expected_output: '', is_sample: false, order: 0 },
  ];

  const handleQuestionSubmit = async (formData) => {
    if (!formData.test_cases || formData.test_cases.length === 0) {
      setErrors({ test_cases: 'At least one test case is required' });
      toast.error('Please add at least one test case');
      return;
    }
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
        test_cases: formData.test_cases.map((tc, idx) => ({
          input_data: tc.input_data,
          expected_output: tc.expected_output,
          is_sample: tc.is_sample || false,
          order: idx + 1,
        })),
      });
      setErrors({});
      setQuestionId(response.question_id);
      setStep(2);
      toast.success('Question and test cases submitted! Now submit a solution.');
    } catch (err) {
      const errorMessage = JSON.parse(err.message || '{}');
      setErrors(errorMessage.errors || { general: errorMessage.error || 'Failed to submit question' });
      toast.error(errorMessage.error?.detail || 'Failed to submit question');
    } finally {
      setLoadingForm(false);
    }
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
        toast.success('All test cases passed! Contribution submitted.');
        if (isAdmin) {
          navigate(`${ROUTES.ADMIN_QUESTION_VERIFY}/${questionId}`);
        } else {
          navigate(ROUTES.USER_PROFILE);
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

  const handleCancel = () => {
    navigate(ROUTES.USER_PROFILE);
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          <div className={`flex-1 text-center font-mono ${step === 1 ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 mx-auto rounded-full ${step === 1 ? 'bg-green-500' : 'bg-gray-500'} flex items-center justify-center text-black`}>1</div>
            <p className="mt-2">Question & Test Cases</p>
          </div>
          <div className="flex-1 border-t-2 border-gray-500 mt-4"></div>
          <div className={`flex-1 text-center font-mono ${step === 2 ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 mx-auto rounded-full ${step === 2 ? 'bg-green-500' : 'bg-gray-500'} flex items-center justify-center text-black`}>2</div>
            <p className="mt-2">Solution</p>
          </div>
        </div>

        {/* Content */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-mono text-green-500 mb-6">Contribute New Question</h1>
            <CommonQuestionForm
              initialData={initialData}
              examples={initialExamples}
              testCases={initialTestCases}
              isEditMode={false}
              onSubmit={handleQuestionSubmit}
              onCancel={handleCancel}
              errors={errors}
              loading={loadingForm}
              tags={tags}
              difficultyOptions={difficultyOptions}
            />
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-mono text-green-500 mb-6">Submit Solution</h1>
            <CodeVerificationForm
              questionId={questionId}
              code={code}
              setCode={setCode}
              language={language}
              onLanguageChange={handleLanguageChange}
              testCases={[]}
              onVerifyCode={handleVerifyCode}
              loadingVerify={loadingVerify}
              disabled={false}
            />
            <button
              onClick={handleBack}
              className="mt-4 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-mono py-2 px-4 rounded-lg transition duration-300"
            >
              Back to Question
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Contribute;