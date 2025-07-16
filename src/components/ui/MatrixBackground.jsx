import React, { useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';

const MatrixBackground = ({
  particleCount = 45,
  color = '#00FF40',
  characters = ['0', '1'],
  fontSizeRange = [10, 20],
  changeInterval = 4000, // Updated to 6 seconds
  baseOpacity = 0.6075,
  transitionDuration = 1700, // 2 seconds for slow appear/disappear
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set initial canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Generate grid of possible positions
    const gridSize = 100;
    const possiblePositions = Array.from({ length: gridSize }, (_, x) =>
      Array.from({ length: gridSize }, (_, y) => ({ x: x / gridSize, y: y / gridSize }))
    ).flat();
    let availablePositions = [...possiblePositions];
    const getUniquePosition = () => {
      if (availablePositions.length === 0) {
        availablePositions = [...possiblePositions];
        availablePositions.sort(() => Math.random() - 0.5);
      }
      const index = Math.floor(Math.random() * availablePositions.length);
      const pos = availablePositions.splice(index, 1)[0];
      return { x: pos.x * canvas.width, y: pos.y * canvas.height };
    };

    // Initialize particles with unique positions and fade state
    let particles = Array.from({ length: particleCount }, () => ({
      x: getUniquePosition().x,
      y: getUniquePosition().y,
      char: characters[Math.floor(Math.random() * characters.length)],
      fontSize: Math.random() * (fontSizeRange[1] - fontSizeRange[0]) + fontSizeRange[0],
      opacity: 0, // Start with 0 for fade-in
      fadeStartTime: performance.now(),
      fadeState: 'disappear', // 'appear' or 'disappear'
    }));

    // Animation loop
    const animate = (currentTime) => {
      // Properly clear the entire canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set a solid black background
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Reset global alpha before drawing
      ctx.globalAlpha = 1;

      // Draw particles
      particles.forEach((p) => {
        const elapsed = currentTime - p.fadeStartTime;
        let opacity = baseOpacity;

        if (p.fadeState === 'appear') {
          opacity = Math.min(baseOpacity * (elapsed / transitionDuration), baseOpacity); // Fade in to baseOpacity
          if (elapsed >= transitionDuration) {
            p.fadeState = 'stable';
          }
        } else if (p.fadeState === 'disappear') {
          opacity = Math.max(baseOpacity * ((transitionDuration - elapsed) / transitionDuration), 0); // Fade out to 0
          if (elapsed >= transitionDuration) {
            const newPos = getUniquePosition();
            p.x = newPos.x;
            p.y = newPos.y;
            p.char = characters[Math.floor(Math.random() * characters.length)];
            p.fontSize = Math.random() * (fontSizeRange[1] - fontSizeRange[0]) + fontSizeRange[0];
            p.fadeStartTime = currentTime;
            p.fadeState = 'appear';
          }
        }

        // Only draw if opacity is greater than 0
        if (opacity > 0) {
          ctx.font = `${p.fontSize}px monospace`;
          ctx.fillStyle = color;
          ctx.globalAlpha = opacity;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.char, p.x, p.y);
        }
      });

      // Check if it's time to trigger disappear for all particles
      if ((currentTime - particles[0].fadeStartTime) >= changeInterval) {
        particles.forEach((p) => {
          p.fadeStartTime = currentTime;
          p.fadeState = 'disappear';
        });
      }

      // Continue animation
      animationFrameId = requestAnimationFrame(animate);
    };

    let animationFrameId = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      resizeCanvas();
      availablePositions = [...possiblePositions];
      particles = Array.from({ length: particleCount }, () => {
        const newPos = getUniquePosition();
        return {
          x: newPos.x,
          y: newPos.y,
          char: characters[Math.floor(Math.random() * characters.length)],
          fontSize: Math.random() * (fontSizeRange[1] - fontSizeRange[0]) + fontSizeRange[0],
          opacity: 0,
          fadeStartTime: performance.now(),
          fadeState: 'disappear',
        };
      });
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount, color, characters, fontSizeRange, changeInterval, baseOpacity, transitionDuration]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 z-0 opacity-60"
      style={{ pointerEvents: 'none' }}
    />
  );
};

MatrixBackground.propTypes = {
  particleCount: PropTypes.number,
  color: PropTypes.string,
  characters: PropTypes.arrayOf(PropTypes.string),
  fontSizeRange: PropTypes.arrayOf(PropTypes.number),
  changeInterval: PropTypes.number,
  baseOpacity: PropTypes.number,
  transitionDuration: PropTypes.number,
};

export default memo(MatrixBackground);