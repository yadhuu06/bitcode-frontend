import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Check, Play, Save, Copy, Trash, Maximize, Minimize } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import CodeEditor from '../../components/ui/CodeEditor';
import { runCodeOnJudge0 } from '../../services/CompilerService';

const JUDGE0_API = import.meta.env.VITE_JUDGE0_API_URL;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Compiler = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.loading);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('Ready');
  const [time, setTime] = useState('0.00 ms');
  const [memory, setMemory] = useState('0.0 MB');
  const [showCheck, setShowCheck] = useState(false);
  const [isEditorFull, setIsEditorFull] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const languages = [
    {
      name: 'javascript',
      language_id: '63',
      icon: 'https://raw.githubusercontent.com/voodootikigod/logo.js/master/js.png',
      placeholder: '// JavaScript code\nconsole.log("Hello, Bit Code!");'
    },
    {
      name: 'python',
      language_id: '71',
      icon: 'https://img.icons8.com/?size=100&id=13441&format=png&color=000000',
      placeholder: '# Python code\nprint("Hello, Bit Code!")'
    },
    {
      name: 'go',
      language_id: '60',
      icon: 'https://go.dev/images/go-logo-white.svg',
      placeholder: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Bit Code!")\n}'
    },
  ];

  useEffect(() => {
    const savedCode = localStorage.getItem(`compiler_${language}`) || languages.find(l => l.name === language).placeholder;
    setCode(savedCode);
  }, [language]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code]);

  const runCode = async () => {
    const selectedLang = languages.find(l => l.name === language);
    const languageId = selectedLang.language_id;

    setStatus('Executing');
    setOutput('');
    dispatch(setLoading({ isLoading: true, message: `Executing ${language} code...`, style: 'terminal', progress: 0 }));

    try {
      const result = await runCodeOnJudge0({
        source_code: code,
        language_id: parseInt(languageId),
      });

      if (result.stderr || result.compile_output) {
        setStatus('Error');
        setOutput(result.stderr || result.compile_output || 'Unknown error');
      } else {
        setStatus('Success');
        setOutput(result.stdout || 'No output');
      }

      setTime(`${result.time * 1000} ms`);
      setMemory(`${(result.memory / 1024).toFixed(2)} MB`);
    } catch (error) {
      setStatus('Error');
      setOutput(`Error: ${error.message || 'Execution failed'}`);
    } finally {
      dispatch(resetLoading());
    }
  };

  const saveCode = () => {
    localStorage.setItem(`compiler_${language}`, code);
    setShowCheck(true);
    setTimeout(() => setShowCheck(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setShowCheck(true);
    setTimeout(() => setShowCheck(false), 2000);
  };

  const clearCode = () => {
    const placeholder = languages.find(l => l.name === language).placeholder;
    setCode(placeholder);
    localStorage.setItem(`compiler_${language}`, placeholder);
    setOutput('');
    setTime('0.00 ms');
    setMemory('0.0 MB');
    setStatus('Ready');
  };

  const toggleEditorFull = () => {
    setIsEditorFull(!isEditorFull);
    setIsFullScreen(false);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    setIsEditorFull(false);
  };

  const getTimeColor = () => {
    const timeValue = parseFloat(time);
    if (timeValue < 100) return 'text-green-500';
    if (timeValue < 250) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`min-h-screen bg-black text-white font-mono ${isFullScreen ? 'fixed inset-0 z-50 overflow-hidden' : ''}`}>
<nav className="bg-black border-b-2 border-green-500 h-16 flex items-center px-4 sm:px-6 fixed top-0 left-0 w-full z-50">
  <div className="container mx-auto flex items-center justify-between">
    <NavLink
      to="/user/dashboard"
      className={({ isActive }) =>
        `text-base sm:text-lg font-semibold transition-colors duration-300 ${
          isActive ? 'text-green-500' : 'text-white hover:text-green-500'
        }`
      }
    >
      <span className="text-green-500">{'<'}</span>
      <span>BitCode Compiler</span>
      <span className="text-green-500">{'/>'}</span>
    </NavLink>
  </div>
</nav>

      <div className="container mx-auto px-4 sm:px-6 pt-20 pb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div
            className={`transition-all duration-300 ${isEditorFull ? 'w-full h-[80vh]' : isFullScreen ? 'w-0 hidden' : 'w-full lg:w-[65%]'}`}
          >
            <div className="bg-gray-900 rounded-xl border border-green-500 p-4 sm:p-6">
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
                    onClick={runCode}
                    className="p-2 rounded-lg text-white hover:text-green-500 hover:bg-gray-800 transition-all duration-200 border border-green-500"
                    title="Run (Ctrl+Enter)"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button
                    onClick={saveCode}
                    className="p-2 rounded-lg text-white hover:text-green-500 hover:bg-gray-800 transition-all duration-200 border border-green-500"
                    title="Save (Ctrl+S)"
                  >
                    {showCheck ? <Check className="w-5 h-5 text-green-500" /> : <Save className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={copyCode}
                    className="p-2 rounded-lg text-white hover:text-green-500 hover:bg-gray-800 transition-all duration-200 border border-green-500"
                    title="Copy"
                  >
                    {showCheck ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={clearCode}
                    className="p-2 rounded-lg text-white hover:text-green-500 hover:bg-gray-800 transition-all duration-200 border border-green-500"
                    title="Clear"
                  >
                    <Trash className="w-5 h-5" />
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
          </div>
          <div
            className={`transition-all duration-300 ${isFullScreen ? 'w-full h-[calc(100vh-4rem)]' : isEditorFull ? 'w-0 hidden' : 'w-full lg:w-[35%]'}`}
          >
            <div className="bg-gray-900 rounded-xl border border-green-500 p-4 sm:p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white">Console Output</h3>
                <button
                  onClick={toggleFullScreen}
                  className="p-2 rounded-lg text-white hover:text-green-500 hover:bg-gray-800 transition-all duration-200 border border-green-500"
                  title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen Output'}
                >
                  {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex-1 flex flex-col">
                {isFullScreen ? (
 <div className="flex h-full gap-4 sm:gap-6">
  <div className="w-[75%] bg-gray-950 rounded-lg border border-green-500 p-4 sm:p-6">
    <h3 className="text-sm font-semibold text-white mb-4">Output</h3>
    <div className="overflow-y-auto max-h-[calc(100%-2rem)]">
      <pre className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed font-mono">{output || '// Output will display here'}</pre>
    </div>
  </div>
  <div className="w-[25%] flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-white text-center">Status</h3>
      <div className="h-[120%] bg-gray-950 rounded-lg border-2 border-green-600 p-4 flex items-center justify-center" style={{ width: '80%' }}>
        <span className={`text-sm font-medium ${status === 'Error' ? 'text-red-500' : 'text-green-500'}`}>
          {status}
        </span>
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-white text-center">Time</h3>
      <div className="h-[120%] bg-gray-950 rounded-lg border-2 border-green-600 p-4 flex items-center justify-center" style={{ width: '80%' }}>
        <p className={`text-sm font-medium ${getTimeColor()}`}>{time}</p>
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-white text-center">Memory</h3>
      <div className="h-[120%] bg-gray-950 rounded-lg border-2 border-green-600 p-4 flex items-center justify-center" style={{ width: '80%' }}>
        <p className="text-sm font-medium text-green-500">{memory}</p>
      </div>
    </div>
  </div>
</div>
                ) : (
                  <>
                    <div className="h-[75%] bg-gray-950 rounded-lg border border-green-500 p-4 sm:p-6 overflow-hidden">
                      <h3 className="text-sm font-semibold text-white mb-4">Output</h3>
                      <div className="overflow-y-auto max-h-[calc(100%-2rem)]">
                        <pre className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed font-mono">{output || '// Output will display here'}</pre>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <div className="flex justify-between gap-4 mb-4">
                        <h3 className="flex-1 text-sm font-semibold text-white text-center">Status</h3>
                        <h3 className="flex-1 text-sm font-semibold text-white text-center">Time</h3>
                        <h3 className="flex-1 text-sm font-semibold text-white text-center">Memory</h3>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between gap-4 h-[25%]">
                        <div className="flex-1 bg-gray-950 rounded-lg border-2 border-green-600 p-4 flex items-center justify-center">
                          <span className={`text-sm font-medium ${status === 'Error' ? 'text-red-500' : 'text-green-500'}`}>
                            {status}
                          </span>
                        </div>
                        <div className="flex-1 bg-gray-950 rounded-lg border-2 border-green-600 p-4 flex items-center justify-center">
                          <p className={`text-sm font-medium ${getTimeColor()}`}>{time}</p>
                        </div>
                        <div className="flex-1 bg-gray-950 rounded-lg border-2 border-green-600 p-4 flex items-center justify-center">
                          <p className="text-sm font-medium text-green-500">{memory}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <footer className="mt-8 text-center text-gray-400 text-xs border-t border-green-500 pt-4">
          <p>BITCODE COMPILER v1.0 • 2025</p>
          <p className="mt-1">Shortcuts: Ctrl+Enter to run • Ctrl+S to save</p>
        </footer>
      </div>
    </div>
  );
};

export default Compiler;