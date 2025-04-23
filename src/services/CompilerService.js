// src/services/CompilerService.js
import store from '../store'; // Adjust path as needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const compileCode = async (code, language) => {
  try {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    const response = await fetch(`${API_BASE_URL}/api/compiler/execute/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ code, language }),
    });

    if (!response.ok) {
      throw new Error('Failed to compile code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error compiling code:', error);
    throw error;
  }
};

export const fetchSupportedLanguages = async () => {
  try {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    const response = await fetch(`${API_BASE_URL}/api/compiler/languages/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch supported languages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    throw error;
  }
};