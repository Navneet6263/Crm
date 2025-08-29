import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react';

let toastId = 0;

const ToastNotification = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Listen for custom toast events
    const handleToast = (event) => {
      const { type, message, duration = 4000 } = event.detail;
      const id = ++toastId;
      
      const newToast = {
        id,
        type,
        message,
        duration
      };
      
      setToasts(prev => [...prev, newToast]);
      
      // Auto remove after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    };

    window.addEventListener('showToast', handleToast);
    return () => window.removeEventListener('showToast', handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <AlertCircle size={20} />;
      case 'info': return <Info size={20} />;
      case 'achievement': return <Zap size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getToastStyle = (type) => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 1.25rem',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      minWidth: '300px',
      maxWidth: '400px',
      animation: 'slideInRight 0.3s ease-out',
      position: 'relative',
      overflow: 'hidden'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9))',
          color: 'white'
        };
      case 'error':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
          color: 'white'
        };
      case 'info':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))',
          color: 'white'
        };
      case 'achievement':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9))',
          color: 'white'
        };
      default:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.9), rgba(75, 85, 99, 0.9))',
          color: 'white'
        };
    }
  };

  if (toasts.length === 0) return null;

  return (
    <>
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={getToastStyle(toast.type)}>
            {/* Shimmer effect for achievement */}
            {toast.type === 'achievement' && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'shimmer 2s infinite'
              }} />
            )}
            
            <div style={{ flexShrink: 0 }}>
              {getToastIcon(toast.type)}
            </div>
            
            <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: '500' }}>
              {toast.message}
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                flexShrink: 0
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

// Helper function to show toasts
export const showToast = (type, message, duration) => {
  const event = new CustomEvent('showToast', {
    detail: { type, message, duration }
  });
  window.dispatchEvent(event);
};

export default ToastNotification;