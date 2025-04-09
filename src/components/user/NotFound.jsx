import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Enhanced "Broken Code" SVG Icon with animation
const BrokenCodeIcon = () => (
  <motion.svg
    width="120"
    height="120"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
    initial={{ opacity: 0.8 }}
    animate={{ 
      opacity: [0.8, 1, 0.8],
      scale: [1, 1.05, 1]
    }}
    transition={{ 
      duration: 3, 
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <motion.path
      d="M5 5v14M7 5v5M7 14v5" // Left brace part
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.2 }}
    />
    <motion.path
      d="M19 5v5M19 14v5M17 5v14" // Right brace part
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.2 }}
    />
    <motion.path
      d="M9 12h6" // Crack line through the middle
      strokeWidth="2"
      strokeDasharray="2"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.7, delay: 1.7 }}
    />
  </motion.svg>
);

// Terminal glitch text effect for 404
const GlitchText = ({ children }) => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        className="absolute text-red-500 opacity-30"
        style={{ textShadow: '0 0 5px rgba(239, 68, 68, 0.7)' }}
        animate={{ 
          x: [-1, 1, 0, -1, 0], 
          y: [0, -1, 1, 0, -1] 
        }}
        transition={{ 
          duration: 0.5, 
          repeat: Infinity, 
          repeatType: "reverse" 
        }}
      >
        {children}
      </motion.span>
      <span className="text-green-500" style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }}>
        {children}
      </span>
    </motion.div>
  );
};

// Console-like typing animation
const TypingText = ({ text }) => {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      transition={{ duration: 1.5, delay: 0.5 }}
      className="overflow-hidden whitespace-nowrap mx-auto"
    >
      <span className="text-gray-300 border-r-2 border-green-500 pr-1">
        {text}
      </span>
    </motion.div>
  );
};

const NotFound = () => {
  return (
    <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center p-4">
      <div className="relative text-center p-6 w-full max-w-md">
        {/* Background Matrix-like effect */}
        <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-500 text-xs"
              initial={{ 
                top: -20, 
                left: Math.random() * 100 + '%',
                opacity: 0.3 + Math.random() * 0.7
              }}
              animate={{ 
                top: '100%'
              }}
              transition={{ 
                duration: 5 + Math.random() * 10, 
                repeat: Infinity, 
                ease: 'linear',
                delay: Math.random() * 5
              }}
            >
              {[...Array(Math.floor(Math.random() * 10) + 5)].map((_, j) => (
                <div key={j}>{Math.random() > 0.5 ? '1' : '0'}</div>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Centered Broken Code Icon */}
        <div className="mb-8 flex justify-center">
          <BrokenCodeIcon />
        </div>

        {/* 404 Text with Glitch Effect */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-wide">
          <GlitchText>404</GlitchText>
        </h1>

        {/* Subtext Tailored to Coding Battle with typing effect */}
        <div className="h-8 mb-2 flex justify-center">
          <TypingText text="Code Not Found!" />
        </div>
        
        <p className="text-gray-400 mb-8 px-4">
          Your syntax broke the battlefield. Retreat and try again!
        </p>

        {/* Terminal-like error message */}
        <div className="mb-8 mx-auto max-w-sm bg-gray-900 p-3 rounded border border-gray-700 text-left">
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
            <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            <span className="ml-1">terminal</span>
          </div>
          <div className="font-mono text-xs text-left">
            <p className="text-green-500">$ find /path</p>
            <p className="text-red-400">Error: Path not found in codebase</p>
            <p className="text-green-500">$ navigate --home</p>
            <motion.div 
              className="inline-block h-4 w-2 bg-green-500"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </div>

        {/* Enhanced Neon Button with Sliding Animation */}
        <Link to="/">
          <motion.button
            className="relative px-8 py-3 bg-transparent border-2 border-green-500 text-green-500 font-semibold rounded-lg overflow-hidden group"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 15px rgba(34, 197, 94, 0.7)',
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className="relative z-10 group-hover:text-black transition-colors duration-300">Go Home</span>
            <motion.div
              className="absolute inset-0 bg-green-500 opacity-20 group-hover:opacity-100 transition-opacity duration-300"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            />
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;