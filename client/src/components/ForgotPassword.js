import React, { useState } from 'react';
import { Mail, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import config from '../config';

const ForgotPassword = ({ onBack, darkMode = false }) => {
  const [step, setStep] = useState('email'); // email, otp, success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendResetOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${config.api.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      if (result.success) {
        setStep('otp');
      } else {
        setError(result.message || 'Failed to send reset email');
      }
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${config.api.baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setStep('success');
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
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
        
        {/* Email Step */}
        {step === 'email' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Shield size={48} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
              <h2 style={{ color: darkMode ? 'white' : '#111827', marginBottom: '0.5rem' }}>
                Forgot Password?
              </h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                Enter your email to receive reset instructions
              </p>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem',
                background: '#fee2e2',
                color: '#dc2626',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}>
                ❌ {error}
              </div>
            )}

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <Mail size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '12px',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }} />
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <button
              onClick={sendResetOTP}
              disabled={loading || !email}
              style={{
                width: '100%',
                padding: '12px',
                background: loading || !email ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: loading || !email ? 'not-allowed' : 'pointer',
                marginBottom: '1rem'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </>
        )}

        {/* OTP & New Password Step */}
        {step === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: darkMode ? 'white' : '#111827' }}>
                Reset Your Password
              </h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                Enter the code sent to {email}
              </p>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem',
                background: '#fee2e2',
                color: '#dc2626',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}>
                ❌ {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                borderRadius: '8px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#111827',
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '1.2rem',
                letterSpacing: '0.3rem'
              }}
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                borderRadius: '8px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#111827',
                marginBottom: '1rem'
              }}
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                borderRadius: '8px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#111827',
                marginBottom: '1.5rem'
              }}
            />

            <button
              onClick={resetPassword}
              disabled={loading || !otp || !newPassword || !confirmPassword}
              style={{
                width: '100%',
                padding: '12px',
                background: loading || !otp || !newPassword || !confirmPassword ? '#9ca3af' : '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: loading || !otp || !newPassword || !confirmPassword ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <CheckCircle size={48} style={{ color: '#22c55e', marginBottom: '1rem' }} />
              <h2 style={{ color: darkMode ? 'white' : '#111827', marginBottom: '0.5rem' }}>
                Password Reset Successful!
              </h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                Your password has been updated successfully
              </p>
            </div>

            <button
              onClick={onBack}
              style={{
                width: '100%',
                padding: '12px',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Back to Login
            </button>
          </>
        )}

        {step !== 'success' && (
          <button
            onClick={onBack}
            style={{
              width: '100%',
              padding: '8px',
              background: 'transparent',
              color: darkMode ? '#9ca3af' : '#6b7280',
              border: 'none',
              cursor: 'pointer',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;