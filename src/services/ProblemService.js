import api from '../api';
import { showError } from '../utils/toastManager';

export const fetchQuestions = async () => {
  try {
    const response = await api.get('/questions/');
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to fetch questions';
    showError(msg); 
    throw new Error(msg);
  }
};

export const fetchQuestionById = async (questionId) => {
  try {
    const response = await api.get(`/questions/${questionId}/`);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to fetch question';
    showError(msg);
    throw { message: msg, errors: error.response?.data?.errors };
  }
};

export const createQuestion = async (data) => {
  try {
    const response = await api.post('/questions/create/', data);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to create question';
    showError(msg);
    throw new Error(msg);
  }
};

export const editQuestion = async (questionId, data) => {
  try {
    const response = await api.put(`/questions/edit/${questionId}/`, data);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to update question';
    showError(msg);
    throw new Error(msg);
  }
};

export const fetchTestCases = async (questionId, page = 1, pageSize = 10, search = '', isSample = null) => {
  try {
    const params = { page, page_size: pageSize };
    if (search) params.search = search;
    if (isSample !== null) params.is_sample = isSample;
    const response = await api.get(`/questions/${questionId}/test-cases/`, { params });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to fetch test cases';
    showError(msg);
    throw new Error(msg);
  }
};

export const createTestCase = async (questionId, data) => {
  try {
    const response = await api.post(`/questions/${questionId}/test-cases/`, data);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to create test case';
    showError(msg);
    throw new Error(msg);
  }
};

export const updateTestCase = async (questionId, testCaseId, data) => {
  try {
    const response = await api.put(`/questions/${questionId}/test-cases/${testCaseId}/`, data);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to update test case';
    showError(msg);
    throw new Error(msg);
  }
};

export const deleteTestCase = async (questionId, testCaseId) => {
  try {
    const response = await api.delete(`/questions/${questionId}/test-cases/${testCaseId}/`);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to delete test case';
    showError(msg);
    throw new Error(msg);
  }
};

export const contributeQuestion = async (data) => {
  try {
    const response = await api.post('/questions/contribute/', data);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to contribute question';
    showError(msg);
    throw new Error(msg);
  }
};

export const contributeTestCases = async (questionId, data) => {
  try {
    const response = await api.post(`/questions/${questionId}/contribute-test-cases/`, data);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to contribute test cases';
    showError(msg);
    throw new Error(msg);
  }
};

export const contributionStatusChange = async (questionId, data) => {
  try {
    const response = await api.patch(`/questions/${questionId}/verify/`, data);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to change the contribution status';
    showError(msg);
    throw new Error(msg);
  }
};
