import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types'; // Add PropTypes import
import { createQuestion, editQuestion, fetchQuestionById } from '../../../services/ProblemService';
import CommonQuestionForm from '../../common/CommonQuestionForm';

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

const QuestionForm = ({ isAdmin = false }) => { // Add isAdmin prop
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
  const [testCases, setTestCases] = useState([ // Add testCases state
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
          setFormData({
            title: question.title || '',
            description: question.description || '',
            difficulty: question.difficulty || 'EASY',
            tags: tagValueMap[question.tags] || question.tags || 'ARRAY',
          });
          setExamples(
            question.examples?.length > 0
              ? question.examples.map((ex, index) => ({
                  input_example: ex.input_example || '',
                  output_example: ex.output_example || '',
                  explanation: ex.explanation || '',
                  order: ex.order || index,
                }))
              : [{ input_example: '', output_example: '', explanation: '', order: 0 }]
          );
          setTestCases(
            question.test_cases?.length > 0
              ? question.test_cases.map((tc, index) => ({
                  input_data: tc.input_data || '',
                  expected_output: tc.expected_output || '',
                  is_sample: tc.is_sample || false,
                  order: tc.order || index,
                }))
              : [{ input_data: '', expected_output: '', is_sample: false, order: 0 }]
          );
        } catch (error) {
          toast.error(error.message || 'Failed to load question');
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
        is_contributed: !isAdmin, // Set is_contributed for user contributions
      };
      if (isEditMode) {
        await editQuestion(questionId, payload);
        toast.success('Question updated successfully');
      } else {
        await createQuestion(payload);
        toast.success('Question created successfully');
      }
      navigate(isAdmin ? '/admin/questions' : '/contribute');
    } catch (error) {
      const errorData = error.errors || {};
      if (errorData.title || errorData.description || errorData.difficulty || errorData.tags || errorData.examples || errorData.test_cases) {
        setErrors(errorData);
      } else {
        toast.error(error.message || 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(isAdmin ? '/admin/questions' : '/contribute');
  };

  return (
    <CommonQuestionForm
      initialData={formData}
      examples={examples}
      testCases={testCases} // Pass testCases
      isEditMode={isEditMode}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      errors={errors}
      loading={loading}
      tags={tagsOptions}
      difficultyOptions={difficultyOptions}
      showTestCases={isAdmin} // Show test cases only for admins
    />
  );
};

QuestionForm.propTypes = {
  isAdmin: PropTypes.bool,
};

export default QuestionForm;