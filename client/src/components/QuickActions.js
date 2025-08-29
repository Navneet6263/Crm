import React from 'react';
import { Plus, Phone, Mail, Calendar } from 'lucide-react';

const QuickActions = ({ darkMode, setActiveView }) => {
  const handleQuickCall = () => {
    setActiveView('communication');
  };

  const handleSendEmail = () => {
    setActiveView('communication');
  };

  const handleScheduleMeeting = () => {
    setActiveView('calendar');
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <button
        onClick={() => setActiveView('add-enquiry')}
        style={{
          padding: '0.75rem 1rem',
          background: 'linear-gradient(135deg, #22c55e, #4ade80)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
        }}
      >
        <Plus size={16} />
        Add Lead
      </button>

      {[
        { icon: Phone, color: '#22c55e', title: 'Quick Call', action: handleQuickCall },
        { icon: Mail, color: '#3b82f6', title: 'Send Email', action: handleSendEmail },
        { icon: Calendar, color: '#8b5cf6', title: 'Schedule Meeting', action: handleScheduleMeeting }
      ].map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            title={action.title}
            onClick={action.action}
            style={{
              padding: '0.75rem',
              background: darkMode ? '#374151' : '#f3f4f6',
              color: action.color,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = action.color;
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = darkMode ? '#374151' : '#f3f4f6';
              e.target.style.color = action.color;
            }}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;