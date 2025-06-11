import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CodeVerificationForm from '../common/CodeVerificationForm';
import { verifyAnswer } from '../../services/VerificationService';
import { ROUTES } from '../../routes/paths';
import { useSelector } from 'react-redux';

const ContributeSolution = () => {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.is_admin || false;
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [testCases] = useState([]); // Empty until CommonQuestionForm updated

  const handleVerifyCode = async () => {
    if (!code || !language) {
      toast.error('Please provide code and select a language');
      return;
    }
    setLoadingVerify(true);
    try {
      const response = await verifyAnswer(questionId, code, language);
      if (response.all_passed) {
        toast.success('All test cases passed! Solution submitted.');
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

  const handleBack = () => {
    navigate(ROUTES.USER_CONTRIBUTION_QUESTION);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-mono text-green-500 mb-6">Submit Solution</h1>
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
          onClick={handleBack}
          className="mt-4 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-mono py-2 px-4 rounded-lg transition duration-300"
        >
          Back to Question Contribution
        </button>
      </div>
    </div>
  );
};

export default ContributeSolution;