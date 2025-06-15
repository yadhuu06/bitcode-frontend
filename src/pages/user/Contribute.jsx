import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CommonQuestionForm from '../../components/common/CommonQuestionForm';
import CodeVerificationForm from '../../components/common/CodeVerificationForm';
import { contributeQuestion, contributeTestCases } from '../../services/ProblemService';
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
  const [formData, setFormData] = useState(null); // Store question data
  const [testCasesData, setTestCasesData] = useState(null); // Store test cases data

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

  const handleQuestionSubmit = async (data) => {
    setLoadingForm(true);
    try {
      const response = await contributeQuestion({
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        tags: data.tags,
        examples: data.examples.map((ex, idx) => ({
          input_example: ex.input_example,
          output_example: ex.output_example,
          explanation: ex.explanation || null,
          order: idx + 1,
        })),
      });

      setErrors({});
      setQuestionId(response.question_id);
      setFormData(data); // Store question data
      setStep(2);
      toast.success('Question submitted! Now add test cases.');
    } catch (err) {
      let errorMessage = {};
      if (err.response?.data) {
        errorMessage = err.response.data;
      } else if (typeof err.message === 'string') {
        errorMessage = { error: err.message || 'Failed to submit question' };
      } else {
        errorMessage = { error: 'Failed to submit question' };
      }

      setErrors(errorMessage.errors || { general: errorMessage.error || 'Failed to submit question' });
      toast.error(errorMessage.error?.detail || errorMessage.error || 'Failed to submit question');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleTestCasesSubmit = async (data) => {
    setLoadingForm(true);
    try {
      const response = await contributeTestCases(questionId, {
        test_cases: data.testCases.map((tc, idx) => ({
          input_data: tc.input_data,
          expected_output: tc.expected_output,
          is_sample: tc.is_sample || false,
          order: idx + 1,
        })),
      });

      setErrors({});
      setTestCasesData(data.testCases); // Store test cases data
      setStep(3);
      toast.success('Test cases submitted! Now submit a solution.');
    } catch (err) {
      let errorMessage = {};
      if (err.response?.data) {
        errorMessage = err.response.data;
      } else if (typeof err.message === 'string') {
        errorMessage = { error: err.message || 'Failed to submit test cases' };
      } else {
        errorMessage = { error: 'Failed to submit test cases' };
      }

      setErrors(errorMessage.errors || { general: errorMessage.error || 'Failed to submit test cases' });
      toast.error(errorMessage.error?.detail || errorMessage.error || 'Failed to submit test cases');
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
        toast.success('All test cases passed! Contribution completed.');
        if (isAdmin) {
          navigate(`${ROUTES.ADMIN_QUESTION_VERIFY}/${questionId}`);
        } else {
          navigate(ROUTES.USER_PROFILE);
        }
      } else {
        toast.error('Some test cases failed.');
      }
    } catch (err) {
      const errorMessage = err.response?.data || { error: 'Failed to verify code' };
      toast.error(errorMessage.error?.detail || errorMessage.error || 'Failed to verify code');
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
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          <div className={`flex-1 text-center font-mono ${step === 1 ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 mx-auto rounded-full ${step === 1 ? 'bg-green-500' : 'bg-gray-500'} flex items-center justify-center text-black`}>1</div>
            <p className="mt-2">Question</p>
          </div>
          <div className="flex-1 border-t-2 border-gray-500 mt-4"></div>
          <div className={`flex-1 text-center font-mono ${step === 2 ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 mx-auto rounded-full ${step === 2 ? 'bg-green-500' : 'bg-gray-500'} flex items-center justify-center text-black`}>2</div>
            <p className="mt-2">Test Cases</p>
          </div>
          <div className="flex-1 border-t-2 border-gray-500 mt-4"></div>
          <div className={`flex-1 text-center font-mono ${step === 3 ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 mx-auto rounded-full ${step === 3 ? 'bg-green-500' : 'bg-gray-500'} flex items-center justify-center text-black`}>3</div>
            <p className="mt-2">Solution</p>
          </div>
        </div>

        {/* Content */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-mono text-green-500 mb-6">Contribute New Question</h1>
            <CommonQuestionForm
              initialData={formData || initialData}
              examples={formData?.examples || initialExamples}
              testCases={[]}
              isEditMode={false}
              onSubmit={handleQuestionSubmit}
              onCancel={handleCancel}
              errors={errors}
              loading={loadingForm}
              tags={tags}
              difficultyOptions={difficultyOptions}
              showTestCases={false} // Disable test cases in step 1
            />
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-mono text-green-500 mb-6">Add Test Cases</h1>
            <CommonQuestionForm
              initialData={{}}
              examples={[]}
              testCases={testCasesData || initialTestCases}
              isEditMode={false}
              onSubmit={handleTestCasesSubmit}
              onCancel={handleCancel}
              errors={errors}
              loading={loadingForm}
              tags={[]}
              difficultyOptions={[]}
              showTestCases={true}
              testCasesOnly={true} // Enable test case-only mode
            />
            <button
              onClick={handleBack}
              className="mt-4 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-mono py-2 px-4 rounded-lg transition duration-300"
            >
              Back to Question
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="text-2xl font-mono text-green-500 mb-6">Submit Solution</h1>
            <CodeVerificationForm
              questionId={questionId}
              code={code}
              setCode={setCode}
              language={language}
              onLanguageChange={handleLanguageChange}
              testCases={testCasesData || []}
              onVerifyCode={handleVerifyCode}
              loadingVerify={loadingVerify}
              disabled={false}
            />
            <button
              onClick={handleBack}
              className="mt-4 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-mono py-2 px-4 rounded-lg transition duration-300"
            >
              Back to Test Cases
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Contribute;