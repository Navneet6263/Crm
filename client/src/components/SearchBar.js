import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight } from 'lucide-react';

const SearchBar = ({
  darkMode = false,
  searchTerm,
  setSearchTerm,
  searchResults = [],
  onNavigate = () => {}
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
          placeholder="Search leads, customers, or tasks..."
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
            boxShadow: darkMode ? '0 4px 14px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.1)'
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
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  background: idx === focusedIndex ? (darkMode ? '#374151' : '#f3f4f6') : 'transparent',
                  color: darkMode ? '#f9fafb' : '#111827'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.icon && <item.icon size={16} />}
                  {item.name}
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0 0.35rem',
                    borderRadius: '4px',
                    background: darkMode ? '#111827' : '#e5e7eb',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    {item.type}
                  </span>
                </span>
                <ChevronRight size={16} />
              </li>
            ))}
          </ul>
        )}
      </div>
  );
};

export default SearchBar;