import React from 'react';

const AccessDenied = ({ darkMode, message }) => {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      background: darkMode ? '#1f2937' : 'white',
      borderRadius: '12px',
      margin: '2rem'
    }}>
      <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>🚫 Access Denied</h2>
      <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
        {message || "You don't have permission to access this page."}
      </p>
    </div>
  );
};

export default AccessDenied;