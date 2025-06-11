import React from 'react';
import { Check } from 'lucide-react';
import CodeEditor from '../ui/CodeEditor';

const CodeVerificationForm = ({
  questionId,
  code,
  setCode,
  language,
  onLanguageChange,
  testCases = [],
  onVerifyCode,
  loadingVerify,
  loadingRun,
  disabled = false,
}) => {
  const languageMap = {
    javascript: 'JavaScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
  };

  return (
    <div className="flex flex-col gap-6 flex-1">
      <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-800 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#73E600]">Sample Answer</h3>
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={onLanguageChange}
              className="bg-gray-800 text-white rounded px-3 py-2 text-sm focus:outline-none"
              disabled={disabled || loadingVerify || loadingRun}
            >
              {Object.keys(languageMap).map((lang) => (
                <option key={lang} value={lang}>
                  {languageMap[lang]}
                </option>
              ))}
            </select>
            <button
              onClick={onVerifyCode}
              disabled={disabled || loadingVerify || loadingRun || testCases.length === 0}
              className={`group relative flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200 ${
                disabled || loadingVerify || loadingRun || testCases.length === 0
                  ? 'border-gray-700 text-gray-500 cursor-not-allowed bg-transparent'
                  : 'border-[#73E600] text-[#73E600] bg-transparent hover:bg-black hover:text-white'
              }`}
              aria-label="Verify Code"
            >
              <Check className="w-5 h-5" />
              <span>Verify</span>
              <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                Verify code
              </span>
            </button>
          </div>
        </div>
        <div className="flex-1">
          <CodeEditor code={code} setCode={setCode} language={language} disabled={disabled || loadingVerify || loadingRun} />
        </div>
      </div>
    </div>
  );
};

export default CodeVerificationForm;