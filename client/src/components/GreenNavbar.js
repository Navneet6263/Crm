import React, { useState } from 'react';
import { Moon, Sun, ChevronDown } from 'lucide-react';

const GreenNavbar = ({ onAdminLogin, onSignUp, onSignIn, darkMode, toggleDarkMode, onBookDemo }) => {
  const [showGetStartedDropdown, setShowGetStartedDropdown] = useState(false);
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
      zIndex: 1000
    }}>
      {/* Logo and Name */}
      <div 
        onClick={() => {
          document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
        }}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          fontSize: '1.25rem',
          boxShadow: '0 4px 6px rgba(34, 197, 94, 0.2)'
        }}>
          G
        </div>
        <div style={{
          fontWeight: '700',
          fontSize: '1.25rem',
          color: darkMode ? '#4ade80' : '#16a34a'
        }}>
          Green Call CRM
        </div>
      </div>

      {/* Navigation Links - Hidden on mobile */}
      {window.innerWidth > 768 && (
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="#features" style={{
            color: darkMode ? '#d1fae5' : '#166534',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>Features</a>
          <a href="#pricing" style={{
            color: darkMode ? '#d1fae5' : '#166534',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>Pricing</a>
          <a href="#contact" style={{
            color: darkMode ? '#d1fae5' : '#166534',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>Contact</a>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: darkMode ? '#1f2937' : '#f0fdf4',
            border: `1px solid ${darkMode ? '#374151' : '#dcfce7'}`,
            borderRadius: '50%',
            color: darkMode ? '#d1fae5' : '#166534',
            cursor: 'pointer'
          }}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button
          onClick={onAdminLogin}
          style={{
            padding: '0.5rem 1rem',
            background: darkMode ? '#1f2937' : '#f0fdf4',
            border: `1px solid ${darkMode ? '#374151' : '#dcfce7'}`,
            borderRadius: '6px',
            color: darkMode ? '#d1fae5' : '#166534',
            fontWeight: '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = darkMode ? '#374151' : '#dcfce7';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = darkMode ? '#1f2937' : '#f0fdf4';
          }}
        >
          Admin Login
        </button>
        <button
          onClick={onBookDemo}
          style={{
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)',
            transition: 'all 0.2s ease'
          }}
        >
          Book a Demo
        </button>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowGetStartedDropdown(!showGetStartedDropdown)}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(34, 197, 94, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(34, 197, 94, 0.2)';
            }}
          >
            Get Started
            <ChevronDown size={16} />
          </button>
          
          {showGetStartedDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              background: darkMode ? '#1f2937' : 'white',
              border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: '150px',
              zIndex: 1001
            }}>
              <button
                onClick={() => {
                  setShowGetStartedDropdown(false);
                  onSignUp && onSignUp();
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  color: darkMode ? '#d1fae5' : '#166534',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = darkMode ? '#374151' : '#f0fdf4';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                }}
              >
                Sign Up - Free Trial
              </button>
              <button
                onClick={() => {
                  setShowGetStartedDropdown(false);
                  onSignIn && onSignIn();
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  color: darkMode ? '#d1fae5' : '#166534',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = darkMode ? '#374151' : '#f0fdf4';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default GreenNavbar;