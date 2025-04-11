// components/ui/BitCodeLoading.jsx
import React, { useState, useEffect } from 'react';
import './LoadingAnimation.css';

const LoadingAnimation = ({ 
  size = 'medium', 
  message = 'Loading...', 
  showBackground = true,
  progress = null,
  style = 'default' // 'default', 'battle', 'compile', 'terminal'
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
    xlarge: 'w-40 h-40',
    xxlarge: 'w-48 h-48'
  };

  const sizeClass = sizeClasses[size];
  
  // Customize progress message if provided
  const displayMessage = progress !== null 
    ? `${message} ${Math.round(progress)}%` 
    : message;

  // Render different animation styles
  const renderAnimationContent = () => {
    switch(style) {
      case 'battle':
        return renderBattleStyle();
      case 'compile':
        return renderCompileStyle();
      case 'terminal':
        return renderTerminalStyle();
      default:
        return renderDefaultStyle();
    }
  };

  // Default style with hexagon logo
  const renderDefaultStyle = () => (
    <>
      {/* Rotating outer hexagon */}
      <polygon 
        points="50,5 87,25 87,75 50,95 13,75 13,25" 
        className="hexagon-path"
      />
      
      {/* Inner hexagon */}
      <polygon 
        points="50,20 73,35 73,65 50,80 27,65 27,35" 
        className="hexagon-inner"
      />
      
      {/* Binary pulses */}
      <g className="binary-group">
        <text x="35" y="35" className="binary binary-1">01</text>
        <text x="65" y="35" className="binary binary-2">10</text>
        <text x="50" y="55" className="binary binary-3">11</text>
        <text x="35" y="70" className="binary binary-4">00</text>
        <text x="65" y="70" className="binary binary-5">01</text>
      </g>
      
      {/* BitCode logo */}
      <g className="bitcode-logo">
        <path d="M40,45 L45,40 L60,40 L60,60 L45,60 L40,55 Z" className="logo-shape" />
        <circle cx="50" cy="50" r="2" className="logo-dot" />
        <circle cx="43" cy="43" r="2" className="logo-dot" />
        <circle cx="57" cy="57" r="2" className="logo-dot" />
        <path d="M43,43 L50,50 L57,57" className="logo-circuit" strokeWidth="1" />
      </g>
      
      {/* Pulse rings */}
      <circle cx="50" cy="50" r="30" className="pulse-ring pulse-ring-1" />
      <circle cx="50" cy="50" r="40" className="pulse-ring pulse-ring-2" />
    </>
  );

  // Battle mode style
  const renderBattleStyle = () => (
    <>
      {/* VS background */}
      <rect x="10" y="35" width="30" height="30" className="battle-box battle-box-left" />
      <rect x="60" y="35" width="30" height="30" className="battle-box battle-box-right" />
      <text x="50" y="55" className="vs-text">VS</text>
      
      {/* Energy bars */}
      <rect x="15" y="70" width="30" height="5" className="energy-bar energy-bar-left" />
      <rect x="55" y="70" width="30" height="5" className="energy-bar energy-bar-right" />
      
      {/* Battle indicators */}
      <line x1="10" y1="20" x2="90" y2="20" className="battle-line" />
      <line x1="10" y1="80" x2="90" y2="80" className="battle-line" />
      
      {/* Rotating battle icons */}
      <g className="battle-icons">
        <path d="M25,45 L30,40 L40,40 L40,55 L30,55 L25,50 Z" className="code-icon code-icon-left" />
        <path d="M75,45 L70,40 L60,40 L60,55 L70,55 L75,50 Z" className="code-icon code-icon-right" />
      </g>
      
      {/* Battle sparks */}
      <circle cx="50" cy="50" r="2" className="battle-spark battle-spark-1" />
      <circle cx="45" cy="45" r="1" className="battle-spark battle-spark-2" />
      <circle cx="55" cy="55" r="1" className="battle-spark battle-spark-3" />
      <circle cx="45" cy="55" r="1" className="battle-spark battle-spark-4" />
      <circle cx="55" cy="45" r="1" className="battle-spark battle-spark-5" />
    </>
  );

  // Compile style animation
  const renderCompileStyle = () => (
    <>
      {/* Code blocks that compile */}
      <g className="code-blocks">
        <rect x="15" y="15" width="15" height="8" className="code-block code-block-1" />
        <rect x="35" y="15" width="30" height="8" className="code-block code-block-2" />
        <rect x="70" y="15" width="15" height="8" className="code-block code-block-3" />
        
        <rect x="15" y="28" width="25" height="8" className="code-block code-block-4" />
        <rect x="45" y="28" width="15" height="8" className="code-block code-block-5" />
        <rect x="65" y="28" width="20" height="8" className="code-block code-block-6" />
        
        <rect x="15" y="41" width="10" height="8" className="code-block code-block-7" />
        <rect x="30" y="41" width="40" height="8" className="code-block code-block-8" />
        <rect x="75" y="41" width="10" height="8" className="code-block code-block-9" />
      </g>
      
      {/* Progress bar */}
      <rect x="15" y="60" width="70" height="8" className="progress-bar-bg" />
      <rect x="15" y="60" width="0" height="8" className="progress-bar-fill">
        <animate 
          attributeName="width" 
          from="0" 
          to="70" 
          dur="3s" 
          repeatCount="indefinite" 
        />
      </rect>
      
      {/* Processing indicators */}
      <g className="processing-indicators">
        <circle cx="25" cy="78" r="3" className="indicator indicator-1" />
        <circle cx="40" cy="78" r="3" className="indicator indicator-2" />
        <circle cx="55" cy="78" r="3" className="indicator indicator-3" />
        <circle cx="70" cy="78" r="3" className="indicator indicator-4" />
      </g>
    </>
  );

  // Terminal style with typing effect
  const renderTerminalStyle = () => (
    <>
      {/* Terminal window */}
      <rect x="10" y="10" width="80" height="80" className="terminal-window" />
      <rect x="10" y="10" width="80" height="10" className="terminal-header" />
      
      {/* Terminal controls */}
      <circle cx="15" cy="15" r="2" className="terminal-control terminal-control-1" />
      <circle cx="22" cy="15" r="2" className="terminal-control terminal-control-2" />
      <circle cx="29" cy="15" r="2" className="terminal-control terminal-control-3" />
      
      {/* Terminal text */}
      <text x="15" y="30" className="terminal-text terminal-text-1">$ bitcode compile</text>
      <text x="15" y="42" className="terminal-text terminal-text-2">{">"} loading modules...</text>
      <text x="15" y="54" className="terminal-text terminal-text-3">{">"} installing deps...</text>
      <text x="15" y="66" className="terminal-text terminal-text-4">{">"} initializing battle...</text>
      
      {/* Cursor blink */}
      <rect x="15" y="75" width="5" height="2" className="terminal-cursor" />
    </>
  );

  // Progress bar component
  const ProgressBar = () => {
    if (progress === null) return null;
    
    return (
      <div className="bitcode-progress-container">
        <div className="bitcode-progress-bar">
          <div 
            className="bitcode-progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="bitcode-progress-value">{Math.round(progress)}%</div>
      </div>
    );
  };

  return (
    <div className="bitcode-loading-container">
      <div className={`bitcode-loading-animation ${sizeClass}`}>
        <svg 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg"
          className="bitcode-loader"
        >
          {/* Semi-transparent backdrop (optional) */}
          {showBackground && (
            <rect 
              x="0" y="0" 
              width="100" height="100" 
              rx="10" ry="10" 
              className="bitcode-backdrop" 
            />
          )}
          
          {renderAnimationContent()}
        </svg>
      </div>
      {displayMessage && <p className="bitcode-loading-message">{displayMessage}</p>}
      <ProgressBar />
    </div>
  );
};

// Enhanced component with progress tracking
const BitCodeProgressLoading = ({ 
  initialMessage = 'Initializing BitCode', 
  size = 'large',
  showBackground = true,
  style = 'default',
  duration = 5000, // total loading duration in ms
  onComplete = () => {},
  showStages = true
}) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(initialMessage);
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    // Custom messages based on progress
    const stages = [
      { threshold: 0, text: 'Initializing BitCode' },
      { threshold: 15, text: 'Loading code libraries' },
      { threshold: 30, text: 'Compiling battle arena' },
      { threshold: 45, text: 'Synchronizing servers' },
      { threshold: 60, text: 'Deploying test cases' },
      { threshold: 75, text: 'Matching opponents' },
      { threshold: 90, text: 'Preparing battle environment' },
      { threshold: 100, text: 'Ready for battle!' }
    ];
    
    // Simulate progress updates
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(100, (elapsed / duration) * 100);
      
      setProgress(calculatedProgress);
      
      if (showStages) {
        // Update message based on progress
        const currentStageIndex = stages
          .findIndex((s, i) => {
            const nextStage = stages[i + 1];
            return !nextStage || nextStage.threshold > calculatedProgress;
          });
          
        if (currentStageIndex !== stage) {
          setStage(currentStageIndex);
          setMessage(stages[currentStageIndex].text);
        }
      }
      
      if (calculatedProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => onComplete(), 1000);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [duration, onComplete, initialMessage, showStages, stage]);
  
  return (
    <BitCodeLoading 
      message={message}
      progress={progress}
      size={size}
      showBackground={showBackground}
      style={style}
    />
  );
};

// Component that cycles through animation styles
const CyclingBitCodeLoading = (props) => {
  const styles = ['default', 'battle', 'compile', 'terminal'];
  const [currentStyle, setCurrentStyle] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStyle((prev) => (prev + 1) % styles.length);
    }, 3000); // Change style every 3 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return <BitCodeLoading {...props} style={styles[currentStyle]} />;
};

export { 
LoadingAnimation as default, 
  BitCodeProgressLoading, 
  CyclingBitCodeLoading 
};