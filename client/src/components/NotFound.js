import React from 'react';
import { ArrowLeft } from 'lucide-react';

const NotFound = ({ darkMode = false, onGoHome }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: darkMode ? '#111827' : '#f9fafb',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <div style={{
          fontSize: '120px',
          fontWeight: 'bold',
          color: darkMode ? '#374151' : '#e5e7eb',
          marginBottom: '1rem'
        }}>
          404
        </div>
        
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: darkMode ? 'white' : '#111827',
          marginBottom: '1rem'
        }}>
          Page Not Found
        </h1>
        
        <p style={{
          fontSize: '1.125rem',
          color: darkMode ? '#9ca3af' : '#6b7280',
          marginBottom: '2rem'
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <button
          onClick={onGoHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #22c55e, #4ade80)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <ArrowLeft size={20} />
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;