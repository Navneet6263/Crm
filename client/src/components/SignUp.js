import React, { useState } from 'react';
import { User, Mail, Lock, Building, Phone, ArrowLeft } from 'lucide-react';

const SignUp = ({ onSignUp, onBackToSignIn, onBack, darkMode = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Removed auto-fill trial data

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate phone number (10 digits)
    const phoneDigits = formData.phone.replace(/[^\d]/g, '');
    if (formData.phone && (phoneDigits.length !== 10 || !phoneDigits.match(/^[6-9]/))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number starting with 6-9';
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const determineUserRole = (email) => {
    // Auto-assign admin role based on email domain
    const adminDomains = ['@greencrm.com', '@admin.com', '@company.admin'];
    const superAdminDomains = ['@superadmin.com', '@greencrm.admin'];
    
    const emailLower = email.toLowerCase();
    
    if (superAdminDomains.some(domain => emailLower.includes(domain))) {
      return 'super-admin';
    }
    
    if (adminDomains.some(domain => emailLower.includes(domain))) {
      return 'admin';
    }
    
    // Check for specific admin keywords in email
    if (emailLower.includes('admin') || emailLower.includes('manager')) {
      return 'admin';
    }
    
    return 'sales-executive'; // Default role
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }
    
    try {
      // Determine user role based on email
      const userRole = determineUserRole(formData.email);
      
      // Add role to form data
      const signupData = {
        ...formData,
        role: userRole
      };
      
      const success = await onSignUp(signupData);
      if (success !== false) {
        localStorage.removeItem('trialData');
        
        // Show role assignment notification
        if (userRole === 'admin' || userRole === 'super-admin') {
          alert(`🎉 Welcome! You've been assigned ${userRole} privileges based on your email.`);
        }
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: darkMode ? '#111827' : '#f9fafb',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: darkMode ? '#1f2937' : 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {onBack && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={onBack}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: darkMode ? '#9ca3af' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                padding: '0.5rem'
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: darkMode ? 'white' : '#111827',
            marginBottom: '0.5rem'
          }}>
            Create Account
          </h1>
          <p style={{
            color: darkMode ? '#9ca3af' : '#6b7280'
          }}>
            Join Green Call CRM today
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div style={{
              padding: '0.75rem',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              border: '1px solid #fecaca'
            }}>
              {errors.submit}
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <User size={20} style={{
                position: 'absolute',
                left: '12px',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }} />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: `1px solid ${errors.name ? '#ef4444' : (darkMode ? '#374151' : '#d1d5db')}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#111827'
                }}
              />
            </div>
            {errors.name && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: 0 }}>
                {errors.name}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Mail size={20} style={{
                position: 'absolute',
                left: '12px',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: `1px solid ${errors.email ? '#ef4444' : (darkMode ? '#374151' : '#d1d5db')}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#111827'
                }}
              />
            </div>
            {errors.email && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: 0 }}>
                {errors.email}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Building size={20} style={{
                position: 'absolute',
                left: '12px',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }} />
              <input
                type="text"
                name="company"
                placeholder="Company Name"
                value={formData.company}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#111827'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Phone size={20} style={{
                position: 'absolute',
                left: '12px',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }} />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: `1px solid ${errors.phone ? '#ef4444' : (darkMode ? '#374151' : '#d1d5db')}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#111827'
                }}
              />
            </div>
            {errors.phone && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: 0 }}>
                {errors.phone}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Lock size={20} style={{
                position: 'absolute',
                left: '12px',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#111827'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Lock size={20} style={{
                position: 'absolute',
                left: '12px',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#111827'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #4ade80)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1.5rem'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              background: darkMode ? '#374151' : '#e5e7eb'
            }}></div>
            <span style={{
              padding: '0 1rem',
              color: darkMode ? '#9ca3af' : '#6b7280',
              fontSize: '0.875rem'
            }}>
              or sign up with
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              background: darkMode ? '#374151' : '#e5e7eb'
            }}></div>
          </div>

          {/* Social Signup Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <button
              type="button"
              onClick={() => {
                window.location.href = 'http://localhost:5004/api/auth/google';
              }}
              style={{
                flex: 1,
                padding: '12px',
                border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                borderRadius: '8px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#111827',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#4285f4';
                e.target.style.boxShadow = '0 2px 4px rgba(66, 133, 244, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = darkMode ? '#374151' : '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            
            <button
              type="button"
              onClick={() => {
                window.location.href = 'http://localhost:5004/api/auth/linkedin';
              }}
              style={{
                flex: 1,
                padding: '12px',
                border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                borderRadius: '8px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#111827',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#0077b5';
                e.target.style.boxShadow = '0 2px 4px rgba(0, 119, 181, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = darkMode ? '#374151' : '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077b5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              Already have an account?{' '}
            </span>
            <button
              type="button"
              onClick={onBackToSignIn}
              style={{
                background: 'none',
                border: 'none',
                color: '#22c55e',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;