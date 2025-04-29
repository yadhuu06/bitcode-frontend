import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Play, Box, Cpu, Activity, DownloadCloud, Copy, Check, Save, Trash, RefreshCcw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import CustomButton from '../../components/ui/CustomButton';
import LoadingOverlay from '../../components/ui/LoadingAnimation';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Compiler = () => {
  const dispatch = useDispatch();
  const loadingState = useSelector((state) => state.loading);
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello, quantum world!");');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [theme, setTheme] = useState('dark');
  const [codeHistory, setCodeHistory] = useState([]);
  const [executionStats, setExecutionStats] = useState({
    memory: '0.0 MB',
    cpu: '0.00 ms',
    status: 'Ready'
  });

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'cpp', label: 'C++', icon: '⚙️' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'go', label: 'Go', icon: '🔵' },
    { value: 'java', label: 'Java', icon: '☕' }
  ];

  // Handle code execution
  const handleRunCode = async () => {
    // Save current code to history
    setCodeHistory(prev => [...prev.slice(-9), code]);
    
    // Set loading states
    setIsRunning(true);
    setOutput('');
    setExecutionStats({
      memory: '...',
      cpu: '...',
      status: 'Executing'
    });
    
    dispatch(setLoading({ 
      isLoading: true, 
      message: `Executing ${language} code in quantum environment...`, 
      style: 'terminal' 
    }));

    try {
      // Simulated execution with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate appropriate output based on language
      let simulatedOutput = '';
      let memory = (Math.random() * 5 + 1).toFixed(1) + ' MB';
      let cpu = (Math.random() * 0.2).toFixed(2) + ' ms';
      
      if (language === 'javascript') {
        simulatedOutput = '> Hello, quantum world!\n> Process completed successfully.';
      } else if (language === 'python') {
        simulatedOutput = '>>> Hello, quantum world!\n>>> Process completed successfully.';
      } else if (language === 'cpp') {
        simulatedOutput = 'Hello, quantum world!\n[Process finished with exit code 0]';
      } else if (language === 'rust') {
        simulatedOutput = 'Hello, quantum world!\nCompilation successful. Program exited normally.';
      } else if (language === 'go') {
        simulatedOutput = 'Hello, quantum world!\ngo run completed successfully.';
      } else if (language === 'java') {
        simulatedOutput = 'Hello, quantum world!\nCompiled and executed successfully.';
      }
      
      simulatedOutput += `\n\n${getRandomQuantumQuote()}`;
      
      setOutput(simulatedOutput);
      setExecutionStats({
        memory,
        cpu,
        status: 'Completed'
      });
    } catch (error) {
      setOutput(`Error: ${error.message || 'An unexpected error occurred'}`);
      setExecutionStats({
        memory: '0.0 MB',
        cpu: '0.00 ms',
        status: 'Error'
      });
    } finally {
      setIsRunning(false);
      dispatch(resetLoading());
    }
  };

  // Random quantum computing quotes
  const getRandomQuantumQuote = () => {
    const quotes = [
      "// Quantum computation is... a distinctively new way of harnessing nature.",
      "// In quantum computing, entanglement is not a bug but a feature.",
      "// The quantum computer is not just a faster classical computer.",
      "// Quantum isn't about being in multiple states, it's about efficiency.",
      "// Quantum advantage: when classical simulation becomes impossible."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate saving code
  const handleSaveCode = async () => {
    setSaveStatus('saving');
    dispatch(setLoading({ isLoading: true, message: 'Saving to quantum storage...', style: 'terminal' }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      dispatch(resetLoading());
    }
  };

  // Clear code
  const handleClearCode = () => {
    setCode('// Write your code here');
    setOutput('');
    setExecutionStats({
      memory: '0.0 MB',
      cpu: '0.00 ms',
      status: 'Ready'
    });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Run code with Ctrl+Enter or Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
      
      // Save with Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveCode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language]);

  return (
    <div className="min-h-screen bg-black text-gray-100 relative overflow-hidden font-mono pt-16">
      {/* Loading overlay */}
      <LoadingOverlay 
        isLoading={loadingState.isLoading} 
        message={loadingState.message} 
        style={loadingState.style} 
      />
      
      {/* Cyber Perspective Grid Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="perspective-grid"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="inline-block relative">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">QUANTUM</span>
              <span className="text-gray-300"> COMPILER</span>
            </h1>
            <div className="absolute -top-3 -right-6 bg-green-500 text-black text-xs px-2 py-0.5 rounded-lg transform rotate-12 font-bold">v3.0</div>
          </div>
          <p className="text-green-500/80 mt-2 text-lg max-w-xl mx-auto">
            Next-generation code execution in a quantum-enhanced environment
          </p>
        </header>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Code Editor Section */}
          <div className="lg:col-span-3 relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 blur-md -m-0.5"></div>
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800 relative">
              {/* Editor Toolbar */}
              <div className="flex items-center justify-between p-3 border-b border-gray-800/80">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  
                  <select 
                    className="bg-gray-800 text-green-400 rounded-md px-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {languageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <div className="hidden md:block text-xs text-gray-500 bg-gray-800/70 px-2 py-1 rounded-md">
                    {theme === 'dark' ? '● Dark' : '○ Light'}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    onClick={handleClearCode}
                    title="Clear code"
                  >
                    <Trash size={16} />
                  </button>
                  
                  <button 
                    className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    onClick={handleCopyCode}
                    title="Copy code"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                  
                  <button 
                    className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    onClick={handleSaveCode}
                    title="Save code"
                  >
                    {saveStatus === 'saved' ? (
                      <Check size={16} className="text-green-500" />
                    ) : saveStatus === 'saving' ? (
                      <RefreshCcw size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Code Editor */}
              <div className="relative">
                <div className="absolute left-0 top-0 h-full w-10 bg-gray-800/50 flex flex-col items-center pt-2 text-xs text-gray-500">
                  {Array.from({ length: code.split('\n').length }, (_, i) => (
                    <div key={i} className="leading-6">{i + 1}</div>
                  ))}
                </div>
                <textarea 
                  className="w-full h-[60vh] bg-gray-900/90 text-gray-200 font-mono text-sm p-2 pl-10 border-0 focus:outline-none focus:ring-0 resize-none leading-6"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck="false"
                  placeholder="Write your code here..."
                />
              </div>
              
              {/* Editor Footer */}
              <div className="border-t border-gray-800/80 p-3 flex justify-between items-center text-xs">
                <div className="text-gray-500">
                  {code.split('\n').length} lines | {code.length} characters
                </div>
                <div className="text-gray-500">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700">Enter</kbd> to run
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-4 flex justify-end">
              <CustomButton 
                variant="create"
                onClick={handleRunCode}
                isLoading={isRunning}
                disabled={isRunning || code.trim() === ''}
                size="lg"
                className="w-full md:w-auto"
              >
                <Play size={16} className="mr-2" />
                {isRunning ? 'Executing...' : 'Execute Code'}
              </CustomButton>
            </div>
          </div>
          
          {/* Output Section */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-blue-500/10 blur-md -m-0.5"></div>
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800 relative h-full">
              {/* Output Header */}
              <div className="p-3 border-b border-gray-800/80 flex justify-between items-center">
                <div className="flex items-center">
                  <h2 className="text-sm font-medium text-green-400 mr-2">Console Output</h2>
                  <div className={`h-2 w-2 rounded-full ${
                    isRunning ? 'bg-yellow-500 animate-pulse' : 
                    executionStats.status === 'Completed' ? 'bg-green-500' : 
                    executionStats.status === 'Error' ? 'bg-red-500' : 
                    'bg-gray-500'
                  }`}></div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {executionStats.status}
                </div>
              </div>
              
              {/* Output Content */}
              <div className="p-4">
                <div className="w-full h-[37vh] bg-black/70 text-green-400 font-mono text-sm p-4 rounded-md border border-gray-800/50 overflow-auto">
                  {isRunning ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                      <span>Executing code...</span>
                    </div>
                  ) : output ? (
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="text-gray-600 flex flex-col space-y-2">
                      <span>// Output will display here</span>
                      <span>// Ready to execute code...</span>
                      <span className="text-xs mt-2 text-gray-700">Hint: Try writing some code and click 'Execute Code'</span>
                    </div>
                  )}
                </div>
                
                {/* Statistics Panel */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="bg-black/30 border border-gray-800/50 rounded-md p-3 flex items-center">
                    <Box size={14} className="text-green-500 mr-2" />
                    <div>
                      <div className="text-xs text-gray-500">Memory</div>
                      <div className="text-green-400 font-medium">{executionStats.memory}</div>
                    </div>
                  </div>
                  <div className="bg-black/30 border border-gray-800/50 rounded-md p-3 flex items-center">
                    <Cpu size={14} className="text-green-500 mr-2" />
                    <div>
                      <div className="text-xs text-gray-500">CPU</div>
                      <div className="text-green-400 font-medium">{executionStats.cpu}</div>
                    </div>
                  </div>
                  <div className="bg-black/30 border border-gray-800/50 rounded-md p-3 flex items-center">
                    <Activity size={14} className="text-green-500 mr-2" />
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className={`font-medium ${
                        executionStats.status === 'Completed' ? 'text-green-400' : 
                        executionStats.status === 'Error' ? 'text-red-400' : 
                        executionStats.status === 'Executing' ? 'text-yellow-400' : 
                        'text-gray-400'
                      }`}>
                        {executionStats.status}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* History Panel */}
                {codeHistory.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs text-gray-500 mb-2">Recent Executions</h3>
                    <div className="text-xs bg-black/30 border border-gray-800/50 rounded-md p-2 max-h-24 overflow-y-auto">
                      {codeHistory.map((historyItem, idx) => (
                        <div 
                          key={idx} 
                          className="p-1 hover:bg-gray-800/30 rounded cursor-pointer flex items-center"
                          onClick={() => setCode(historyItem)}
                        >
                          <span className="text-gray-500 mr-2">{idx + 1}.</span>
                          <span className="truncate text-gray-400">{historyItem.substring(0, 40)}{historyItem.length > 40 ? '...' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 border border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full"></div>
            <h3 className="text-green-400 font-medium mb-2">Quantum Acceleration</h3>
            <p className="text-gray-400 text-sm">Harness the power of quantum computing for blazing fast code execution and enhanced capabilities.</p>
          </div>
          
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 border border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full"></div>
            <h3 className="text-blue-400 font-medium mb-2">Multi-language Support</h3>
            <p className="text-gray-400 text-sm">Execute code in JavaScript, Python, C++, Rust, Go, and Java with real-time compilation.</p>
          </div>
          
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 border border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full"></div>
            <h3 className="text-purple-400 font-medium mb-2">Secure Environment</h3>
            <p className="text-gray-400 text-sm">All code executes in an isolated quantum sandbox with advanced cryptographic security.</p>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-8 text-center text-gray-600 text-xs border-t border-gray-800/50 pt-4">
          <p>QUANTUM COMPILER v3.0 • Neural Environment • 2025 Edition</p>
          <p className="mt-1">Keyboard shortcuts: Ctrl+Enter to run • Ctrl+S to save</p>
        </footer>
      </div>
      
      {/* CSS for the perspective grid background */}
      <style jsx>{`
        .perspective-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #000;
          overflow: hidden;
          transform-style: preserve-3d;
        }
        
        .perspective-grid:before {
          content: '';
          position: absolute;
          top: -100%;
          left: -100%;
          width: 300%;
          height: 300%;
          background-image: 
            linear-gradient(rgba(0, 255, 128, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 128, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          transform: perspective(500px) rotateX(60deg);
          animation: gridFlowForward 30s linear infinite;
        }
        
        .perspective-grid:after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, transparent 0%, #000 90%);
        }
        
        @keyframes gridFlowForward {
          0% {
            transform: perspective(500px) rotateX(60deg) translateY(0);
          }
          100% {
            transform: perspective(500px) rotateX(60deg) translateY(50px);
          }
        }

        /* Syntax highlighting animation */
        @keyframes highlight {
          0% { background-color: rgba(76, 175, 80, 0.2); }
          100% { background-color: transparent; }
        }
      `}</style>
    </div>
  );
};

export default Compiler;