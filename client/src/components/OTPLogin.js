import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, Shield } from 'lucide-react';


const OTPLogin = ({ onBack, darkMode = false }) => {
  const [step, setStep] = useState('method'); // method, phone, otp, verify
  const [selectedMethod, setSelectedMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const otpMethods = [
    {
      id: 'sms',
      title: 'SMS OTP',
      description: 'Get OTP via SMS',
      icon: MessageSquare,
      color: '#22c55e'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp OTP',
      description: 'Get OTP via WhatsApp',
      icon: Phone,
      color: '#25d366'
    },
    {
      id: 'email',
      title: 'Email OTP',
      description: 'Get OTP via Email',
      icon: Mail,
      color: '#3b82f6'
    }
  ];

  const sendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          method: selectedMethod
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setStep('otp');
        alert('✅ OTP sent successfully!');
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      alert('❌ Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          otp
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ OTP Verified Successfully! Logging you in...');
        // Store token and redirect
        localStorage.setItem('authToken', result.token);
        window.location.reload();
      } else {
        alert('❌ Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      alert('❌ OTP verification failed. Please check your OTP and try again.');
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
        
        {/* Method Selection */}
        {step === 'method' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Shield size={48} style={{ color: '#22c55e', marginBottom: '1rem' }} />
              <h2 style={{ color: darkMode ? 'white' : '#111827', marginBottom: '0.5rem' }}>
                Choose OTP Method
              </h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                Select how you want to receive OTP
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {otpMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => {
                      setSelectedMethod(method.id);
                      setStep('phone');
                    }}
                    style={{
                      padding: '1rem',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      background: darkMode ? '#374151' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = method.color;
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = darkMode ? '#374151' : '#e5e7eb';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <Icon size={24} style={{ color: method.color }} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: darkMode ? 'white' : '#111827',
                        marginBottom: '0.25rem'
                      }}>
                        {method.title}
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem',
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}>
                        {method.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Phone Number Input */}
        {step === 'phone' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: darkMode ? 'white' : '#111827' }}>
                Enter Phone Number
              </h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                We'll send OTP to this number
              </p>
            </div>

            <input
              type="tel"
              placeholder="+91 9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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

            <button
              onClick={sendOTP}
              disabled={loading || !phoneNumber}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#9ca3af' : '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </>
        )}

        {/* OTP Input */}
        {step === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: darkMode ? 'white' : '#111827' }}>
                Enter OTP
              </h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                OTP sent to {phoneNumber}
              </p>
            </div>

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
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
                fontSize: '1.5rem',
                letterSpacing: '0.5rem'
              }}
            />

            <button
              onClick={verifyOTP}
              disabled={otp.length !== 6}
              style={{
                width: '100%',
                padding: '12px',
                background: otp.length !== 6 ? '#9ca3af' : '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: otp.length !== 6 ? 'not-allowed' : 'pointer'
              }}
            >
              Verify OTP
            </button>
          </>
        )}

        <button
          onClick={onBack}
          style={{
            width: '100%',
            padding: '8px',
            background: 'transparent',
            color: darkMode ? '#9ca3af' : '#6b7280',
            border: 'none',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default OTPLogin;