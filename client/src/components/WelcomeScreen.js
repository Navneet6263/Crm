import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const WelcomeScreen = ({ userName, onComplete, darkMode }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 1.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    // Complete transition after 2 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: darkMode 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e3a2f 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
      overflow: 'hidden'
    }}>
      {/* Animated particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            background: darkMode ? 'rgba(74, 222, 128, 0.3)' : 'rgba(34, 197, 94, 0.3)',
            borderRadius: '50%',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}

      {/* Main content */}
      <div style={{
        textAlign: 'center',
        animation: 'fadeInUp 0.6s ease-out',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo/Icon */}
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 2rem',
          background: darkMode
            ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
            : 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
          borderRadius: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: darkMode
            ? '0 20px 60px rgba(34, 197, 94, 0.4)'
            : '0 20px 60px rgba(34, 197, 94, 0.3)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <Sparkles size={60} color="white" strokeWidth={2} />
        </div>

        {/* Welcome text */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: darkMode ? '#f9fafb' : '#1f2937',
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          Welcome back, {userName}
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: darkMode ? '#d1fae5' : '#166534',
          fontWeight: '500',
          opacity: 0.9
        }}>
          We're happy to see you again
        </p>

        {/* Loading indicator */}
        <div style={{
          marginTop: '3rem',
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center'
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: darkMode ? '#4ade80' : '#16a34a',
                animation: `bounce 1s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;
