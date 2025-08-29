import React from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

const NavigationControls = ({ navigationState, onGoBack, onRefresh, darkMode }) => {
  const controlsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const buttonStyle = (disabled = false) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    background: disabled 
      ? (darkMode ? '#374151' : '#f3f4f6')
      : (darkMode ? '#4b5563' : '#e5e7eb'),
    color: disabled 
      ? (darkMode ? '#6b7280' : '#9ca3af')
      : (darkMode ? '#d1d5db' : '#374151'),
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1
  });

  const handleMouseEnter = (e, disabled) => {
    if (!disabled) {
      e.target.style.background = darkMode ? '#6b7280' : '#d1d5db';
      e.target.style.transform = 'scale(1.05)';
    }
  };

  const handleMouseLeave = (e, disabled) => {
    if (!disabled) {
      e.target.style.background = darkMode ? '#4b5563' : '#e5e7eb';
      e.target.style.transform = 'scale(1)';
    }
  };

  return (
    <div style={controlsStyle}>
      {/* Back Button */}
      <button
        style={buttonStyle(!navigationState.canGoBack)}
        onClick={navigationState.canGoBack ? onGoBack : undefined}
        disabled={!navigationState.canGoBack}
        title={navigationState.canGoBack ? 'Go Back' : 'No previous page'}
        onMouseEnter={(e) => handleMouseEnter(e, !navigationState.canGoBack)}
        onMouseLeave={(e) => handleMouseLeave(e, !navigationState.canGoBack)}
      >
        <ArrowLeft size={16} />
      </button>

      {/* Refresh Button */}
      <button
        style={buttonStyle(false)}
        onClick={onRefresh}
        title="Refresh current page"
        onMouseEnter={(e) => handleMouseEnter(e, false)}
        onMouseLeave={(e) => handleMouseLeave(e, false)}
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
};

export default NavigationControls;