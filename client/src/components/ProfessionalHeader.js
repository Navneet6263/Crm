import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown
} from 'lucide-react';

const ProfessionalHeader = ({ user, onLogout, darkMode, setActiveView }) => {
  const [showProfile, setShowProfile] = useState(false);

  const getRoleColor = (role) => {
    switch (role) {
      case 'super-admin': return '#ef4444';
      case 'admin': return '#8b5cf6';
      case 'sales-manager': return '#3b82f6';
      case 'sales-rep': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super-admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'sales-manager': return 'Sales Manager';
      case 'sales-rep': return 'Sales Rep';
      default: return 'User';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowProfile(!showProfile)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem',
          background: darkMode ? '#374151' : '#f3f4f6',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #22c55e, #4ade80)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '600',
          fontSize: '1rem'
        }}>
          {user?.name?.charAt(0) || 'U'}
        </div>
        
        <div style={{ textAlign: 'left' }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937'
          }}>
            {user?.name || 'User'}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: getRoleColor(user?.role),
            fontWeight: '500'
          }}>
            {getRoleLabel(user?.role)}
          </div>
        </div>
        
        <ChevronDown size={16} style={{
          color: darkMode ? '#9ca3af' : '#6b7280',
          transform: showProfile ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }} />
      </button>

      {/* Profile Dropdown */}
      {showProfile && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          width: '250px',
          background: darkMode ? '#1f2937' : 'white',
          border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          zIndex: 1000
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
          }}>
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '0.25rem'
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              {user?.email || 'user@greencall.com'}
            </div>
            <div style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.75rem',
              background: `${getRoleColor(user?.role)}20`,
              color: getRoleColor(user?.role),
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              {getRoleLabel(user?.role)}
            </div>
          </div>

          <div style={{ padding: '0.5rem' }}>
            {[
              { icon: User, label: 'My Profile', action: () => setActiveView('settings') },
              { icon: Settings, label: 'Settings', action: () => setActiveView('settings') }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setShowProfile(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.875rem',
                    color: darkMode ? '#d1d5db' : '#374151',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = darkMode ? '#374151' : '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div style={{
            padding: '0.5rem',
            borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
          }}>
            <button
              onClick={() => {
                onLogout();
                setShowProfile(false);
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.875rem',
                color: '#ef4444',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#fee2e2'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showProfile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};

export default ProfessionalHeader;