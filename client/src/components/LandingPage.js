import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import GreenNavbar from './GreenNavbar';
import BookDemoModal from './BookDemoModal';
import { Sparkles, ArrowRight, Shield, Users, TrendingUp, Star, CheckCircle, Mail, Phone, MapPin, Instagram, Linkedin, Twitter, Github } from 'lucide-react';

const LandingPage = ({ onStartFreeTrial, onAdminLogin, onSignUp, onSignIn, onCustomerLogin }) => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });

  useEffect(() => {
    // SEO Meta Tags
    document.title = 'GreenCall CRM - AI-Powered Customer Management for Indian Businesses';
    
    // Create or update meta tags
    const updateMetaTag = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic SEO
    updateMetaTag('description', 'Transform your business with GreenCall CRM - AI-powered customer management platform built for Indian businesses. WhatsApp integration, advanced analytics, 14-day free trial.');
    updateMetaTag('keywords', 'CRM software India, customer management, WhatsApp CRM, sales automation, lead management, Indian business CRM, AI CRM');
    updateMetaTag('author', 'GreenCall Technologies');
    
    // Open Graph
    updateMetaTag('og:title', 'GreenCall CRM - AI-Powered Customer Management');
    updateMetaTag('og:description', 'Transform your business with our intelligent CRM platform. Built for Indian businesses with WhatsApp integration and advanced analytics.');
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', window.location.href);
    updateMetaTag('og:image', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');
    
    // Twitter Cards
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'GreenCall CRM - AI-Powered Customer Management');
    updateMetaTag('twitter:description', 'Transform your business with our intelligent CRM platform built for Indian businesses.');
    updateMetaTag('twitter:image', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');

    // Structured Data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "GreenCall CRM",
      "description": "AI-powered customer relationship management platform for Indian businesses",
      "url": window.location.href,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "999",
        "priceCurrency": "INR",
        "priceValidUntil": "2024-12-31"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "150"
      }
    };

    let structuredDataScript = document.querySelector('#structured-data');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.id = 'structured-data';
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);

    // CSS Animations
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
      if (structuredDataScript) document.head.removeChild(structuredDataScript);
    };
  }, []);

  return (
    <>
      <div className="landing-page" style={{
        background: darkMode ? 
          'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' :
          'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
        color: darkMode ? '#f0fdf4' : '#166534',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite',
          zIndex: 0
        }}></div>

        <GreenNavbar 
          onAdminLogin={onAdminLogin} 
          onSignUp={onSignUp}
          onSignIn={onSignIn}
          onCustomerLogin={onCustomerLogin}
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
          onBookDemo={() => setIsDemoModalOpen(true)}
        />
        
        {/* Lead Capture Magnet */}
        <section style={{
          padding: '1rem 2rem',
          background: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
          textAlign: 'center',
          borderBottom: `1px solid ${darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'}`
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
              padding: '0.75rem 1.5rem',
              borderRadius: '50px',
              border: `1px solid ${darkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'}`,
              fontSize: '0.9rem',
              fontWeight: '600',
              color: darkMode ? '#4ade80' : '#16a34a',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <span>📝</span>
              <span>FREE: Download 7-Step Sales Funnel PDF Guide</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </section>

        <section id="hero" style={{
          background: 'transparent',
          padding: window.innerWidth <= 768 ? '6rem 1rem 4rem' : '8rem 2rem 6rem',
          textAlign: 'center',
          marginTop: '60px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
            gap: window.innerWidth <= 768 ? '2rem' : '4rem',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'left', animation: 'fadeInUp 0.8s ease-out' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(34, 197, 94, 0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                marginBottom: '2rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: darkMode ? '#4ade80' : '#16a34a'
              }}>
                <Sparkles size={16} />
                <span>AI-Powered CRM Solution</span>
              </div>
              
              <h1 style={{
                fontSize: window.innerWidth <= 768 ? '2.5rem' : window.innerWidth <= 1024 ? '3rem' : '3.5rem',
                fontWeight: '800',
                color: darkMode ? '#f9fafb' : '#1f2937',
                marginBottom: '1.5rem',
                lineHeight: '1.1'
              }}>
                Your great Indian growth story
              </h1>
              
              <p style={{
                fontSize: '1.25rem',
                color: darkMode ? '#d1fae5' : '#166534',
                marginBottom: '2rem',
                lineHeight: '1.6',
                opacity: '0.9'
              }}>
                Convert more and grow your business with the magic of contextual AI and thoughtful UI. 
                Join thousands of Indian businesses scaling with our intelligent CRM.
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '2.5rem'
              }}>
                {[
                  { icon: <CheckCircle size={20} />, text: 'AI-powered lead scoring & insights' },
                  { icon: <CheckCircle size={20} />, text: 'WhatsApp & multi-channel integration' },
                  { icon: <CheckCircle size={20} />, text: 'Advanced analytics & reporting' }
                ].map((feature, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: darkMode ? '#4ade80' : '#16a34a',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    {feature.icon}
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
              <div style={{
                background: darkMode ? 
                  'rgba(31, 41, 55, 0.95)' : 
                  'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                padding: '3rem 2.5rem',
                borderRadius: '24px',
                boxShadow: darkMode ?
                  '0 32px 64px rgba(0, 0, 0, 0.3)' :
                  '0 32px 64px rgba(0, 0, 0, 0.12)',
                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)'}`
              }}>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '2.5rem'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    padding: '0.5rem 1rem',
                    borderRadius: '50px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#4ade80' : '#16a34a'
                  }}>
                    <Shield size={16} />
                    <span>Start Free Trial</span>
                  </div>
                  
                  <h2 style={{
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: darkMode ? '#f9fafb' : '#1f2937',
                    marginBottom: '0.5rem'
                  }}>
                    Get Started Today
                  </h2>
                  
                  <p style={{
                    color: darkMode ? '#d1d5db' : '#6b7280',
                    fontSize: '1rem'
                  }}>
                    Join 10,000+ businesses growing with Green Call CRM
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  // Store form data in localStorage for signup
                  localStorage.setItem('trialData', JSON.stringify({
                    name: formData.fullName,
                    email: formData.email,
                    company: formData.fullName.split(' ')[0] + ' Company' // Simple company name
                  }));
                  if (onStartFreeTrial) onStartFreeTrial();
                }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.8)',
                        color: darkMode ? '#f9fafb' : '#1f2937',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Email/Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email or phone number"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.8)',
                        color: darkMode ? '#f9fafb' : '#1f2937',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Create a secure password"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.8)',
                        color: darkMode ? '#f9fafb' : '#1f2937',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '1.25rem',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight size={20} />
                  </button>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '1.5rem',
                    padding: '0.75rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    color: darkMode ? '#4ade80' : '#16a34a',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    <Shield size={16} />
                    <span>No credit card required • Free 14-day trial</span>
                  </div>
                </form>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDemoModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'transparent',
                    color: darkMode ? '#d1d5db' : '#6b7280',
                    border: `2px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(107, 114, 128, 0.3)'}`,
                    borderRadius: '16px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    marginTop: '1rem'
                  }}
                >
                  Book a Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={{
          padding: '8rem 2rem',
          background: darkMode 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
            : 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '400px',
            height: '400px',
            background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))',
            borderRadius: '50%',
            filter: 'blur(80px)',
            animation: 'float 8s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '10%',
            right: '15%',
            width: '300px',
            height: '300px',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.12), rgba(147, 51, 234, 0.08))',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 10s ease-in-out infinite reverse'
          }} />

          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              marginBottom: '5rem',
              animation: 'fadeInUp 0.8s ease-out'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1))'
                  : 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))',
                padding: '0.75rem 2rem',
                borderRadius: '50px',
                border: `2px solid ${darkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.25)'}`,
                marginBottom: '2rem',
                fontSize: '0.9rem',
                fontWeight: '700',
                color: darkMode ? '#4ade80' : '#16a34a',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: darkMode 
                  ? '0 10px 30px rgba(34, 197, 94, 0.2)'
                  : '0 10px 30px rgba(34, 197, 94, 0.15)'
              }}>
                <Sparkles size={18} />
                <span>Premium Features</span>
              </div>

              <h2 style={{
                fontSize: '3.5rem',
                fontWeight: '900',
                color: darkMode ? '#f9fafb' : '#1f2937',
                marginBottom: '1.5rem',
                letterSpacing: '-0.02em',
                lineHeight: '1.1',
                textShadow: darkMode 
                  ? '0 0 20px rgba(74, 222, 128, 0.3)'
                  : '0 0 20px rgba(22, 163, 74, 0.2)'
              }}>
                Powerful Features Built for Growth
              </h2>
              
              <p style={{
                fontSize: '1.4rem',
                color: darkMode ? '#d1fae5' : '#166534',
                marginBottom: '1rem',
                opacity: '0.9',
                lineHeight: '1.6',
                maxWidth: '700px',
                margin: '0 auto'
              }}>
                Everything you need to manage and grow your business with cutting-edge technology
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              marginBottom: '4rem'
            }}>
              {[
                { 
                  icon: '🚀', 
                  title: 'Fast Lead Management', 
                  desc: 'Capture and manage leads instantly with AI-powered automation',
                  gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: '#3b82f6'
                },
                { 
                  icon: '🔒', 
                  title: 'Secure Access', 
                  desc: 'Bank-level security with end-to-end encryption for your data',
                  gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ef4444'
                },
                { 
                  icon: '📊', 
                  title: 'Sales Dashboard', 
                  desc: 'Real-time insights and analytics with beautiful visualizations',
                  gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: '#8b5cf6'
                },
                { 
                  icon: '📨', 
                  title: 'Email & WhatsApp Automation', 
                  desc: 'Multi-channel communication with smart automation workflows',
                  gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#f59e0b'
                },
                { 
                  icon: '👥', 
                  title: 'Team Collaboration', 
                  desc: 'Work together seamlessly with real-time collaboration tools',
                  gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#10b981'
                },
                { 
                  icon: '📈', 
                  title: 'Advanced Analytics', 
                  desc: 'Data-driven decision making with predictive insights',
                  gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  color: '#ec4899'
                }
              ].map((feature, index) => (
                <div key={index} style={{
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(55, 65, 81, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  padding: '3rem 2.5rem',
                  borderRadius: '28px',
                  border: `2px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                  boxShadow: darkMode 
                    ? '0 25px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 25px 60px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                  animation: `fadeInUp 0.8s ease-out ${index * 0.15}s both`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                  e.currentTarget.style.boxShadow = darkMode 
                    ? `0 35px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px ${feature.color}40`
                    : `0 35px 80px rgba(0, 0, 0, 0.18), 0 0 0 1px ${feature.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = darkMode 
                    ? '0 25px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 25px 60px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
                }}
                >
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '24px',
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2rem',
                    boxShadow: `0 15px 40px ${feature.color}40`,
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{ fontSize: '2.5rem' }}>{feature.icon}</div>
                  </div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: darkMode ? '#f9fafb' : '#1f2937',
                      marginBottom: '1rem',
                      letterSpacing: '-0.01em'
                    }}>{feature.title}</h3>
                    
                    <p style={{
                      color: darkMode ? '#d1d5db' : '#6b7280',
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      marginBottom: '1.5rem'
                    }}>{feature.desc}</p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: feature.color,
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'all 0.3s ease'
                    }}>
                      <span>Learn More</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section style={{
          padding: '4rem 2rem',
          background: darkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: darkMode ? '#f9fafb' : '#1f2937',
              marginBottom: '3rem'
            }}>Why Choose GreenCall CRM?</h3>
            
            <div style={{
              background: darkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.95)',
              padding: '2rem',
              borderRadius: '16px',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)'}`,
              boxShadow: darkMode ? '0 20px 50px rgba(0, 0, 0, 0.4)' : '0 20px 50px rgba(0, 0, 0, 0.1)',
              overflow: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '1rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151', textAlign: 'left' }}>Feature</th>
                    <th style={{ padding: '1rem', fontWeight: '600', color: darkMode ? '#ef4444' : '#dc2626', textAlign: 'center' }}>Others</th>
                    <th style={{ padding: '1rem', fontWeight: '600', color: darkMode ? '#4ade80' : '#16a34a', textAlign: 'center' }}>GreenCall CRM</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Speed', others: 'Slow', ours: '⚡ Lightning Fast' },
                    { feature: 'Setup', others: 'Complex', ours: '2 min Setup' },
                    { feature: 'Support', others: 'Limited', ours: '24/7 Support' },
                    { feature: 'Cost', others: 'High', ours: 'Affordable' }
                  ].map((row, index) => (
                    <tr key={index} style={{ borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                      <td style={{ padding: '1rem', color: darkMode ? '#d1d5db' : '#6b7280', textAlign: 'left' }}>{row.feature}</td>
                      <td style={{ padding: '1rem', color: darkMode ? '#ef4444' : '#dc2626', textAlign: 'center' }}>{row.others}</td>
                      <td style={{ padding: '1rem', color: darkMode ? '#4ade80' : '#16a34a', fontWeight: '600', textAlign: 'center' }}>{row.ours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Trust & Security Section */}
        <section style={{
          padding: '4rem 2rem',
          background: darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: darkMode ? '#f9fafb' : '#1f2937',
              marginBottom: '2rem'
            }}>Trusted & Secure Platform</h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem'
            }}>
              {[
                { icon: '🔐', title: 'SSL Security', desc: 'End-to-end encryption' },
                { icon: '☁️', title: 'Secure Cloud', desc: 'AWS hosting' },
                { icon: '🛡️', title: 'GDPR Ready', desc: 'Privacy compliant' },
                { icon: '⚡', title: '99.9% Uptime', desc: 'Always available' }
              ].map((item, index) => (
                <div key={index} style={{
                  padding: '1.5rem',
                  background: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)'}`
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: darkMode ? '#f9fafb' : '#1f2937',
                    marginBottom: '0.25rem'
                  }}>{item.title}</h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#d1d5db' : '#6b7280'
                  }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Counters */}
        <section style={{
          padding: '3rem 2rem',
          background: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem'
            }}>
              {[
                { number: '18+', label: 'Active Daily Users', icon: '👥' },
                { number: '2.4k+', label: 'Events Tracked (7 days)', icon: '📈' },
                { number: '70+', label: 'Leads Processed', icon: '🔥' },
                { number: '99.5%', label: 'Uptime', icon: '🚀' }
              ].map((stat, index) => (
                <div key={index} style={{
                  padding: '2rem 1rem',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: darkMode ? '#4ade80' : '#16a34a',
                    marginBottom: '0.5rem'
                  }}>{stat.number}</div>
                  <div style={{
                    fontSize: '1rem',
                    color: darkMode ? '#d1d5db' : '#6b7280',
                    fontWeight: '500'
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer Logos Section */}
        <section style={{
          padding: '4rem 2rem',
          background: darkMode ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: darkMode ? '#f9fafb' : '#1f2937',
              marginBottom: '2rem'
            }}>Trusted by Leading Companies</h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              alignItems: 'center'
            }}>
              {[
                { name: 'JustJob', desc: 'Recruitment Platform' },
                { name: 'Talent Foundation', desc: 'HR Consulting' },
                { name: 'Vision India', desc: 'Training Institute' },
                { name: 'Live Skills', desc: 'EdTech Platform' }
              ].map((company, index) => (
                <div key={index} style={{
                  padding: '1.5rem',
                  background: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)'}`,
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: darkMode ? '#4ade80' : '#16a34a',
                    marginBottom: '0.5rem'
                  }}>{company.name}</div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#d1d5db' : '#6b7280'
                  }}>{company.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Company Story Section */}
        <section id="company-story" style={{
          padding: '6rem 2rem',
          background: darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'float 8s ease-in-out infinite'
          }}></div>

          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
            gap: '4rem',
            alignItems: 'center'
          }}>
            <div style={{
              animation: 'fadeInUp 0.8s ease-out',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(34, 197, 94, 0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                marginBottom: '2rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: darkMode ? '#4ade80' : '#16a34a'
              }}>
                <Sparkles size={16} />
                <span>Our Journey</span>
              </div>

              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: darkMode ? '#f9fafb' : '#1f2937',
                marginBottom: '1.5rem',
                lineHeight: '1.1'
              }}>
                Built for Indian Businesses
              </h2>

              <p style={{
                fontSize: '1.25rem',
                color: darkMode ? '#d1fae5' : '#166534',
                marginBottom: '2rem',
                lineHeight: '1.6',
                opacity: '0.9'
              }}>
                We understand the unique challenges and opportunities of the Indian market. Our CRM is built from the ground up to help Indian businesses grow and succeed.
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                marginBottom: '3rem'
              }}>
                {[
                  { icon: <Users size={24} />, text: '10,000+ Indian businesses' },
                  { icon: <TrendingUp size={24} />, text: '300% growth rate' },
                  { icon: <Star size={24} />, text: '4.9/5 user rating' }
                ].map((stat, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)'}`
                  }}>
                    <div style={{
                      color: darkMode ? '#4ade80' : '#16a34a',
                      fontSize: '1.25rem'
                    }}>
                      {stat.icon}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: darkMode ? '#f9fafb' : '#1f2937'
                      }}>
                        {stat.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onStartFreeTrial}
                style={{
                  background: darkMode ? 
                    'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)' :
                    'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #15803d 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(34, 197, 94, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.4)';
                }}
              >
                Join Our Community
              </button>
            </div>

            {/* Product Demo */}
            <div style={{
              animation: 'fadeInUp 0.8s ease-out 0.2s',
              position: 'relative',
              width: '100%'
            }}>
              <div style={{
                background: darkMode ? '#1e293b' : '#f8fafc',
                padding: '2rem',
                borderRadius: '24px',
                boxShadow: darkMode ?
                  '0 32px 64px rgba(0, 0, 0, 0.3)' :
                  '0 32px 64px rgba(0, 0, 0, 0.12)',
                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)'}`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Demo Video Placeholder */}
                <div style={{
                  width: '100%',
                  height: '400px',
                  borderRadius: '16px',
                  background: darkMode 
                    ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
                    : 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px dashed ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(34, 197, 94, 0.3)'}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.borderColor = darkMode ? '#4ade80' : '#16a34a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(34, 197, 94, 0.3)';
                }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)',
                    animation: 'float 3s ease-in-out infinite'
                  }}>
                    <div style={{ fontSize: '2rem', color: 'white' }}>▶️</div>
                  </div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: darkMode ? '#f9fafb' : '#1f2937',
                    marginBottom: '0.5rem'
                  }}>Watch CRM in Action</h3>
                  <p style={{
                    color: darkMode ? '#d1d5db' : '#6b7280',
                    textAlign: 'center',
                    fontSize: '1rem'
                  }}>See how GreenCall CRM transforms<br/>your business operations</p>
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    color: darkMode ? '#4ade80' : '#16a34a',
                    fontWeight: '600'
                  }}>3 min demo video</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{
          padding: window.innerWidth <= 768 ? '4rem 1rem' : '8rem 2rem',
          background: darkMode ? 
            'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)' :
            'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Enhanced Background Elements */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '300px',
            height: '300px',
            background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 8s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '60%',
            right: '10%',
            width: '250px',
            height: '250px',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.12), rgba(147, 51, 234, 0.08))',
            borderRadius: '50%',
            filter: 'blur(50px)',
            animation: 'float 10s ease-in-out infinite reverse'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.08))',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'float 12s ease-in-out infinite'
          }}></div>

          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Header Section */}
            <div style={{
              marginBottom: '4rem',
              animation: 'fadeInUp 0.8s ease-out'
            }}>
              {/* Pricing Toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  padding: '0.5rem',
                  borderRadius: '12px',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>Monthly</button>
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    color: darkMode ? '#d1d5db' : '#6b7280',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>Yearly <span style={{ color: '#22c55e', fontSize: '0.8rem' }}>(Save 20%)</span></button>
                </div>
              </div>

              
              <h2 style={{
                fontSize: '3.5rem',
                fontWeight: '900',
                color: darkMode ? '#f9fafb' : '#1f2937',
                marginBottom: '1.5rem',
                lineHeight: '1.1',
                letterSpacing: '-0.02em'
              }}>
                Flexible Pricing Plans
              </h2>

              <p style={{
                fontSize: '1.4rem',
                color: darkMode ? '#d1fae5' : '#166534',
                marginBottom: '1rem',
                opacity: '0.9',
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto 2rem'
              }}>
                Choose the perfect plan that scales with your business growth
              </p>


            </div>

            {/* Pricing Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: window.innerWidth <= 768 ? '1.5rem' : '2.5rem',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 1rem'
            }}>
              {[
                {
                  title: 'Starter',
                  price: '₹999',
                  icon: '🚀',
                  features: [
                    'Up to 10 users',
                    'Basic CRM features',
                    '5GB storage',
                    '24/7 email support',
                    'WhatsApp integration',
                    'Basic analytics'
                  ],
                  recommended: false,
                  color: 'blue'
                },
                {
                  title: 'Professional',
                  price: '₹2,499',
                  icon: '⭐',
                  features: [
                    'Up to 50 users',
                    'Advanced analytics',
                    '50GB storage',
                    'Priority support',
                    'All channels integration',
                    'Custom workflows',
                    'API access',
                    'Advanced reporting'
                  ],
                  recommended: true,
                  color: 'green'
                },
                {
                  title: 'Enterprise',
                  price: '₹4,999',
                  icon: '👑',
                  features: [
                    'Unlimited users',
                    'Custom branding',
                    'Unlimited storage',
                    'Dedicated account manager',
                    'Advanced security',
                    'Custom integrations',
                    'White-label solution',
                    'SLA guarantee'
                  ],
                  recommended: false,
                  color: 'purple'
                }
              ].map((plan, index) => (
                <div key={index} style={{
                  background: darkMode ? 
                    plan.recommended ? 
                      'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.15) 50%, rgba(31, 41, 55, 0.95) 100%)' :
                      'linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(55, 65, 81, 0.9) 100%)' :
                    plan.recommended ? 
                      'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 50%, rgba(255, 255, 255, 0.95) 100%)' :
                      'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  padding: plan.recommended ? '3rem 2.5rem' : '2.5rem 2rem',
                  borderRadius: '32px',
                  boxShadow: darkMode ?
                    plan.recommended ?
                      '0 40px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(34, 197, 94, 0.3)' :
                      '0 32px 64px rgba(0, 0, 0, 0.3)' :
                    plan.recommended ?
                      '0 40px 80px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(34, 197, 94, 0.2)' :
                      '0 32px 64px rgba(0, 0, 0, 0.12)',
                  border: plan.recommended ? 
                    `2px solid ${darkMode ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.3)'}` :
                    `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `fadeInUp 0.8s ease-out ${index * 0.2}s both`,
                  transform: plan.recommended ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = plan.recommended ? 'scale(1.08)' : 'scale(1.03)';
                  e.currentTarget.style.boxShadow = darkMode ?
                    '0 50px 100px rgba(0, 0, 0, 0.5)' :
                    '0 50px 100px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = plan.recommended ? 'scale(1.05)' : 'scale(1)';
                  e.currentTarget.style.boxShadow = darkMode ?
                    plan.recommended ?
                      '0 40px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(34, 197, 94, 0.3)' :
                      '0 32px 64px rgba(0, 0, 0, 0.3)' :
                    plan.recommended ?
                      '0 40px 80px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(34, 197, 94, 0.2)' :
                      '0 32px 64px rgba(0, 0, 0, 0.12)';
                }}
                >
                  {/* Recommended Badge */}
                  {plan.recommended && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '1rem',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      zIndex: 10
                    }}>
                      Popular
                    </div>
                  )}

                  {/* Plan Title */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      marginBottom: '1rem'
                    }}>
                      {plan.icon}
                    </div>
                    <h3 style={{
                      fontSize: '1.75rem',
                      fontWeight: '700',
                      color: darkMode ? '#f9fafb' : '#1f2937',
                      marginBottom: '0.5rem'
                    }}>
                      {plan.title}
                    </h3>
                  </div>

                  {/* Pricing */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      color: darkMode ? '#4ade80' : '#16a34a',
                      marginBottom: '0.5rem'
                    }}>
                      {plan.price}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      color: darkMode ? '#d1d5db' : '#6b7280',
                      fontWeight: '500'
                    }}>
                      per month
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: darkMode ? '#4ade80' : '#16a34a',
                    marginBottom: '2rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    <CheckCircle size={16} />
                    <span>14-day free trial</span>
                  </div>

                  {/* Features List */}
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    marginBottom: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {plan.features.map((feature, i) => (
                      <li key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: darkMode ? '#d1d5db' : '#4b5563',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        marginBottom: '0.75rem'
                      }}>
                        <CheckCircle size={16} color={darkMode ? '#4ade80' : '#16a34a'} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={onStartFreeTrial}
                    style={{
                      width: '100%',
                      padding: '1.25rem 2rem',
                      background: plan.recommended ?
                        'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)' :
                        darkMode ? 
                          'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)' :
                          'linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.02) 100%)',
                      color: plan.recommended ? 'white' : (darkMode ? '#f9fafb' : '#1f2937'),
                      border: plan.recommended ? 'none' : `2px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: '16px',
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: plan.recommended ?
                        '0 12px 30px rgba(34, 197, 94, 0.4)' :
                        darkMode ? '0 8px 25px rgba(0, 0, 0, 0.2)' : '0 8px 25px rgba(0, 0, 0, 0.1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = plan.recommended ?
                        '0 16px 40px rgba(34, 197, 94, 0.5)' :
                        darkMode ? '0 12px 35px rgba(0, 0, 0, 0.3)' : '0 12px 35px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = plan.recommended ?
                        '0 12px 30px rgba(34, 197, 94, 0.4)' :
                        darkMode ? '0 8px 25px rgba(0, 0, 0, 0.2)' : '0 8px 25px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {plan.recommended ? 'Start Free Trial' : 'Choose Plan'}
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '3rem',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '1rem',
                color: darkMode ? '#d1d5db' : '#6b7280',
                fontWeight: '500'
              }}>
                All plans include 24/7 support and no setup fees
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" style={{
          padding: '6rem 2rem',
          background: darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '40%',
            right: '20%',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(236, 139, 253, 0.1))',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'float 7s ease-in-out infinite'
          }}></div>

          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: darkMode ? '#f9fafb' : '#1f2937',
              marginBottom: '2rem'
            }}>
              Trusted by Indian Businesses
            </h2>

            <p style={{
              fontSize: '1.25rem',
              color: darkMode ? '#d1fae5' : '#166534',
              marginBottom: '3rem',
              opacity: '0.9'
            }}>
              Real success stories from our customers
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {[
                {
                  quote: 'Green Call CRM has transformed our sales process. The AI-powered insights are a game changer!',
                  name: 'Rahul Sharma',
                  company: 'Tech Solutions Pvt. Ltd.',
                  image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80&h=500&dpr=2'
                },
                {
                  quote: 'The WhatsApp integration has made our customer communication seamless. Highly recommend!',
                  name: 'Priya Gupta',
                  company: 'Retail Empire',
                  image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80&h=500&dpr=2'
                },
                {
                  quote: 'The analytics dashboard gives us clear visibility into our business performance.',
                  name: 'Amit Kumar',
                  company: 'E-commerce Hub',
                  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80&h=500&dpr=2'
                }
              ].map((testimonial, index) => (
                <div key={index} style={{
                  background: darkMode ? 
                    'rgba(31, 41, 55, 0.95)' :
                    'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  padding: '2rem',
                  borderRadius: '24px',
                  boxShadow: darkMode ?
                    '0 32px 64px rgba(0, 0, 0, 0.3)' :
                    '0 32px 64px rgba(0, 0, 0, 0.12)',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)'}`,
                  animation: `fadeInUp 0.8s ease-out ${index * 0.2}s`
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s ease',
                    transform: 'translateZ(0)',
                    willChange: 'transform'
                  }}>
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'translateZ(0)'
                      }}
                    />
                  </div>
                  
                  <div style={{
                    fontSize: '1.25rem',
                    color: darkMode ? '#d1fae5' : '#166534',
                    marginBottom: '1rem',
                    lineHeight: '1.6'
                  }}>
                    "{testimonial.quote}"
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginTop: '1.5rem'
                  }}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: darkMode ? '#f9fafb' : '#1f2937'
                    }}>
                      {testimonial.name}
                    </h4>
                    <span style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#d1d5db' : '#6b7280'
                    }}>
                      {testimonial.company}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{
          padding: '6rem 2rem',
          background: darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: darkMode ? '#f9fafb' : '#1f2937',
              marginBottom: '3rem'
            }}>Frequently Asked Questions</h2>
            
            <div style={{ textAlign: 'left' }}>
              {[
                {
                  q: 'How quickly can I set up GreenCall CRM?',
                  a: 'You can set up your account and start using GreenCall CRM in under 2 minutes. Our intuitive setup wizard guides you through the process.'
                },
                {
                  q: 'Is my data secure with GreenCall CRM?',
                  a: 'Yes, we use bank-level SSL encryption, secure AWS cloud hosting, and are GDPR compliant. Your data is protected with the highest security standards.'
                },
                {
                  q: 'Can I integrate WhatsApp with the CRM?',
                  a: 'Absolutely! GreenCall CRM offers seamless WhatsApp integration along with email and other communication channels for unified customer engagement.'
                },
                {
                  q: 'What kind of support do you provide?',
                  a: 'We provide 24/7 customer support via email, chat, and phone. Our dedicated support team is always ready to help you succeed.'
                },
                {
                  q: 'Can I cancel my subscription anytime?',
                  a: 'Yes, you can cancel your subscription at any time. No long-term contracts or hidden fees. We believe in earning your business every month.'
                }
              ].map((faq, index) => (
                <div key={index} style={{
                  background: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  padding: '2rem',
                  borderRadius: '12px',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)'}`,
                  marginBottom: '1rem',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: darkMode ? '#f9fafb' : '#1f2937',
                    marginBottom: '1rem'
                  }}>{faq.q}</h3>
                  <p style={{
                    color: darkMode ? '#d1d5db' : '#6b7280',
                    lineHeight: '1.6'
                  }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" style={{
          padding: '6rem 2rem',
          background: darkMode ? 
            'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' :
            'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
          position: 'relative'
        }}>
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Cg fill=%27%23ffffff%27%3E%3Ccircle cx=%2750%27 cy=%2750%27 r=%2740%27 opacity=%270.1%27/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
            opacity: '0.05',
            pointerEvents: 'none'
          }} />

          {/* Floating shapes */}
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            width: '300px',
            height: '300px',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 8s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 10s ease-in-out infinite reverse'
          }} />
          <div style={{
            position: 'absolute',
            top: '30%',
            right: '25%',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'float 12s ease-in-out infinite'
          }} />
          {/* Floating shapes */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'float 8s ease-in-out infinite reverse'
          }}></div>

          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontSize: '3rem',
                fontWeight: '900',
                color: darkMode ? '#f9fafb' : '#1f2937',
                lineHeight: '1.1',
                letterSpacing: '-0.02em',
                textAlign: 'center',
                marginBottom: '2rem'
              }}>
                Ready to Transform Your Business?
              </h2>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                padding: '2.5rem 3rem',
                background: darkMode ? 'rgba(248, 250, 252, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                border: `2px solid ${darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'}`,
                boxShadow: darkMode ? 
                  '0 12px 40px rgba(0, 0, 0, 0.1)' :
                  '0 12px 40px rgba(0, 0, 0, 0.08)',
                animation: 'fadeInUp 0.8s ease-out',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(34, 197, 94, 0.25)',
                  flexShrink: 0
                }}>
                  <div style={{
                    fontSize: '2.2rem',
                    color: 'white',
                    fontWeight: '600'
                  }}>🚀</div>
                </div>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <h3 style={{
                    fontSize: '1.6rem',
                    fontWeight: '700',
                    color: darkMode ? '#1f2937' : '#1f2937',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Join the CRM Revolution
                  </h3>
                  <p style={{
                    fontSize: '1.1rem',
                    color: darkMode ? '#4b5563' : '#4b5563',
                    lineHeight: '1.6',
                    fontWeight: '400'
                  }}>
                    Transform your business with our intelligent CRM platform. 
                    Experience growth, efficiency, and customer satisfaction like never before.
                  </p>
                </div>
              </div>

              <p style={{
                fontSize: '1.5rem',
                color: darkMode ? '#d1fae5' : '#166534',
                marginBottom: '2.5rem',
                lineHeight: '1.6',
                opacity: '0.9'
              }}>
                Join thousands of Indian businesses scaling with our intelligent CRM
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
                marginBottom: '3rem'
              }}>
                {[
                  { icon: <Users size={32} />, text: '10,000+ Indian businesses' },
                  { icon: <TrendingUp size={32} />, text: '300% growth rate' },
                  { icon: <Star size={32} />, text: '4.9/5 user rating' }
                ].map((stat, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.5rem 2rem',
                    background: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '16px',
                    border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)'}`,
                    boxShadow: darkMode ? 
                      '0 8px 30px rgba(0, 0, 0, 0.3)' :
                      '0 8px 30px rgba(0, 0, 0, 0.1)',
                    animation: `fadeInUp 0.8s ease-out ${index * 0.2}s`
                  }}>
                    <div style={{
                      color: darkMode ? '#4ade80' : '#16a34a',
                      fontSize: '1.5rem'
                    }}>
                      {stat.icon}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: darkMode ? '#f9fafb' : '#1f2937'
                      }}>
                        {stat.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem'
              }}>
                {/* Primary CTA */}
                <button
                  onClick={onStartFreeTrial}
                  style={{
                    background: darkMode ? 
                      'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)' :
                      'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #15803d 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '1.75rem 4rem',
                    borderRadius: '12px',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 14px 40px rgba(34, 197, 94, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    position: 'relative',
                    overflow: 'hidden',
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-5px)';
                    e.target.style.boxShadow = '0 18px 50px rgba(34, 197, 94, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 14px 40px rgba(34, 197, 94, 0.4)';
                  }}
                >
                  Start Your Free Trial
                </button>

                {/* Secondary CTA */}
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  style={{
                    background: darkMode ? 
                      'rgba(255, 255, 255, 0.1)' :
                      'rgba(34, 197, 94, 0.1)',
                    color: darkMode ? '#d1d5db' : '#166534',
                    border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(34, 197, 94, 0.3)'}`,
                    padding: '1.25rem 3rem',
                    borderRadius: '12px',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: darkMode ? '0 8px 25px rgba(0, 0, 0, 0.2)' : '0 8px 25px rgba(0, 0, 0, 0.1)',
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = darkMode ? 
                      '0 12px 35px rgba(0, 0, 0, 0.3)' :
                      '0 12px 35px rgba(0, 0, 0, 0.2)';
                    e.target.style.borderColor = darkMode ? '#d1d5db' : '#16a34a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = darkMode ? '0 8px 25px rgba(0, 0, 0, 0.2)' : '0 8px 25px rgba(0, 0, 0, 0.1)';
                    e.target.style.borderColor = darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(34, 197, 94, 0.3)';
                  }}
                >
                  Book a Demo
                </button>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                justifyContent: 'center',
                marginTop: '2rem',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  background: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)'}`,
                  boxShadow: darkMode ? 
                    '0 4px 15px rgba(0, 0, 0, 0.2)' :
                    '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    fontSize: '1.25rem',
                    color: darkMode ? '#4ade80' : '#16a34a'
                  }}>⚡</div>
                  <span style={{
                    color: darkMode ? '#d1d5db' : '#374151',
                    fontSize: '0.875rem'
                  }}>No credit card required</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  background: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)'}`,
                  boxShadow: darkMode ? 
                    '0 4px 15px rgba(0, 0, 0, 0.2)' :
                    '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    fontSize: '1.25rem',
                    color: darkMode ? '#4ade80' : '#16a34a'
                  }}>⏰</div>
                  <span style={{
                    color: darkMode ? '#d1d5db' : '#374151',
                    fontSize: '0.875rem'
                  }}>14-day free trial</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  background: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(34, 197, 94, 0.2)'}`,
                  boxShadow: darkMode ? 
                    '0 4px 15px rgba(0, 0, 0, 0.2)' :
                    '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    fontSize: '1.25rem',
                    color: darkMode ? '#4ade80' : '#16a34a'
                  }}>🚀</div>
                  <span style={{
                    color: darkMode ? '#d1d5db' : '#374151',
                    fontSize: '0.875rem'
                  }}>Try it now →</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer id="contact" style={{
          padding: '4rem 2rem 2rem',
          background: darkMode ? '#1e293b' : '#f8fafc',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Floating shapes */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '15%',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 8s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 10s ease-in-out infinite reverse'
          }} />

          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '4rem',
            padding: '0 1rem'
          }}>
            {/* Company Info */}
            <div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: darkMode ? '#f9fafb' : '#1f2937',
                marginBottom: '1.5rem'
              }}>GreenCall CRM</div>
              <p style={{
                color: darkMode ? '#d1d5db' : '#4b5563',
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                The intelligent CRM platform built for Indian businesses. 
                Transform your customer relationships with our powerful tools.
              </p>
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <a href="#" style={{
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  fontSize: '1.5rem',
                  transition: 'color 0.3s ease'
                }}>
                  <Instagram size={24} />
                </a>
                <a href="#" style={{
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  fontSize: '1.5rem',
                  transition: 'color 0.3s ease'
                }}>
                  <Linkedin size={24} />
                </a>
                <a href="#" style={{
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  fontSize: '1.5rem',
                  transition: 'color 0.3s ease'
                }}>
                  <Twitter size={24} />
                </a>
                <a href="#" style={{
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  fontSize: '1.5rem',
                  transition: 'color 0.3s ease'
                }}>
                  <Github size={24} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: darkMode ? '#f9fafb' : '#1f2937',
                marginBottom: '1.5rem'
              }}>Quick Links</h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li style={{
                  marginBottom: '0.75rem'
                }}>
                  <a href="#hero" style={{
                    color: darkMode ? '#d1d5db' : '#4b5563',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease'
                  }}>Home</a>
                </li>
                <li style={{
                  marginBottom: '0.75rem'
                }}>
                  <a href="#features" style={{
                    color: darkMode ? '#d1d5db' : '#4b5563',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease'
                  }}>Features</a>
                </li>
                <li style={{
                  marginBottom: '0.75rem'
                }}>
                  <a href="#pricing" style={{
                    color: darkMode ? '#d1d5db' : '#4b5563',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease'
                  }}>Pricing</a>
                </li>
                <li style={{
                  marginBottom: '0.75rem'
                }}>
                  <a href="#testimonials" style={{
                    color: darkMode ? '#d1d5db' : '#4b5563',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease'
                  }}>Testimonials</a>
                </li>
                <li style={{
                  marginBottom: '0.75rem'
                }}>
                  <a href="#contact" style={{
                    color: darkMode ? '#d1d5db' : '#4b5563',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease'
                  }}>Contact</a>
                </li>
              </ul>
            </div>

            {/* Our Partners */}
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: darkMode ? '#f9fafb' : '#1f2937',
                marginBottom: '1.5rem'
              }}>Our Partners</h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <a href="#" style={{
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>JustJob</a>
                <a href="#" style={{
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>Talent Foundation</a>
                <a href="#" style={{
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>Vision India</a>
                <a href="#" style={{
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>Live Skills</a>
                <a href="#" style={{
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>GreenCall HRMS</a>
                <a href="#" style={{
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>GreenCall Website</a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: darkMode ? '#f9fafb' : '#1f2937',
                marginBottom: '1.5rem'
              }}>Contact Us</h3>
              <div style={{
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    fontSize: '1.25rem',
                    marginTop: '0.25rem'
                  }}><MapPin size={20} /></div>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Address</div>
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                      A-43, Sector-67, Noida,<br/>
                      Gautam Budhha Nagar,<br/>
                      Uttar Pradesh-201301, India
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    fontSize: '1.25rem'
                  }}><Mail size={20} /></div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Email</div>
                    <span style={{ fontSize: '0.9rem' }}>reachus@greencall.in</span>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    fontSize: '1.25rem'
                  }}><Phone size={20} /></div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Phone</div>
                    <span style={{ fontSize: '0.9rem' }}>+91 12031 01985</span>
                  </div>
                </div>
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'}`
                }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: darkMode ? '#4ade80' : '#16a34a',
                    marginBottom: '0.5rem'
                  }}>Connect With Us</div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: darkMode ? '#d1d5db' : '#4b5563',
                    lineHeight: '1.4'
                  }}>
                    Follow us on social media for updates and insights
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                style={{
                  background: darkMode ? 
                    'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)' :
                    'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #15803d 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
                }}
              >
                Book a Demo
              </button>
            </div>
          </div>
        </footer>
      </div>
      {isDemoModalOpen && <BookDemoModal onClose={() => setIsDemoModalOpen(false)} darkMode={darkMode} />}
    </>
  );
};

export default LandingPage;
