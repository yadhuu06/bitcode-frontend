import React, { useState } from 'react';

const Compiler = () => {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello, quantum world!");');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = () => {
    setIsRunning(true);
    
    // Simulate code execution
    setTimeout(() => {
      let simulatedOutput = '';
      
      if (language === 'javascript') {
        simulatedOutput = '> Hello, quantum world!\n> Process completed in 0.12s';
      } else if (language === 'python') {
        simulatedOutput = '>>> Hello, quantum world!\n>>> Process completed in 0.09s';
      } else if (language === 'cpp') {
        simulatedOutput = 'Hello, quantum world!\n[Process finished with exit code 0 in 0.15s]';
      } else if (language === 'rust') {
        simulatedOutput = 'Hello, quantum world!\nFinished in 0.07s';
      }
      
      setOutput(simulatedOutput);
      setIsRunning(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 relative overflow-hidden font-mono pt-20">
      {/* Cyber Perspective Grid Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="perspective-grid"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">BIT CODE</span>
            <span className="text-gray-300"> COMPILER</span>
          </h1>
          <p className="text-green-500/80 mt-3 text-lg">
            Quantum-powered code execution environment
          </p>
        </header>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Code Editor Section - 3/5 width on large screens */}
          <div className="lg:col-span-3 relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-700/20 blur-sm -m-0.5"></div>
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800 relative">
              <div className="flex items-center justify-between p-4 border-b border-gray-800/80">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  
                  <select 
                    className="bg-gray-800 text-green-400 rounded-md px-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>
                
                <button 
                  className="px-4 py-1.5 rounded-md bg-green-600 text-black font-medium flex items-center space-x-2 hover:bg-green-500 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 disabled:opacity-70 text-sm"
                  onClick={handleRunCode}
                  disabled={isRunning}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>{isRunning ? 'Executing...' : 'Run'}</span>
                </button>
              </div>
              
              <div className="p-4">
                <div className="relative">
                  <div className="absolute left-0 top-0 h-full w-10 bg-gray-800/50 flex flex-col items-center pt-2 text-xs text-gray-500">
                    {Array.from({ length: 15 }, (_, i) => (
                      <div key={i} className="leading-6">{i + 1}</div>
                    ))}
                  </div>
                  <textarea 
                    className="w-full h-[50vh] bg-gray-900/70 text-gray-200 font-mono text-sm p-2 pl-10 border-0 focus:outline-none focus:ring-0 resize-none leading-6"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck="false"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Output Section - 2/5 width on large screens */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-600/10 to-green-500/10 blur-sm -m-0.5"></div>
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800 relative h-full">
              <div className="p-4 border-b border-gray-800/80 flex justify-between items-center">
                <h2 className="text-sm font-medium text-green-400">Console Output</h2>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              
              <div className="p-4">
                <div className="w-full h-[40vh] bg-black/50 text-green-400 font-mono text-sm p-4 rounded-md border border-gray-800/50 overflow-auto">
                  {isRunning ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                      <span>Executing code...</span>
                    </div>
                  ) : output ? (
                    <pre>{output}</pre>
                  ) : (
                    <div className="text-gray-600 flex flex-col space-y-2">
                      <span>// Output will display here</span>
                      <span>// Ready to run...</span>
                    </div>
                  )}
                </div>
                
                {/* Statistics Panel */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="bg-black/30 border border-gray-800/50 rounded-md p-3">
                    <div className="text-xs text-gray-500">Memory</div>
                    <div className="text-green-400 font-medium">3.2 MB</div>
                  </div>
                  <div className="bg-black/30 border border-gray-800/50 rounded-md p-3">
                    <div className="text-xs text-gray-500">CPU</div>
                    <div className="text-green-400 font-medium">0.02 ms</div>
                  </div>
                  <div className="bg-black/30 border border-gray-800/50 rounded-md p-3">
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="text-green-400 font-medium">Idle</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-10 text-center text-gray-600 text-xs">
          <p>BIT CODE COMPILER v2.4.1 • Quantum Environment • Cybersecurity Enhanced</p>
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
            linear-gradient(rgba(0, 255, 128, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 128, 0.07) 1px, transparent 1px);
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
      `}</style>
    </div>
  );
};

export default Compiler;