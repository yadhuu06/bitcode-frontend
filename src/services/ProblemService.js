import api from '../api';
import { toast } from 'react-toastify';

// Create a new question
export const createQuestion = async (formData) => {
  try {
    const response = await api.post('/problems/questions/create/', formData);
    toast.success('Question created successfully!');
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error.response?.data || error.message);
    const errors = error.response?.data || { error: 'Failed to create question' };
    toast.error(errors.error || 'Failed to create question');
    throw new Error(JSON.stringify(errors));
  }
};

// Edit an existing question
export const editQuestion = async (questionId, formData) => {
  try {
    const response = await api.put(`/problems/questions/edit/${questionId}/`, formData);
    toast.success('Question updated successfully!');
    return response.data;
  } catch (error) {
    console.error('Error editing question:', error.response?.data || error.message);
    const errors = error.response?.data || { error: 'Failed to edit question' };
    toast.error(errors.error || 'Failed to edit question');
    throw new Error(JSON.stringify(errors));
  }
};

// Fetch the list of questions
export const fetchQuestions = async () => {
  try {
    const response = await api.get('/problems/questions/');
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error.response?.data || error.message);
    const errors = error.response?.data || { error: 'Failed to fetch questions' };
    toast.error(errors.error || 'Failed to fetch questions');
    throw new Error(JSON.stringify(errors));
  }
};

// Fetch a single question by ID
export const fetchQuestionById = async (questionId) => {
  try {
    const response = await fetchQuestions();
    const question = response.questions.find((q) => q.question_id === questionId);
    if (!question) {
      toast.error('Question not found');
      throw new Error('Question not found');
    }
    return question;
  } catch (error) {
    console.error('Error fetching question:', error.response?.data || error.message);
    const errors = error.response?.data || { error: error.message || 'Failed to fetch question' };
    toast.error(errors.error || 'Failed to fetch question');
    throw new Error(JSON.stringify(errors));
  }
};