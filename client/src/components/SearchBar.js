import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight } from 'lucide-react';

const SearchBar = ({
  darkMode = false,
  searchTerm,
  setSearchTerm,
  searchResults = [],
  onNavigate = () => {},
  currentUser = null
}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // Reset focus index whenever results change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchResults]);

  // Keyboard navigation (arrow up / down, enter)
  const handleKeyDown = (e) => {
    if (!searchResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0) {
        e.preventDefault();
        onNavigate(searchResults[focusedIndex].id);
      }
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  // Get role-based placeholder text
  const getPlaceholderText = () => {
    const role = currentUser?.role;
    switch (role) {
      case 'sales':
        return 'Search my leads, customers, or tasks...';
      case 'manager':
        return 'Search team leads, customers, or reports...';
      case 'admin':
      case 'senior-manager':
        return 'Search leads, customers, users, or analytics...';
      case 'super-admin':
        return 'Search all data, users, or system settings...';
      default:
        return 'Search leads, customers, or tasks...';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (focusedIndex >= 0 && searchResults[focusedIndex]) {
      onNavigate(searchResults[focusedIndex].id);
    }
  }

  return (
        <div style={{ position: 'relative', maxWidth: '400px', width: '100%' }} ref={dropdownRef}>
      <Search size={20} style={{
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9ca3af'
      }} />
              <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={getPlaceholderText()}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 3rem',
            border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '12px',
            background: darkMode ? '#374151' : '#f9fafb',
            color: darkMode ? 'white' : '#1f2937',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#22c55e'}
          onBlur={(e) => e.target.style.borderColor = darkMode ? '#374151' : '#e5e7eb'}
        />
      </form>

        {/* Suggestions dropdown */}
        {searchResults.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: '105%',
            left: 0,
            width: '100%',
            background: darkMode ? '#1f2937' : 'white',
            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '12px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 50,
            boxShadow: darkMode ? '0 4px 14px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.1)',
            listStyle: 'none',
            margin: 0,
            padding: 0
          }}>
            {searchResults.map((item, idx) => (
              <li
                key={`${item.type}-${item.id}`}
                onClick={() => onNavigate(item.id)}
                onMouseEnter={() => setFocusedIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  background: idx === focusedIndex ? (darkMode ? '#374151' : '#f3f4f6') : 'transparent',
                  color: darkMode ? '#f9fafb' : '#111827',
                  borderBottom: idx < searchResults.length - 1 ? `1px solid ${darkMode ? '#374151' : '#f3f4f6'}` : 'none',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  {item.icon && <item.icon size={18} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: darkMode ? '#f9fafb' : '#111827'
                    }}>
                      {item.name}
                    </div>
                    {item.subtitle && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        marginTop: '0.125rem'
                      }}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    background: getTypeColor(item.type, darkMode).bg,
                    color: getTypeColor(item.type, darkMode).text,
                    fontWeight: '500'
                  }}>
                    {item.type}
                  </span>
                </div>
                <ChevronRight size={16} style={{ color: darkMode ? '#6b7280' : '#9ca3af', marginLeft: '0.5rem' }} />
              </li>
            ))}
          </ul>
        )}
        
        {/* No results message */}
        {searchTerm.trim() !== '' && searchResults.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '105%',
            left: 0,
            width: '100%',
            background: darkMode ? '#1f2937' : 'white',
            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '12px',
            padding: '1rem',
            zIndex: 50,
            boxShadow: darkMode ? '0 4px 14px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.1)',
            textAlign: 'center',
            color: darkMode ? '#9ca3af' : '#6b7280',
            fontSize: '0.875rem'
          }}>
            No results found for "{searchTerm}"
          </div>
        )}
      </div>
  );
};

// Helper function to get type-specific colors
const getTypeColor = (type, darkMode) => {
  const colors = {
    'Lead': {
      bg: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
      text: '#22c55e'
    },
    'Customer': {
      bg: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
      text: '#3b82f6'
    },
    'Employee': {
      bg: darkMode ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
      text: '#a855f7'
    },
    'Section': {
      bg: darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
      text: '#f59e0b'
    },
    'Action': {
      bg: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
      text: '#ef4444'
    }
  };
  
  return colors[type] || {
    bg: darkMode ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.1)',
    text: darkMode ? '#9ca3af' : '#6b7280'
  };
};

export default SearchBar;