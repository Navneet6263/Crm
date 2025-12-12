import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, Phone, ArrowLeft, Shield, Sparkles, TrendingUp, Users, Star, CheckCircle } from 'lucide-react';
import { oauthService } from '../services/oauthService';
import LogRocket from 'logrocket';

const GreenCallLogin = ({ onLogin, onBack }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Call the parent's onLogin function with credentials
      const result = await onLogin(credentials);
      
      // Identify user in LogRocket after successful login
      if (result && result.user) {
        LogRocket.identify(result.user.id || result.user._id, {
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        });
      }
    } catch (error) {
      alert('Invalid credentials. Please use navneet@greencallcrm.com / navneet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      oauthService.loginWithGoogle();
    } catch (error) {
      alert('Google login failed. Please try again.');
    }
  };

  const handleLinkedInLogin = () => {
    try {
      oauthService.loginWithLinkedIn();
    } catch (error) {
      alert('LinkedIn login failed. Please try again.');
    }
  };

  // Handle OAuth callback on component mount
  useEffect(() => {
    try {
      const token = oauthService.handleOAuthCallback();
      if (token) {
        // Get user info and call onLogin
        oauthService.getUserFromToken(token)
          .then(user => {
            // Identify user in LogRocket for OAuth login
            LogRocket.identify(user.id || user._id, {
              name: user.name,
              email: user.email,
              role: user.role,
            });
            onLogin({ user, token });
          })
          .catch(error => {
            console.error('Failed to get user info:', error);
            localStorage.removeItem('token');
          });
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
    }
  }, [onLogin]);

  // Add CSS animations
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes pulse {
        0%, 100% { box-shadow: 0 20px 40px rgba(34, 197, 94, 0.3); }
        50% { box-shadow: 0 25px 50px rgba(34, 197, 94, 0.4); }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
        linear-gradient(135deg, 
          rgba(240, 253, 244, 0.8) 0%, 
          rgba(220, 252, 231, 0.9) 25%,
          rgba(187, 247, 208, 0.7) 50%,
          rgba(134, 239, 172, 0.6) 75%,
          rgba(74, 222, 128, 0.5) 100%
        )
      `,
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'center',
      padding: 0,
      position: 'relative',
      overflow: 'hidden',
    },
    leftPanel: {
      flex: '1',
      maxWidth: '600px',
      padding: '4rem 3rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.05)',
    },
    rightPanel: {
      flex: '1',
      maxWidth: '500px',
      padding: '4rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backgroundShapes: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 0,
    },
    shape1: {
      position: 'absolute',
      top: '10%',
      left: '10%',
      width: '300px',
      height: '300px',
      background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))',
      borderRadius: '50%',
      filter: 'blur(40px)',
      animation: 'float 6s ease-in-out infinite',
    },
    shape2: {
      position: 'absolute',
      bottom: '10%',
      right: '10%',
      width: '200px',
      height: '200px',
      background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
      borderRadius: '50%',
      filter: 'blur(40px)',
      animation: 'float 8s ease-in-out infinite reverse',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      padding: '3rem 2.5rem',
      borderRadius: '24px',
      boxShadow: `
        0 32px 64px rgba(0, 0, 0, 0.12),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1)
      `,
      width: '100%',
      maxWidth: '420px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      zIndex: 1,
      animation: 'slideUp 0.8s ease-out',
    },
    socialLoginContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
    },
    socialLoginBtn: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#374151',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '1.5rem 0',
      color: '#9ca3af',
      fontSize: '0.875rem',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#e5e7eb',
    },
    dividerText: {
      padding: '0 1rem',
      background: 'rgba(255, 255, 255, 0.95)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2.5rem',
    },
    logoContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1.5rem',
    },
    logoIcon: {
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
      color: 'white',
      borderRadius: '20px',
      padding: '1.25rem',
      display: 'flex',
      boxShadow: `
        0 20px 40px rgba(34, 197, 94, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
      `,
      position: 'relative',
      animation: 'pulse 2s ease-in-out infinite',
    },
    sparkle: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      color: '#fbbf24',
      animation: 'sparkle 1.5s ease-in-out infinite',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem',
      letterSpacing: '-0.025em',
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1.1rem',
      fontWeight: '500',
    },
    formGroup: {
      marginBottom: '1.75rem',
    },
    inputGroup: {
      position: 'relative',
    },
    inputLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    input: {
      width: '100%',
      padding: '1.25rem 1.25rem 1.25rem 3.5rem',
      border: '2px solid #e5e7eb',
      borderRadius: '16px',
      fontSize: '1.1rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'rgba(249, 250, 251, 0.8)',
      outline: 'none',
      fontWeight: '500',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    },
    inputIcon: {
      position: 'absolute',
      left: '1.25rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      transition: 'all 0.3s ease',
    },
    passwordToggle: {
      position: 'absolute',
      right: '1.25rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#9ca3af',
      padding: '0.5rem',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
    },
    loginBtn: {
      width: '100%',
      padding: '1.25rem',
      background: isLoading 
        ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
        : 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      fontSize: '1.125rem',
      fontWeight: '700',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isLoading 
        ? '0 4px 15px rgba(156, 163, 175, 0.3)'
        : '0 8px 25px rgba(34, 197, 94, 0.4)',
      position: 'relative',
      overflow: 'hidden',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    loginBtnText: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    backBtn: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(229, 231, 235, 0.8)',
      color: '#6b7280',
      cursor: 'pointer',
      fontSize: '1rem',
      padding: '1rem 1.5rem',
      borderRadius: '16px',
      marginTop: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      width: '100%',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    securityBadge: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '2rem',
      padding: '0.75rem',
      background: 'rgba(34, 197, 94, 0.1)',
      borderRadius: '12px',
      border: '1px solid rgba(34, 197, 94, 0.2)',
      color: '#16a34a',
      fontSize: '0.875rem',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundShapes}>
        <div style={styles.shape1}></div>
        <div style={styles.shape2}></div>
      </div>
      
      {/* Left Panel - Blog Section */}
      <div style={styles.leftPanel}>
        <div style={{ maxWidth: '500px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
              color: 'white',
              borderRadius: '16px',
              padding: '1rem',
              display: 'flex'
            }}>
              <Phone size={28} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#1f2937',
                margin: 0
              }}>Green Call CRM</h1>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '1rem'
              }}>Intelligent CRM for Indian Businesses</p>
            </div>
          </div>

          <div style={{
            marginBottom: '2.5rem'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>Transform Your Business Growth</h2>
            <p style={{
              color: '#4b5563',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              Green Call CRM is revolutionizing how Indian businesses manage customer relationships. 
              Built specifically for the Indian market, our platform combines AI-powered insights 
              with intuitive design to help you scale your business efficiently.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {[
              {
                icon: <TrendingUp size={24} />,
                title: '300% Growth Rate',
                description: 'Our customers see average 300% increase in sales within 6 months'
              },
              {
                icon: <Users size={24} />,
                title: '10,000+ Businesses',
                description: 'Trusted by over 10,000 Indian businesses across all industries'
              },
              {
                icon: <Star size={24} />,
                title: '4.9/5 Rating',
                description: 'Highest rated CRM platform with 99.9% customer satisfaction'
              }
            ].map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  color: '#22c55e',
                  flexShrink: 0
                }}>
                  {feature.icon}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 0.5rem 0'
                  }}>{feature.title}</h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <CheckCircle size={20} style={{ color: '#22c55e' }} />
              <span style={{
                fontWeight: '600',
                color: '#1f2937'
              }}>Why Choose Green Call CRM?</span>
            </div>
            <p style={{
              color: '#374151',
              fontSize: '0.875rem',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Experience the power of contextual AI, WhatsApp integration, advanced analytics, 
              and 24/7 support - all designed specifically for Indian business needs.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Super Admin Login</h2>
            <p style={styles.subtitle}>Sign in with Super Admin credentials only</p>
          </div>

          {/* Social Login Options */}
          <div style={styles.socialLoginContainer}>
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                ...styles.socialLoginBtn,
                borderColor: '#db4437',
                color: '#db4437'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#db4437';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                e.target.style.color = '#db4437';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            
            <button
              type="button"
              onClick={handleLinkedInLogin}
              style={{
                ...styles.socialLoginBtn,
                borderColor: '#0077b5',
                color: '#0077b5'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#0077b5';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                e.target.style.color = '#0077b5';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
          </div>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>or continue with email</span>
            <div style={styles.dividerLine}></div>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.inputLabel}>Email</label>
              <div style={styles.inputGroup}>
                <User 
                  size={20} 
                  style={{
                    ...styles.inputIcon,
                    color: focusedField === 'email' ? '#22c55e' : '#9ca3af'
                  }} 
                />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  placeholder="navneet@greencallcrm.com"
                  style={styles.input}
                  onFocus={(e) => {
                    setFocusedField('email');
                    e.target.style.borderColor = '#22c55e';
                    e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.06)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onBlur={(e) => {
                    setFocusedField(null);
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = 'rgba(249, 250, 251, 0.8)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.06)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.inputLabel}>Password</label>
              <div style={styles.inputGroup}>
                <Lock 
                  size={20} 
                  style={{
                    ...styles.inputIcon,
                    color: focusedField === 'password' ? '#22c55e' : '#9ca3af'
                  }} 
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter your password"
                  style={styles.input}
                  onFocus={(e) => {
                    setFocusedField('password');
                    e.target.style.borderColor = '#22c55e';
                    e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.06)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onBlur={(e) => {
                    setFocusedField(null);
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = 'rgba(249, 250, 251, 0.8)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.06)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  required
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(34, 197, 94, 0.1)';
                    e.target.style.color = '#22c55e';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none';
                    e.target.style.color = '#9ca3af';
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              style={styles.loginBtn}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(34, 197, 94, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.4)';
                }
              }}
            >
              <div style={styles.loginBtnText}>
                {isLoading ? (
                  <>
                    <div style={styles.spinner}></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In Securely'
                )}
              </div>
            </button>
          </form>

          <div style={styles.securityBadge}>
            <Shield size={16} />
            <span>256-bit SSL Encrypted</span>
          </div>

          <button 
            onClick={onBack} 
            style={styles.backBtn}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(34, 197, 94, 0.8)';
              e.target.style.color = '#22c55e';
              e.target.style.background = 'rgba(34, 197, 94, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(229, 231, 235, 0.8)';
              e.target.style.color = '#6b7280';
              e.target.style.background = 'rgba(255, 255, 255, 0.8)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default GreenCallLogin;