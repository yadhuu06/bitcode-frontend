import axios from 'axios';

const JUDGE0_API = import.meta.env.VITE_JUDGE0_API_URL;

export const runCodeOnJudge0 = async ({ source_code, language_id, stdin = '' }) => {
  const submission = await axios.post(`${JUDGE0_API}/submissions?base64_encoded=false&wait=true`, {
    source_code,
    language_id,
    stdin,
  });
  
  return submission.data;
};
