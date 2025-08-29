import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const CustomerLogin = ({ onLogin, onBack, darkMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const success = await onLogin(formData);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: darkMode 
      ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  };

  const formStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    border: darkMode ? '1px solid #374151' : 'none'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    paddingLeft: '2.5rem',
    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    background: darkMode ? '#374151' : 'white',
    color: darkMode ? 'white' : '#1f2937',
    fontSize: '1rem',
    outline: 'none'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.2s'
  };

  return (
    <div style={containerStyle}>
      <div style={formStyle}>
        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: darkMode ? '#9ca3af' : '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Customer Login
          </h1>
          <p style={{
            color: darkMode ? '#9ca3af' : '#6b7280',
            fontSize: '0.875rem'
          }}>
            Login with your registered email
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '0.75rem',
            background: darkMode ? '#7f1d1d' : '#fee2e2',
            color: darkMode ? '#fca5a5' : '#dc2626',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            border: '1px solid #ef4444'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? '#d1d5db' : '#374151',
              marginBottom: '0.5rem'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail 
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
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? '#d1d5db' : '#374151',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
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
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                style={{...inputStyle, paddingRight: '2.5rem'}}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Info */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: darkMode ? '#374151' : '#f3f4f6',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: darkMode ? '#d1d5db' : '#6b7280'
        }}>
          <p style={{ margin: 0 }}>
            💡 Use the email address you provided when registering as a customer
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;