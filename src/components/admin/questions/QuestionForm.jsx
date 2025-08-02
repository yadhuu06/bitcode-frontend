import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { createQuestion, editQuestion, fetchQuestionById } from '../../../services/ProblemService';
import CommonQuestionForm from '../../common/CommonQuestionForm';
import { showError } from '../../../utils/toastManager';

const tagDisplayMap = {
  ARRAY: 'Array',
  STRING: 'String',
  DSA: 'DSA',
};

const tagValueMap = {
  Array: 'ARRAY',
  String: 'STRING',
  DSA: 'DSA',
};

const difficultyOptions = [
  { value: 'EASY', label: 'Easy', color: 'green-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'yellow-400' },
  { value: 'HARD', label: 'Hard', color: 'red-400' },
];

const tagsOptions = [
  { value: 'ARRAY', label: 'Array' },
  { value: 'STRING', label: 'String' },
  { value: 'DSA', label: 'DSA' },
];

const QuestionForm = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const isEditMode = !!questionId;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    tags: 'ARRAY',
  });
  const [examples, setExamples] = useState([
    { input_example: '', output_example: '', explanation: '', order: 0 },
  ]);
  const [testCases, setTestCases] = useState([
    { input_data: '', expected_output: '', is_sample: false, order: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const fetchQuestion = async () => {
        try {
          setLoading(true);
          const question = await fetchQuestionById(questionId);
          console.log('Fetched question:', question);

          setFormData({
            title: question.title || '',
            description: question.description || '',
            difficulty: question.difficulty || 'EASY',
            tags: tagValueMap[question.tags] || question.tags || 'ARRAY',
          });

          // Ensure examples is always an array
          setExamples(
            Array.isArray(question.examples) && question.examples.length > 0
              ? question.examples.map((ex, index) => ({
                  input_example: ex.input_example || '',
                  output_example: ex.output_example || '',
                  explanation: ex.explanation || '',
                  order: ex.order !== undefined ? ex.order : index,
                }))
              : [{ input_example: '', output_example: '', explanation: '', order: 0 }]
          );

          // Ensure testCases is always an array
          setTestCases(
            Array.isArray(question.test_cases) && question.test_cases.length > 0
              ? question.test_cases.map((tc, index) => ({
                  input_data: tc.input_data || '',
                  expected_output: tc.expected_output || '',
                  is_sample: tc.is_sample || false,
                  order: tc.order !== undefined ? tc.order : index,
                }))
              : [{ input_data: '', expected_output: '', is_sample: false, order: 0 }]
          );
        } catch (error) {
          console.error('Fetch question error:', error);
          showError(error.message || 'Failed to fetch question data');
          navigate('/admin/questions');
        } finally {
          setLoading(false);
        }
      };
      fetchQuestion();
    }
  }, [isEditMode, questionId, navigate]);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setErrors({});
      const payload = {
        ...data,
        is_contributed: !isAdmin,
      };
      if (isEditMode) {
        await editQuestion(questionId, payload);
      } else {
        await createQuestion(payload);
      }
      navigate(isAdmin ? '/admin/questions' : '/contribute');
    } catch (error) {
      const errorData = error.errors || {};
      if (errorData.title || errorData.description || errorData.difficulty || errorData.tags || errorData.examples || errorData.test_cases) {
        setErrors(errorData);
      } else {
        showError(error.message || 'Failed to save question');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(isAdmin ? '/admin/questions' : '/contribute');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <CommonQuestionForm
      initialData={formData}
      initialExamples={examples}
      initialTestCases={testCases}
      isEditMode={isEditMode}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      errors={errors}
      loading={loading}
      tags={tagsOptions}
      difficultyOptions={difficultyOptions}
      showTestCases={isAdmin}
    />
  );
};

QuestionForm.propTypes = {
  isAdmin: PropTypes.bool,
};

export default QuestionForm;