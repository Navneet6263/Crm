import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const NavigationBreadcrumbs = ({ breadcrumbs, onNavigate, darkMode }) => {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  const breadcrumbStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 0',
    fontSize: '0.875rem',
    color: darkMode ? '#9ca3af' : '#6b7280'
  };

  const itemStyle = (isLast) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    cursor: isLast ? 'default' : 'pointer',
    color: isLast ? (darkMode ? '#d1d5db' : '#374151') : (darkMode ? '#9ca3af' : '#6b7280'),
    fontWeight: isLast ? '600' : '400',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    ':hover': !isLast ? {
      background: darkMode ? '#374151' : '#f3f4f6',
      color: darkMode ? '#d1d5db' : '#374151'
    } : {}
  });

  const separatorStyle = {
    color: darkMode ? '#4b5563' : '#d1d5db',
    fontSize: '0.75rem'
  };

  return (
    <nav style={breadcrumbStyle}>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;
        
        return (
          <React.Fragment key={crumb.view || index}>
            <span
              style={itemStyle(isLast)}
              onClick={!isLast ? () => onNavigate(crumb.view) : undefined}
              onMouseEnter={(e) => {
                if (!isLast) {
                  e.target.style.background = darkMode ? '#374151' : '#f3f4f6';
                  e.target.style.color = darkMode ? '#d1d5db' : '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLast) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = darkMode ? '#9ca3af' : '#6b7280';
                }
              }}
            >
              {isFirst && <Home size={14} style={{ marginRight: '0.25rem' }} />}
              {crumb.label}
            </span>
            
            {!isLast && (
              <ChevronRight size={14} style={separatorStyle} />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default NavigationBreadcrumbs;