import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, DollarSign, User, Building } from 'lucide-react';

const AdvancedSearch = ({ onSearch, onFilter, darkMode, isMobile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    assignedTo: 'all',
    dateRange: 'all',
    valueRange: 'all',
    customDateFrom: '',
    customDateTo: '',
    customValueMin: '',
    customValueMax: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Enhanced debounced search with fuzzy matching
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch({
        term: searchTerm,
        fuzzy: true,
        fields: ['companyName', 'contactPerson', 'email', 'phone', 'notes']
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  // Apply filters
  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      assignedTo: 'all',
      dateRange: 'all',
      valueRange: 'all',
      customDateFrom: '',
      customDateTo: '',
      customValueMin: '',
      customValueMax: ''
    });
    setSearchTerm('');
  };

  const cardStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    padding: isMobile ? '1rem' : '1.5rem',
    marginBottom: '1rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    background: darkMode ? '#374151' : 'white',
    color: darkMode ? 'white' : '#1f2937',
    fontSize: '1rem',
    outline: 'none'
  };

  return (
    <div style={cardStyle} className={isMobile ? 'mobile-card mobile-p-2' : ''}>
      {/* Main Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search 
          size={20} 
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: darkMode ? '#9ca3af' : '#6b7280'
          }} 
        />
        <input
          type="text"
          placeholder="Search by company, contact, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            ...inputStyle,
            paddingLeft: '2.5rem',
            fontSize: isMobile ? '16px' : '1rem' // Prevents zoom on iOS
          }}
          className={isMobile ? 'mobile-input' : ''}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }} className={isMobile ? 'mobile-flex-wrap mobile-gap-1' : ''}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            border: 'none',
            background: showAdvanced ? '#3b82f6' : (darkMode ? '#374151' : '#f3f4f6'),
            color: showAdvanced ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          className={isMobile ? 'mobile-btn-sm' : ''}
        >
          <Filter size={14} />
          Advanced
        </button>

        {/* Status Quick Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            border: 'none',
            background: darkMode ? '#374151' : '#f3f4f6',
            color: darkMode ? '#d1d5db' : '#374151',
            cursor: 'pointer',
            fontSize: '0.875rem',
            outline: 'none'
          }}
          className={isMobile ? 'mobile-btn-sm' : ''}
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>

        {/* Clear Filters */}
        {(searchTerm || filters.status !== 'all' || filters.assignedTo !== 'all' || 
          filters.dateRange !== 'all' || filters.valueRange !== 'all') && (
          <button
            onClick={clearFilters}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: 'none',
              background: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            className={isMobile ? 'mobile-btn-sm' : ''}
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          background: darkMode ? '#111827' : '#f9fafb',
          borderRadius: '8px',
          border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
        }} className={isMobile ? 'mobile-grid-1 mobile-gap-1 mobile-p-1' : ''}>
          
          {/* Assigned To Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? '#d1d5db' : '#374151',
              marginBottom: '0.5rem'
            }}>
              <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Assigned To
            </label>
            <select
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
              style={inputStyle}
            >
              <option value="all">All Users</option>
              <option value="unassigned">Unassigned</option>
              <option value="me">My Leads</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? '#d1d5db' : '#374151',
              marginBottom: '0.5rem'
            }}>
              <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              style={inputStyle}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Value Range Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? '#d1d5db' : '#374151',
              marginBottom: '0.5rem'
            }}>
              <DollarSign size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Value Range
            </label>
            <select
              value={filters.valueRange}
              onChange={(e) => handleFilterChange('valueRange', e.target.value)}
              style={inputStyle}
            >
              <option value="all">All Values</option>
              <option value="0-100000">₹0 - ₹1L</option>
              <option value="100000-500000">₹1L - ₹5L</option>
              <option value="500000-1000000">₹5L - ₹10L</option>
              <option value="1000000+">₹10L+</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.customDateFrom}
                  onChange={(e) => handleFilterChange('customDateFrom', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.customDateTo}
                  onChange={(e) => handleFilterChange('customDateTo', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {/* Custom Value Range */}
          {filters.valueRange === 'custom' && (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Min Value (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.customValueMin}
                  onChange={(e) => handleFilterChange('customValueMin', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Max Value (₹)
                </label>
                <input
                  type="number"
                  placeholder="1000000"
                  value={filters.customValueMax}
                  onChange={(e) => handleFilterChange('customValueMax', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;