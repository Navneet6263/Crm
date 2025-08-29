import React from 'react';
import { FaUsers, FaUserShield, FaDatabase, FaChartLine, FaCrown } from 'react-icons/fa';

const PlanLimitsDisplay = ({ currentPlan = 'basic', usage = {}, darkMode }) => {
  const planFeatures = {
    basic: {
      name: 'Basic Plan',
      price: '₹999/month',
      maxUsers: 5,
      maxManagers: 1,
      maxLeads: 1000,
      maxReports: 10,
      features: ['Basic CRM', 'Lead Management', 'Email Support'],
      color: '#22c55e'
    },
    professional: {
      name: 'Professional Plan', 
      price: '₹2999/month',
      maxUsers: 25,
      maxManagers: 5,
      maxLeads: 10000,
      maxReports: 50,
      features: ['Advanced CRM', 'Team Management', 'Analytics', 'Phone Support'],
      color: '#667eea'
    },
    enterprise: {
      name: 'Enterprise Plan',
      price: '₹9999/month',
      maxUsers: 100,
      maxManagers: 20,
      maxLeads: 100000,
      maxReports: 'Unlimited',
      features: ['Full CRM Suite', 'Advanced Analytics', 'API Access', '24/7 Support'],
      color: '#f59e0b'
    }
  };

  const plan = planFeatures[currentPlan];
  
  const getUsagePercentage = (used, max) => {
    if (max === 'Unlimited') return 0;
    return Math.min((used / max) * 100, 100);
  };



  const usageStats = [
    {
      label: 'Users',
      icon: FaUsers,
      current: usage.users || 0,
      max: plan.maxUsers,
      percentage: getUsagePercentage(usage.users || 0, plan.maxUsers)
    },
    {
      label: 'Managers',
      icon: FaUserShield,
      current: usage.managers || 0,
      max: plan.maxManagers,
      percentage: getUsagePercentage(usage.managers || 0, plan.maxManagers)
    },
    {
      label: 'Leads',
      icon: FaDatabase,
      current: usage.leads || 0,
      max: plan.maxLeads,
      percentage: getUsagePercentage(usage.leads || 0, plan.maxLeads)
    },
    {
      label: 'Reports',
      icon: FaChartLine,
      current: usage.reports || 0,
      max: plan.maxReports,
      percentage: getUsagePercentage(usage.reports || 0, plan.maxReports)
    }
  ];

  return (
    <div style={{
      background: darkMode ? '#1f2937' : 'white',
      borderRadius: '12px',
      boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '2rem'
    }}>
      {/* Plan Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: plan.color + '20'
          }}>
            <FaCrown style={{ color: plan.color, fontSize: '1.25rem' }} />
          </div>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '0.25rem'
            }}>
              {plan.name}
            </h3>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>{plan.price}</p>
          </div>
        </div>
        <button style={{
          background: 'transparent',
          color: '#3b82f6',
          border: '1px solid #3b82f6',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          Upgrade Plan
        </button>
      </div>

      {/* Usage Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {usageStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} style={{
              background: darkMode ? '#374151' : '#f9fafb',
              padding: '1rem',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                  <span style={{
                    fontWeight: '500',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '0.875rem'
                  }}>
                    {stat.label}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  {stat.current}/{stat.max === 'Unlimited' ? '∞' : stat.max}
                </span>
              </div>
              
              {stat.max !== 'Unlimited' && (
                <div style={{
                  width: '100%',
                  background: darkMode ? '#4b5563' : '#e5e7eb',
                  borderRadius: '9999px',
                  height: '8px'
                }}>
                  <div style={{
                    height: '8px',
                    borderRadius: '9999px',
                    width: `${stat.percentage}%`,
                    background: stat.percentage >= 90 ? '#ef4444' : stat.percentage >= 75 ? '#f59e0b' : '#10b981',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
              )}
              
              {stat.percentage >= 90 && stat.max !== 'Unlimited' && (
                <p style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#fca5a5' : '#dc2626',
                  marginTop: '0.25rem'
                }}>
                  ⚠️ Limit के करीब पहुंच गए हैं!
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Plan Features */}
      <div>
        <h4 style={{
          fontWeight: '600',
          color: darkMode ? 'white' : '#1f2937',
          marginBottom: '1rem',
          fontSize: '1rem'
        }}>
          Current Plan Features:
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.5rem'
        }}>
          {plan.features.map((feature, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981'
              }}></div>
              <span style={{
                fontSize: '0.875rem',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Warning */}
      {(usage.users >= plan.maxUsers * 0.8 || usage.managers >= plan.maxManagers * 0.8) && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: darkMode ? '#451a03' : '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaCrown style={{ color: '#f59e0b' }} />
            <div>
              <h5 style={{
                fontWeight: '600',
                color: darkMode ? '#fbbf24' : '#92400e',
                fontSize: '0.875rem',
                marginBottom: '0.25rem'
              }}>
                Plan Upgrade की जरूरत!
              </h5>
              <p style={{
                fontSize: '0.75rem',
                color: darkMode ? '#fbbf24' : '#92400e'
              }}>
                आप अपनी limits के करीब पहुंच गए हैं। बेहतर performance के लिए plan upgrade करें।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanLimitsDisplay;