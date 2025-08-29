import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleDarkMode();
    
    // Reset animation after it completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        background: 'transparent',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${isAnimating ? '360deg' : '0deg'})`,
          opacity: darkMode ? 0 : 1,
          transition: 'transform 0.5s ease, opacity 0.3s ease',
        }}
      >
        <Sun size={24} color={darkMode ? '#9ca3af' : '#f59e0b'} />
      </div>
      
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${isAnimating ? '360deg' : '0deg'})`,
          opacity: darkMode ? 1 : 0,
          transition: 'transform 0.5s ease, opacity 0.3s ease',
        }}
      >
        <Moon size={24} color={darkMode ? '#f3f4f6' : '#6b7280'} />
      </div>
    </button>
  );
};

export default ThemeToggle;