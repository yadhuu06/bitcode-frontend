import React, { useState, useEffect, memo, useRef } from 'react';
import { NavLink, useParams, useLocation, useNavigate } from 'react-router-dom';
import { Play, Maximize, Minimize, Save, Copy, Trash } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { toast } from 'react-toastify';
import CodeEditor from '../../components/ui/CodeEditor';
import ChatPanel from './ChatPannel';
import WebSocketService from '../../services/WebSocketService';
import api from '../../api';
import { getRoomDetails } from '../../services/RoomService';
import ReactMarkdown from 'react-markdown';

const Battle = () => {
  const { roomId, questionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.loading);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('question');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [isEditorFull, setIsEditorFull] = useState(false);
  const [question, setQuestion] = useState(state?.question || null);
  const [testCases, setTestCases] = useState(state?.question?.testcases || []);
  const [results, setResults] = useState([]);
  const [allPassed, setAllPassed] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const wsListenerId = useRef(`battle-${roomId}`);

  const languages = [
    {
      name: 'javascript',
      language_id: '63',
      icon: 'https://raw.githubusercontent.com/voodootikigod/logo.js/master/js.png',
      placeholder: '// JavaScript code\nconsole.log("Hello, Bit Code!");',
    },
    {
      name: 'python',
      language_id: '71',
      icon: 'https://img.icons8.com/?size=100&id=13441&format=png&color=000000',
      placeholder: '# Python code\nprint("Hello, Bit Code!")',
    },
    {
      name: 'go',
      language_id: '60',
      icon: 'https://go.dev/images/go-logo-white.svg',
      placeholder: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Bit Code!")\n}',
    },
  ];

  useEffect(() => {
    if (!roomId || !questionId) {
      console.error('Invalid roomId or questionId:', { roomId, questionId });
      toast.error('Invalid room or question ID');
      navigate('/user/rooms');
      return;
    }

    const fetchRoom = async () => {
      try {
        
        const response = await getRoomDetails(roomId, token);
        setRoomDetails(response);
      } catch (error) {
        toast.error(error.message || 'Failed to load room details');
      }
    };

    const fetchQuestion = async () => {
      if (question) return;
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/battle/${questionId}/`);
        setQuestion(response.data);
        setTestCases(response.data.testcases || []);
      } catch (error) {
        toast.error(error.message || 'Failed to load question details');
        navigate('/user/rooms');
      }
    };

    fetchRoom();
    fetchQuestion();


    return () => {
      console.log('Cleaning up WebSocket listener in Battle');
     
    };
  }, [roomId, questionId, question, user, navigate]);

  useEffect(() => {
    if (question) {
      const savedCode = localStorage.getItem(`battle_${question.id}_${language}`) || languages.find((l) => l.name === language).placeholder;
      setCode(savedCode);
    }
  }, [language, question]);

  const runCode = async () => {
    if (!question) {
      toast.error('No question loaded');
      return;
    }
    dispatch(setLoading({ isLoading: true, message: `Verifying ${language} code...`, style: 'terminal', progress: 0 }));
    try {
      const response = await api.post(`/questions/${question.id}/verify/`, {
        code,
        language,
        room_id: roomId,
      });
      setResults(response.data.results);
      setAllPassed(response.data.all_passed);
      setActiveTab('results');
      toast.success('Code verification completed');

      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      dispatch(resetLoading());
    }
  };

  const saveCode = () => {
    if (!question) {
      toast.error('No question loaded');
      return;
    }
    localStorage.setItem(`battle_${question.id}_${language}`, code);
    toast.success('Code saved');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied');
  };

  const clearCode = () => {
    const placeholder = languages.find((l) => l.name === language).placeholder;
    setCode(placeholder);
    if (question) {
      localStorage.setItem(`battle_${question.id}_${language}`, placeholder);
    }
    setResults([]);
    setAllPassed(false);
  };

  const toggleEditorFull = () => {
    setIsEditorFull(!isEditorFull);
  };

  return (
    <div className={`min-h-screen bg-black text-white font-mono ${isEditorFull ? 'overflow-hidden' : ''}`}>
      <nav className="bg-black border-b-2 border-green-500 h-16 flex items-center px-4 sm:px-6 fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto flex items-center justify-between">
          <NavLink
            to="/user/dashboard"
            className="text-base sm:text-lg font-semibold text-white hover:text-green-500 transition-colors duration-300"
          >
            <span className="text-green-500">{'<'}</span>
            <span>BitCode Battle</span>
            <span className="text-green-500">{'/>'}</span>
          </NavLink>
          {roomDetails && (
            <div className="text-sm text-gray-400">
              Room: {roomDetails.name} | {roomDetails.is_ranked ? 'Ranked' : `${roomDetails.time_limit} min`}
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 pt-20 pb-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div
          className={`transition-all duration-300 ${
            isEditorFull ? 'hidden' : 'w-full lg:w-[35%]'
          } bg-gray-900 rounded-xl border border-green-500 p-4 sm:p-6 h-[80vh] flex flex-col`}
        >
          <div className="flex border-b border-green-500 mb-4">
            {['question', 'chat', 'results'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-semibold ${
                  activeTab === tab ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-green-500'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'question' && question ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{question.title}</h2>
                <div className="prose prose-sm prose-invert max-w-none text-gray-200">
                    <ReactMarkdown>
                      {question.description || 'No description available'}
                    </ReactMarkdown>
                  </div>
                
                <div>
                  <h3 className="text-sm font-semibold">Difficulty</h3>
                  <p className="text-sm text-gray-200">{question.difficulty?.toLowerCase() || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Topic</h3>
                  <p className="text-sm text-gray-200">{question.tags || 'None'}</p>
                </div>
                {question.examples && question.examples.length > 0 && (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold mb-2">Examples</h3>
    {question.examples.map((example, index) => (
      <div key={index} className="bg-gray-950 p-4 rounded-lg text-sm mb-4 shadow-lg border border-green-500">
        <p className="text-green-400 font-semibold mb-2">Example {index + 1}</p>

        <div className="mb-2">
          <p className="text-gray-400">Input:</p>
          <div className="bg-black/40 text-white p-2 rounded-md overflow-x-auto">{example.input_example || 'N/A'}</div>
        </div>

        <div className="mb-2">
          <p className="text-gray-400">Output:</p>
          <div className="bg-black/40 text-white p-2 rounded-md overflow-x-auto">{example.output_example || 'N/A'}</div>
        </div>

        {example.explanation && (
          <div className="mb-2">
            <p className="text-gray-400">Explanation:</p>
            <div className="bg-black/40 text-white p-2 rounded-md overflow-x-auto">{example.explanation}</div>
          </div>
        )}
      </div>
    ))}
  </div>
)}

                <div>
                  <h3 className="text-sm font-semibold">Test Cases</h3>
                  {testCases.length > 0 ? (
                    testCases.map((tc, index) => (
                      <div key={index} className="bg-gray-950 p-3 rounded-lg text-sm mb-2">
                        <p><strong>Test Case {index + 1}</strong></p>
                        <p>Input: {tc.input_data || 'N/A'}</p>
                        <p>Expected Output: {tc.expected_output || 'N/A'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No test cases available</p>
                  )}
                </div>
              </div>
            ) : activeTab === 'question' ? (
              <p className="text-sm text-gray-400">Loading question or no question available</p>
            ) : null}
            {activeTab === 'chat' && (
              <ChatPanel roomId={roomId} username={user?.username || 'Guest'} isActiveTab={activeTab === 'chat'} />
            )}
            {activeTab === 'results' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                {results.length === 0 ? (
                  <p className="text-sm text-gray-400">No results yet. Run your code to see the outcome.</p>
                ) : (
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div key={index} className="bg-gray-950 p-3 rounded-lg text-sm">
                        <p className="flex items-center gap-2">
                          <span className={result.passed ? 'text-green-500' : 'text-red-500'}>
                            {result.passed ? '✓ Passed' : '✗ Failed'}
                          </span>
                          <span>Test Case {index + 1}</span>
                        </p>
                        <p>Input: {result.input || 'N/A'}</p>
                        <p>Expected: {result.expected || 'N/A'}</p>
                        <p>Actual: {result.actual || 'N/A'}</p>
                        {result.error && <p className="text-red-500">Error: {result.error}</p>}
                      </div>
                    ))}
                    <p className={`text-sm font-semibold ${allPassed ? 'text-green-500' : 'text-red-500'}`}>
                      {allPassed ? 'All test cases passed!' : 'Some test cases failed.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

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
                onClick={runCode}
                disabled={isLoading || !question}
                className={`p-2 rounded-lg border border-green-500 transition-all duration-200 ${
                  isLoading || !question ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:text-green-500 hover:bg-gray-800'
                }`}
                title="Run (Ctrl+Enter)"
              >
                <Play className="w-5 h-5" />
              </button>
              <button
                onClick={saveCode}
                disabled={!question}
                className={`p-2 rounded-lg border border-green-500 transition-all duration-200 ${
                  !question ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:text-green-500 hover:bg-gray-800'
                }`}
                title="Save (Ctrl+S)"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={copyCode}
                className="p-2 rounded-lg text-white hover:text-green-500 hover:bg-gray-800 transition-all duration-200 border border-green-500"
                title="Copy"
              >
                <Copy className="w-5 h-5" />
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
      <footer className="mt-8 text-center text-gray-400 text-xs border-t border-green-500 pt-4">
        <p>BITCODE BATTLE v1.0 • 2025</p>
        <p className="mt-1">Shortcuts: Ctrl+Enter to run • Ctrl+S to save</p>
      </footer>
    </div>
  );
};

export default memo(Battle);