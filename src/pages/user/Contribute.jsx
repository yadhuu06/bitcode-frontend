import React, { useState, useMemo } from 'react';
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
  const [formData, setFormData] = useState(null);
  const [testCasesData, setTestCasesData] = useState(null);

  const tags = useMemo(() => [
    { value: 'ARRAY', label: 'Array' },
    { value: 'STRING', label: 'String' },
    { value: 'DSA', label: 'Dsa' },
  ], []);

  const difficultyOptions = useMemo(() => [
    { value: 'EASY', label: 'Easy', color: 'green-400' },
    { value: 'MEDIUM', label: 'Medium', color: 'yellow-400' },
    { value: 'HARD', label: 'Hard', color: 'red-400' },
  ], []);

  const initialData = useMemo(() => ({
    title: '',
    description: '',
    difficulty: 'EASY',
    tags: 'ARRAY',
  }), []);

  const initialExamples = useMemo(() => [
    { input_example: '', output_example: '', explanation: '', order: 0 },
  ], []);

  const initialTestCases = useMemo(() => [
    { input_data: '', expected_output: '', is_sample: false, order: 0 },
  ], []);

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
      setFormData({ ...data, examples: data.examples }); // Ensure examples are preserved
      setStep(2);
      toast.success('Question submitted! Now add test cases.');
    } catch (err) {
      let errorMessage = err.response?.data || { error: 'Failed to submit question' };
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
      setTestCasesData(data.testCases);
      setStep(3);
      toast.success('Test cases submitted! Now submit a solution.');
    } catch (err) {
      let errorMessage = err.response?.data || { error: 'Failed to submit test cases' };
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

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Step Indicators with Guidance */}
        <div className="flex justify-between mb-8">
          <div className={`flex-1 text-center font-mono ${step === 1 ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 mx-auto rounded-full ${step === 1 ? 'bg-green-500' : 'bg-gray-500'} flex items-center justify-center text-black`}>1</div>
            <p className="mt-2">Add Question</p>
            <p className="text-xs text-gray-400 mt-1">Enter the problem title, description, difficulty, tags, and examples.</p>
          </div>
          <div className="flex-1 border-t-2 border-gray-500 mt-4"></div>
          <div className={`flex-1 text-center font-mono ${step === 2 ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 mx-auto rounded-full ${step === 2 ? 'bg-green-500' : 'bg-gray-500'} flex items-center justify-center text-black`}>2</div>
            <p className="mt-2">Add Test Cases</p>
            <p className="text-xs text-gray-400 mt-1">Provide input data and expected outputs to test solutions.</p>
          </div>
          <div className="flex-1 border-t-2 border-gray-500 mt-4"></div>
          <div className={`flex-1 text-center font-mono ${step === 3 ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 mx-auto rounded-full ${step === 3 ? 'bg-green-500' : 'bg-gray-500'} flex items-center justify-center text-black`}>3</div>
            <p className="mt-2">Solve Code</p>
            <p className="text-xs text-gray-400 mt-1">Submit a solution that passes all test cases.</p>
          </div>
        </div>

        {/* Content */}
        {step === 1 && (
          <CommonQuestionForm
            initialData={formData || initialData}
            initialExamples={formData?.examples || initialExamples}
            initialTestCases={initialTestCases}
            isEditMode={false}
            onSubmit={handleQuestionSubmit}
            onCancel={handleCancel}
            errors={errors}
            loading={loadingForm}
            tags={tags}
            difficultyOptions={difficultyOptions}
            showTestCases={false}
          />
        )}
        {step === 2 && (
          <CommonQuestionForm
            initialData={{}}
            initialExamples={[]}
            initialTestCases={testCasesData || initialTestCases}
            isEditMode={false}
            onSubmit={handleTestCasesSubmit}
            onCancel={handleCancel}
            errors={errors}
            loading={loadingForm}
            tags={[]}
            difficultyOptions={[]}
            showTestCases={true}
            testCasesOnly={true}
          />
        )}
        {step === 3 && (
          <CodeVerificationForm
            questionId={questionId}
            code={code}
            setCode={setCode}
            language={language}
            onLanguageChange={handleLanguageChange}
            testCases={testCasesData || initialTestCases}
            onVerifyCode={handleVerifyCode}
            loadingVerify={loadingVerify}
            disabled={false}
          />
        )}
      </div>
    </div>
  );
};

export default Contribute;