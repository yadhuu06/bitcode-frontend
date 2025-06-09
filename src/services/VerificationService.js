import api from "../api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const verifyAnswer = async (question_id, code, language) => {
  try {
    const response = await api.post(`questions/${question_id}/verify/`, { code, language });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to verify answer");
  }
};

export const fetchSolvedCodes = async (question_id) => {
  try {
    const response = await api.get(`questions/${question_id}/solved-codes/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch solved codes");
  }
};