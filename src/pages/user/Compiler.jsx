import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Code, Check, Play, Save, X, Copy, Trash, Maximize, Minimize } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import CustomButton from '../../components/ui/CustomButton';
import axios from 'axios';

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
  const [isOutputFull, setIsOutputFull] = useState(false);
  const textareaRef = useRef(null);

  const languages = [
    {
      name: 'javascript',
      icon: 'https://raw.githubusercontent.com/voodootikigod/logo.js/master/js.png',
      placeholder: '// JavaScript code\nconsole.log("Hello, Bit Code!");'
    },
    {
      name: 'python',
      icon: 'https://img.icons8.com/?size=100&id=13441&format=png&color=000000',
      placeholder: '# Python code\nprint("Hello, Bit Code!")'
    },
    {
      name: 'go',
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
    setStatus('Executing');
    setOutput('');
    dispatch(setLoading({ isLoading: true, message: `Executing ${language} code...`, style: 'terminal', progress: 0 }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const randTime = (Math.random() * 0.2).toFixed(2);
      const randMemory = (Math.random() * 5 + 1).toFixed(1);
      setTime(`${randTime} ms`);
      setMemory(`${randMemory} MB`);
      setOutput(language === 'javascript' ? '> Sample output\n> Process completed' :
                language === 'python' ? '>>> Sample output\n>>> Process completed' :
                'Sample output\ngo run completed');
      setStatus(Math.random() > 0.1 ? 'Completed' : 'Error');
    } catch (error) {
      setOutput(`Error: ${error.message || 'Execution failed'}`);
      setStatus('Error');
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
    setIsOutputFull(false);
  };

  const toggleOutputFull = () => {
    setIsOutputFull(!isOutputFull);
    setIsEditorFull(false);
  };

  const lineNumbers = code.split('\n').map((_, i) => i + 1).join('\n');

  const navLinkClass = ({ isActive }) =>
    `text-xl font-bold font-orbitron tracking-widest flex items-center space-x-1 ${isActive ? 'text-green-400' : 'text-white'}`;

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      <nav className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 h-[57px] flex items-center px-4">
        <div className="container mx-auto flex items-center justify-between">
          <NavLink to="/user/dashboard" className={navLinkClass}>
            <span className="text-green-400">{'<'}</span>
            <span className="text-white">BitCode</span>
            <span className="text-green-400">{'/>'}</span>
            <h1 className="text-xl font-orbitron tracking-widest text-green-400">COMPILER</h1>
            
          </NavLink>
          
        </div>
      </nav>
      <div className="relative z-10 container mx-auto px-4 py-4 h-[110vh]">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className={`transition-all duration-300 ${isEditorFull ? 'w-full h-[88vh]' : isOutputFull ? 'w-0' : 'w-full lg:w-[65%]'} overflow-hidden`}>
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <select
                    className="bg-gray-800 text-white rounded-md px-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-green-400"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {languages.map(lang => (
                      <option key={lang.name} value={lang.name}>
                        {lang.name.charAt(0).toUpperCase() + lang.name.slice(1)}
                      </option>
                    ))}
                  </select>
                  <img
                    src={languages.find(l => l.name === language).icon}
                    alt={`${language} logo`}
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={runCode}
                    className="p-1.5 rounded-md text-green-400 hover:text-white hover:bg-green-400/20 transition-colors border border-green-400/50 hover:border-green-400"
                    title="Run (Ctrl+Enter)"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button
                    onClick={saveCode}
                    className="p-1.5 rounded-md text-green-400 hover:text-white hover:bg-green-400/20 transition-colors border border-green-400/50 hover:border-green-400"
                    title="Save (Ctrl+S)"
                  >
                    {showCheck ? <Check className="w-5 h-5 text-green-400" /> : <Save className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={copyCode}
                    className="p-1.5 rounded-md text-green-400 hover:text-white hover:bg-green-400/20 transition-colors border border-green-400/50 hover:border-green-400"
                    title="Copy"
                  >
                    {showCheck ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={clearCode}
                    className="p-1.5 rounded-md text-green-400 hover:text-white hover:bg-green-400/20 transition-colors border border-green-400/50 hover:border-green-400"
                    title="Clear"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                  <button
                    onClick={toggleEditorFull}
                    className="p-1.5 rounded-md text-green-400 hover:text-white hover:bg-green-400/20 transition-colors border border-green-400/50 hover:border-green-400"
                    title={isEditorFull ? "Minimize Editor" : "Maximize Editor"}
                  >
                    {isEditorFull ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex bg-gray-950/90 rounded border border-gray-800 overflow-hidden">
                <div className="bg-gray-800/50 text-gray-500 p-2 text-right select-none text-sm" style={{ width: '3em' }}>
                  <pre>{lineNumbers}</pre>
                </div>
                <textarea
                  ref={textareaRef}
                  className="w-full h-[66vh] p-2 bg-transparent text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck="false"
                />
              </div>
            </div>
          </div>
          <div className={`transition-all duration-300 ${isOutputFull ? 'w-full h-[88vh]' : isEditorFull ? 'w-0' : 'w-full lg:w-[35%]'} bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-800 p-4 flex flex-col`}>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setIsEditorFull(true)}
                className={`p-2 bg-gray-800 text-green-400 rounded-md text-sm border border-gray-700 hover:bg-green-400/20 hover:border-green-400 ${isEditorFull || isOutputFull ? 'hidden' : ''}`}
              >
                Open Editor
              </button>
              <button
                onClick={toggleOutputFull}
                className="p-1.5 rounded-md text-green-400 hover:text-white hover:bg-green-400/20 transition-colors border border-green-400/50 hover:border-green-400"
                title={isOutputFull ? "Minimize Output" : "Maximize Output"}
              >
                {isOutputFull ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="h-[77%] bg-gray-950/90 rounded border border-gray-800 p-4 overflow-auto">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-green-400 font-orbitron tracking-wide">Console Output</h3>
                  <span className={`text-sm ${status === 'Error' ? 'text-white' : 'text-green-400'}`}>{status}</span>
                </div>
                <pre className="text-white text-sm">{output || '// Output will display here'}</pre>
              </div>
              <div className="h-[33%] mt-4 bg-gray-950/90 rounded border border-gray-800 p-4">
                <h3 className="text-lg font-semibold text-green-400 font-orbitron tracking-wide mb-2">Execution Stats</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="text-green-400">{time}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Memory</p>
                    <p className="text-green-400">{memory}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="mt-8 text-center text-gray-600 text-xs border-t border-gray-800/50 pt-4">
          <p>BITCODE COMPILER v1.0 • Quantum Environment • 2025</p>
          <p className="mt-1">Shortcuts: Ctrl+Enter to run • Ctrl+S to save</p>
        </footer>
      </div>
      <style jsx>{`
        .perspective-grid {
          background-image: linear-gradient(to bottom, rgba(34, 197, 94, 0.1) 1px, transparent 1px),
                            linear-gradient(to right, rgba(34, 197, 94, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          transform: perspective(600px) rotateX(60deg);
          opacity: 0.3;
          height: 200%;
          position: absolute;
          top: -50%;
          left: 0;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default Compiler;