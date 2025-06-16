import api from '../api';

export const fetchQuestions = async () => {
  try {
    const response = await api.get('/questions/');
    return response.data;
  } catch (error) {
    throw new Error(JSON.stringify(error.response?.data || { error: 'Failed to fetch questions' }));
  }
};

export const fetchQuestionById = async (questionId) => {
  try {
    const response = await api.get('/questions/', {
      params: { question_id: questionId },
    });
    return response.data.questions.find((q) => q.question_id === questionId);
  } catch (error) {
    throw new Error(JSON.stringify(error.response?.data || { error: 'Failed to fetch question' }));
  }
};

export const createQuestion = async (data) => {
  try {
    const response = await api.post('/questions/create/', data);
    return response.data;
  } catch (error) {
    throw new Error(JSON.stringify(error.response?.data || { error: 'Failed to create question' }));
  }
};

export const editQuestion = async (questionId, data) => {
  try {
    const response = await api.put(`/questions/edit/${questionId}/`, data);
    return response.data;
  } catch (error) {
    throw new Error(JSON.stringify(error.response?.data || { error: 'Failed to update question' }));
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
    throw new Error(JSON.stringify(error.response?.data || { error: 'Failed to fetch test cases' }));
  }
};

export const createTestCase = async (questionId, data) => {
  try {
    const response = await api.post(`/questions/${questionId}/test-cases/`, data);
    return response.data;
  } catch (error) {
    throw new Error(JSON.stringify(error.response?.data || { error: 'Failed to create test case' }));
  }
};

export const updateTestCase = async (questionId, testCaseId, data) => {
  try {
    const response = await api.put(`/questions/${questionId}/test-cases/${testCaseId}/`, data);
    return response.data;
  } catch (error) {
    throw new Error(JSON.stringify(error.response?.data || { error: 'Failed to update test case' }));
  }
};

export const deleteTestCase = async (questionId, testCaseId) => {
  try {
    const response = await api.delete(`/questions/${questionId}/test-cases/${testCaseId}/`);
    return response.data;
  } catch (error) {
    throw new Error(JSON.stringify(error.response?.data || { error: 'Failed to delete test case' }));
  }
};

export const contributeQuestion = async (data) => {
  try {
    const response = await api.post('/questions/contribute/', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to contribute question' };
  }
};
export const contributeTestCases = async (questionId, data) => {
  try {
    const response = await api.post(`/questions/${questionId}/contribute-test-cases/`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to contribute test cases' };
  }
};


export const contributionStatusChange = async (questionId, data) => {
  try {
    const response = await api.patch(`/questions/${questionId}/verify/`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to change the contribution status" };
  }
};
