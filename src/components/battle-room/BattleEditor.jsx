import { CheckCircle, Maximize, Minimize } from 'lucide-react';
import CodeEditor from '../../components/ui/CodeEditor';

const BattleEditor = ({ language, setLanguage, code, setCode, isEditorFull, toggleEditorFull, verifyCode, isLoading, question, languages }) => {
  return (
    <div
      className={`transition-all duration-300 ${
        isEditorFull ? 'w-full h-[80vh]' : 'w-full lg:w-[65%]'
      } bg-gray-900 rounded-xl border border-green-500 p-4 sm:p-6`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select
            className="bg-gray-800 text-white rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 w-full sm:w-auto"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.name} value={lang.name}>
                {lang.name.charAt(0).toUpperCase() + lang.name.slice(1)}
              </option>
            ))}
          </select>
          <img
            src={languages.find((l) => l.name === language).icon}
            alt={`${language} logo`}
            className="w-6 h-6 object-contain"
          />
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end">
          <button
            onClick={verifyCode}
            disabled={isLoading || !question}
            className={`flex items-center gap-2 p-2 rounded-lg border border-green-500 transition-all duration-200 ${
              isLoading || !question
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-white hover:text-green-500 hover:bg-gray-800'
            }`}
            title="Verify"
          >
            <CheckCircle className="w-5 h-5 text-green-500 stroke-[3]" />
            Verify
          </button>
          <button
            onClick={toggleEditorFull}
            className="p-2 rounded-lg text-white hover:text-green-500 hover:bg-gray-800 transition-all duration-200 border border-green-500"
            title={isEditorFull ? 'Minimize Editor' : 'Maximize Editor'}
          >
            {isEditorFull ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <CodeEditor code={code} setCode={setCode} language={language} />
    </div>
  );
};

export default BattleEditor;