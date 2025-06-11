import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CommonQuestionForm from '../common/CommonQuestionForm';
import { contributeQuestion } from '../../services/ProblemService';
import { ROUTES } from '../../routes/paths';

const ContributeQuestion = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loadingForm, setLoadingForm] = useState(false);

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
        test_cases: [], // Test cases to be added later
      });
      setErrors({});
      toast.success('Question submitted! Now submit a solution.');
      navigate(ROUTES.USER_CONTRIBUTION_SOLUTION.replace(':questionId', response.question_id));
    } catch (err) {
      const errorMessage = JSON.parse(err.message || '{}');
      setErrors(errorMessage.errors || { general: errorMessage.error || 'Failed to submit question' });
      toast.error(errorMessage.error?.detail || 'Failed to submit question');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleQuestionCancel = () => {
    navigate(ROUTES.USER_PROFILE);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-mono text-green-500 mb-6">Contribute New Question</h1>
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
  );
};

export default ContributeQuestion;