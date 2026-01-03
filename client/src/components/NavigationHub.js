import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  ClipboardList, 
  HeadphonesIcon, 
  Settings, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const NavigationHub = ({ userName, userRole, onNavigate, darkMode, recentActivity }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Navigation cards configuration
  const navigationCards = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'View your overview and analytics',
      icon: LayoutDashboard,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      stats: recentActivity?.dashboardViews || null
    },
    {
      id: 'add-lead',
      title: 'Add Lead',
      description: 'Create a new lead entry',
      icon: UserPlus,
      color: '#22c55e',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      stats: null
    },
    {
      id: 'my-leads',
      title: 'My Leads',
      description: 'Manage your assigned leads',
      icon: Users,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      stats: recentActivity?.myLeadsCount || null
    },
    {
      id: 'leads',
      title: 'All Leads',
      description: 'Browse all company leads',
      icon: ClipboardList,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      stats: recentActivity?.totalLeads || null
    },
    {
      id: 'support',
      title: 'Support Center',
      description: 'Get help and assistance',
      icon: HeadphonesIcon,
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      stats: null
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage your preferences',
      icon: Settings,
      color: '#6b7280',
      gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      stats: null
    },
    {
      id: 'lead-history',
      title: 'Recent Activity',
      description: 'View your recent actions',
      icon: Clock,
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      stats: recentActivity?.recentCount || null
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Detailed reports and insights',
      icon: TrendingUp,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      stats: null
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 25%, #8b5cf6 50%, #3b82f6 75%, #10b981 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: '200px',
        height: '200px',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'float 10s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '25%',
        width: '150px',
        height: '150px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        filter: 'blur(30px)',
        animation: 'float 12s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Animated sparkle dots */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 8 + 4 + 'px',
            height: Math.random() * 8 + 4 + 'px',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animation: `sparkleFloat ${Math.random() * 4 + 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            pointerEvents: 'none'
          }}
        />
      ))}

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          animation: 'fadeInDown 0.6s ease-out'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '0.5rem 1.5rem',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            <Sparkles size={16} />
            <span>{getGreeting()}</span>
          </div>

          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            Welcome back, {userName}
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '500',
            opacity: 0.9
          }}>
            What would you like to do today?
          </p>
        </div>

        {/* Continue where you left off */}
        {recentActivity?.lastView && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '1.5rem 2rem',
            borderRadius: '20px',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'fadeInUp 0.6s ease-out 0.2s both',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => onNavigate(recentActivity.lastView)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = darkMode 
              ? '0 15px 50px rgba(0, 0, 0, 0.4)'
              : '0 15px 50px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = darkMode 
              ? '0 10px 40px rgba(0, 0, 0, 0.3)'
              : '0 10px 40px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)'
              }}>
                <ChevronRight size={24} color="white" />
              </div>
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Continue where you left off
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  You were viewing: {recentActivity.lastViewName}
                </div>
              </div>
            </div>
            <ChevronRight size={24} color="#6b7280" />
          </div>
        )}

        {/* Navigation Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          animation: 'fadeInUp 0.6s ease-out 0.3s both'
        }}>
          {navigationCards.map((card, index) => {
            const Icon = card.icon;
            const isHovered = hoveredCard === card.id;

            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  padding: '2rem',
                  borderRadius: '24px',
                  border: `2px solid ${isHovered ? card.color : 'rgba(255, 255, 255, 0.3)'}`,
                  boxShadow: isHovered
                    ? `0 32px 64px ${card.color}40`
                    : '0 32px 64px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `fadeInUp 0.6s ease-out ${0.1 * index}s both`
                }}
              >
                {/* Gradient overlay on hover */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: card.gradient,
                  opacity: isHovered ? 0.05 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Icon */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: isHovered ? card.gradient : 'rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    transition: 'all 0.3s ease',
                    boxShadow: isHovered ? `0 10px 30px ${card.color}40` : 'none'
                  }}>
                    <Icon 
                      size={28} 
                      color={isHovered ? 'white' : card.color}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Title and Description */}
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem',
                    transition: 'color 0.3s ease'
                  }}>
                    {card.title}
                  </h3>

                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '1rem',
                    lineHeight: '1.5'
                  }}>
                    {card.description}
                  </p>

                  {/* Stats badge */}
                  {card.stats !== null && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '50px',
                      border: `1px solid ${darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#4ade80' : '#16a34a'
                    }}>
                      <span>{card.stats} {card.id === 'my-leads' ? 'new' : ''}</span>
                    </div>
                  )}

                  {/* Arrow indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    right: '1.5rem',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isHovered ? card.gradient : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
                    opacity: isHovered ? 1 : 0
                  }}>
                    <ChevronRight size={20} color="white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes sparkleFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-30px) translateX(15px) scale(1.2);
            opacity: 1;
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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
      `}</style>
    </div>
  );
};

export default NavigationHub;
