import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
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

const QuestionForm = () => {
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const fetchQuestion = async () => {
        try {
          setLoading(true);
          const question = await fetchQuestionById(questionId);
          setFormData({
            title: question.title,
            description: question.description,
            difficulty: question.difficulty,
            tags: tagValueMap[question.tags] || question.tags,
          });
          setExamples(
            question.examples?.length > 0
              ? question.examples
              : [{ input_example: '', output_example: '', explanation: '', order: 0 }]
          );
        } catch (error) {
          const errorData = JSON.parse(error.message);
          toast.error(errorData.error || 'Failed to load question');
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
      if (isEditMode) {
        await editQuestion(questionId, data);
        toast.success('Question updated successfully');
      } else {
        await createQuestion(data);
        toast.success('Question created successfully');
      }
      navigate('/admin/questions');
    } catch (error) {
      const errorData = JSON.parse(error.message);
      if (errorData.title || errorData.description || errorData.difficulty || errorData.tags || errorData.examples) {
        setErrors(errorData);
      } else {
        toast.error(errorData.error || 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/questions');
  };

  return (
    <CommonQuestionForm
      initialData={formData}
      examples={examples}
      isEditMode={isEditMode}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      errors={errors}
      loading={loading}
      tags={tagsOptions}
      difficultyOptions={difficultyOptions}
    />
  );
};

export default QuestionForm;