import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Download, Eye, CheckCircle, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';
import apiService from '../services/apiService';

const BillingManagement = ({ darkMode = false, userRole = 'sales-rep' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Plans from backend
  const [plans, setPlans] = useState([
    {
      value: 'basic',
      name: 'Basic Plan',
      price: 999,
      features: ['Up to 5 users', '1,000 leads', '2,000 emails/month', 'Basic support', 'Lead management'],
      popular: false,
      color: '#22c55e',
      limits: { users: 5, leads: 1000, emails: 2000 }
    },
    {
      value: 'professional', 
      name: 'Professional Plan',
      price: 2999,
      features: ['Up to 20 users', '5,000 leads', '10,000 emails/month', 'Priority support', 'Advanced analytics', 'WhatsApp integration'],
      popular: true,
      color: '#3b82f6',
      limits: { users: 20, leads: 5000, emails: 10000 }
    },
    {
      value: 'enterprise',
      name: 'Enterprise Plan', 
      price: 9999,
      features: ['Up to 50 users', '10,000 leads', 'Unlimited emails', '24/7 support', 'Custom integrations', 'API access', 'White labeling'],
      popular: false,
      color: '#f59e0b',
      limits: { users: 50, leads: 10000, emails: 'unlimited' }
    }
  ]);

  // Fetch company data and plans from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user's company data
        const teamResponse = await apiService.getTeamMembers();
        if (teamResponse.success && teamResponse.company) {
          const company = teamResponse.company;
          setCompanyData(company);
          
          // Set current plan from company data
          setCurrentPlan({
            value: company.plan.name,
            name: company.plan.name === 'basic' ? 'Basic Plan' : 
                  company.plan.name === 'professional' ? 'Professional Plan' : 'Enterprise Plan',
            price: company.plan.name === 'basic' ? 999 : 
                   company.plan.name === 'professional' ? 2999 : 9999,
            billingCycle: 'monthly',
            nextBilling: new Date(company.plan.endDate).toISOString().split('T')[0],
            status: company.status
          });
        }
        
        // Get plan configurations from backend
        try {
          const planResponse = await apiService.get('/companies/plans');
          if (planResponse.success && planResponse.plans) {
            const backendPlans = Object.entries(planResponse.plans).map(([key, plan]) => ({
              value: key,
              name: key === 'basic' ? 'Basic Plan' : 
                    key === 'professional' ? 'Professional Plan' : 'Enterprise Plan',
              price: key === 'basic' ? 999 : key === 'professional' ? 2999 : 9999,
              features: plan.features || [],
              popular: key === 'professional',
              color: key === 'basic' ? '#22c55e' : key === 'professional' ? '#3b82f6' : '#f59e0b',
              limits: {
                users: plan.usersLimit === -1 ? 'unlimited' : plan.usersLimit,
                leads: plan.leadsLimit === -1 ? 'unlimited' : plan.leadsLimit,
                emails: plan.emailLimit === -1 ? 'unlimited' : plan.emailLimit
              }
            }));
            setPlans(backendPlans);
          }
        } catch (error) {
          console.log('Using default plans, backend plans not available');
        }
        
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const [invoices] = useState([
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: 2499,
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-15',
      amount: 2499,
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-15',
      amount: 2499,
      status: 'paid',
      downloadUrl: '#'
    }
  ]);

  const [paymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: 2,
      type: 'upi',
      upiId: 'user@paytm',
      isDefault: false
    }
  ]);

  const containerStyle = {
    padding: '0',
    background: darkMode ? '#111827' : '#f9fafb',
    minHeight: '100vh'
  };

  const cardStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CreditCard style={{ color: '#22c55e' }} size={32} />
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0
            }}>
              Billing & Payments
            </h1>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
              Manage your subscription and payment methods
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ ...cardStyle, padding: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'invoices', label: 'Invoices', icon: Download },
            { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard },
            { id: 'usage-reports', label: 'Usage Reports', icon: DollarSign }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, #22c55e, #4ade80)'
                    : 'transparent',
                  color: activeTab === tab.id ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #22c55e',
            borderRadius: '50%'
          }} className="loading-spinner" />
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem' }}>
            Loading billing information...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && !currentPlan && (
        <div style={{
          ...cardStyle,
          padding: '3rem',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Unable to Load Billing Information
          </h3>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1.5rem' }}>
            Please contact your administrator or try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #22c55e, #4ade80)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Refresh Page
          </button>
        </div>
      )}

      {/* Overview Tab */}
      {!loading && activeTab === 'overview' && currentPlan && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Current Plan */}
          <div style={{ ...cardStyle, padding: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1.5rem'
            }}>
              Current Plan
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                padding: '1.5rem',
                background: darkMode ? '#374151' : '#f9fafb',
                borderRadius: '12px',
                border: `2px solid #22c55e`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <CheckCircle size={20} style={{ color: '#22c55e' }} />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#22c55e'
                  }}>
                    ACTIVE
                  </span>
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: darkMode ? 'white' : '#1f2937',
                  margin: 0
                }}>
                  {currentPlan.name}
                </h3>
                <p style={{
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  margin: 0
                }}>
                  ₹{currentPlan.price.toLocaleString()}/{currentPlan.billingCycle}
                </p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: darkMode ? '#374151' : '#f9fafb',
                borderRadius: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <Calendar size={20} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    NEXT BILLING
                  </span>
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  margin: 0
                }}>
                  {new Date(currentPlan.nextBilling).toLocaleDateString()}
                </h3>
                <p style={{
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  margin: 0
                }}>
                  Auto-renewal enabled
                </p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: darkMode ? '#374151' : '#f9fafb',
                borderRadius: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <DollarSign size={20} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    TOTAL SPENT
                  </span>
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  margin: 0
                }}>
                  ₹{(currentPlan.price * 3).toLocaleString()}
                </h3>
                <p style={{
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  margin: 0
                }}>
                  Last 3 months
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setShowPlanModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                {userRole === 'super-admin' ? 'Upgrade Plan' : 'View Plans'}
              </button>
              {userRole === 'super-admin' && (
                <button 
                  onClick={() => {
                    setCurrentPlan(prev => ({ ...prev, status: 'cancelled' }));
                    alert('Plan cancelled successfully! Your current plan will remain active until the end of billing cycle.');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                  Cancel Plan
                </button>
              )}
            </div>
          </div>

          {/* CRM Analytics */}
          <div style={{ ...cardStyle, padding: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1.5rem'
            }}>
              CRM Usage & Analytics
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              {[
                { 
                  label: 'Users', 
                  current: companyData?.usage?.currentUsers || 0, 
                  limit: companyData?.plan?.usersLimit === -1 ? 'unlimited' : (companyData?.plan?.usersLimit || 5), 
                  unit: '' 
                },
                { 
                  label: 'Leads', 
                  current: companyData?.usage?.currentLeads || 0, 
                  limit: companyData?.plan?.leadsLimit === -1 ? 'unlimited' : (companyData?.plan?.leadsLimit || 1000), 
                  unit: '' 
                },
                { 
                  label: 'Customers', 
                  current: companyData?.usage?.currentCustomers || 0, 
                  limit: companyData?.plan?.customersLimit === -1 ? 'unlimited' : (companyData?.plan?.customersLimit || 500), 
                  unit: '' 
                },
                { 
                  label: 'Email Credits', 
                  current: companyData?.usage?.emailsSent || 0, 
                  limit: companyData?.plan?.emailLimit === -1 ? 'unlimited' : (companyData?.plan?.emailLimit || 1000), 
                  unit: '' 
                },
                { 
                  label: 'SMS Credits', 
                  current: companyData?.usage?.smsSent || 0, 
                  limit: companyData?.plan?.smsLimit || 100, 
                  unit: '' 
                },
                { 
                  label: 'Storage Used', 
                  current: companyData?.usage?.storageUsed || 0, 
                  limit: companyData?.plan?.storageLimit || 1, 
                  unit: ' GB' 
                }
              ].map((stat, index) => {
                const percentage = stat.limit === 'unlimited' ? 100 : (stat.current / stat.limit) * 100;
                return (
                  <div key={index} style={{
                    padding: '1.5rem',
                    background: darkMode ? '#374151' : '#f9fafb',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      marginBottom: '0.5rem'
                    }}>
                      {stat.label.toUpperCase()}
                    </h4>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: darkMode ? 'white' : '#1f2937',
                      marginBottom: '0.5rem'
                    }}>
                      {stat.current.toLocaleString()}{stat.unit} / {stat.limit === 'unlimited' ? '∞' : stat.limit.toLocaleString()}{stat.unit}
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: darkMode ? '#4b5563' : '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: stat.limit === 'unlimited' ? '100%' : `${percentage}%`,
                        height: '100%',
                        background: stat.limit === 'unlimited' ? '#22c55e' : (percentage > 80 ? '#ef4444' : percentage > 60 ? '#f59e0b' : '#22c55e'),
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Revenue Analytics */}
            <div style={{
              marginTop: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  opacity: 0.9
                }}>
                  REVENUE GENERATED
                </h4>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem'
                }}>
                  ₹1,25,000
                </div>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '0.875rem' }}>
                  From converted leads this month
                </p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  opacity: 0.9
                }}>
                  CONVERSION RATE
                </h4>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem'
                }}>
                  18.5%
                </div>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '0.875rem' }}>
                  Lead to customer conversion
                </p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  opacity: 0.9
                }}>
                  AVG DEAL SIZE
                </h4>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem'
                }}>
                  ₹45,000
                </div>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '0.875rem' }}>
                  Per successful conversion
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Management */}
          <div style={{ ...cardStyle, padding: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1.5rem'
            }}>
              Subscription Management
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                padding: '1.5rem',
                background: darkMode ? '#374151' : '#f9fafb',
                borderRadius: '12px',
                border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Add-ons Available
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { name: 'Advanced Analytics', price: 500, description: 'Detailed reports & insights' },
                    { name: 'WhatsApp Business API', price: 800, description: 'Official WhatsApp integration' },
                    { name: 'Custom Branding', price: 300, description: 'White-label solution' },
                    { name: 'Priority Support', price: 200, description: '24/7 dedicated support' }
                  ].map((addon, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: darkMode ? '#4b5563' : 'white',
                      borderRadius: '8px',
                      border: `1px solid ${darkMode ? '#6b7280' : '#e5e7eb'}`
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: darkMode ? 'white' : '#1f2937'
                        }}>
                          {addon.name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: darkMode ? '#9ca3af' : '#6b7280'
                        }}>
                          {addon.description}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: darkMode ? 'white' : '#1f2937'
                        }}>
                          ₹{addon.price}/mo
                        </div>
                        <button style={{
                          padding: '0.25rem 0.75rem',
                          background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          marginTop: '0.25rem'
                        }}>
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: darkMode ? '#374151' : '#f9fafb',
                borderRadius: '12px',
                border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Billing Preferences
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Billing Cycle
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#4b5563' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem'
                    }}>
                      <option>Monthly</option>
                      <option>Quarterly (5% discount)</option>
                      <option>Yearly (15% discount)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Auto-renewal
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" defaultChecked style={{ marginRight: '0.5rem' }} />
                      <span style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#d1d5db' : '#374151'
                      }}>
                        Automatically renew subscription
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Invoice Email
                    </label>
                    <input
                      type="email"
                      defaultValue="billing@company.com"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        background: darkMode ? '#4b5563' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>

                  <button style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginTop: '0.5rem'
                  }}>
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {!loading && activeTab === 'invoices' && (
        <div style={{ ...cardStyle, padding: '2rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '1.5rem'
          }}>
            Invoice History
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    Invoice ID
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    Date
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    Amount
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id} style={{ borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: darkMode ? 'white' : '#1f2937',
                      fontWeight: '500'
                    }}>
                      {invoice.id}
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}>
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: darkMode ? '#d1d5db' : '#374151',
                      fontWeight: '600'
                    }}>
                      ₹{invoice.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: invoice.status === 'paid' ? '#dcfce7' : '#fee2e2',
                        color: invoice.status === 'paid' ? '#16a34a' : '#dc2626'
                      }}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{
                          padding: '0.5rem',
                          background: 'transparent',
                          border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: darkMode ? '#d1d5db' : '#374151'
                        }}>
                          <Eye size={14} />
                        </button>
                        <button style={{
                          padding: '0.5rem',
                          background: 'transparent',
                          border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: darkMode ? '#d1d5db' : '#374151'
                        }}>
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {!loading && activeTab === 'payment-methods' && (
        <div style={{ ...cardStyle, padding: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0
            }}>
              Payment Methods
            </h2>
            <button style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #22c55e, #4ade80)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              Add Payment Method
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paymentMethods.map(method => (
              <div key={method.id} style={{
                padding: '1.5rem',
                background: darkMode ? '#374151' : '#f9fafb',
                borderRadius: '12px',
                border: method.isDefault ? `2px solid #22c55e` : `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '32px',
                    background: method.type === 'card' ? '#1a365d' : '#7c3aed',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {method.type === 'card' ? method.brand : 'UPI'}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: darkMode ? 'white' : '#1f2937'
                    }}>
                      {method.type === 'card' 
                        ? `•••• •••• •••• ${method.last4}`
                        : method.upiId
                      }
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      {method.type === 'card' 
                        ? `Expires ${method.expiryMonth}/${method.expiryYear}`
                        : 'UPI Payment'
                      }
                    </div>
                  </div>
                  {method.isDefault && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: '#dcfce7',
                      color: '#16a34a'
                    }}>
                      DEFAULT
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!method.isDefault && (
                    <button style={{
                      padding: '0.5rem 1rem',
                      background: 'transparent',
                      color: '#22c55e',
                      border: `1px solid #22c55e`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Set Default
                    </button>
                  )}
                  <button style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    color: '#ef4444',
                    border: `1px solid #ef4444`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Reports Tab */}
      {!loading && activeTab === 'usage-reports' && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Monthly Usage Report */}
          <div style={{ ...cardStyle, padding: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1.5rem'
            }}>
              Monthly Usage Report
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {[
                { label: 'Total Leads Created', value: 450, change: '+12%', color: '#22c55e' },
                { label: 'Customers Acquired', value: 85, change: '+8%', color: '#3b82f6' },
                { label: 'Emails Sent', value: 2800, change: '+15%', color: '#8b5cf6' },
                { label: 'Revenue Generated', value: '₹1,25,000', change: '+22%', color: '#f59e0b' }
              ].map((metric, index) => (
                <div key={index} style={{
                  padding: '1.5rem',
                  background: darkMode ? '#374151' : '#f9fafb',
                  borderRadius: '12px',
                  border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    marginBottom: '0.5rem'
                  }}>
                    {metric.label.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: darkMode ? 'white' : '#1f2937',
                    marginBottom: '0.5rem'
                  }}>
                    {metric.value}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: metric.color,
                    fontWeight: '600'
                  }}>
                    {metric.change} from last month
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Timeline */}
            <div style={{
              background: darkMode ? '#374151' : '#f9fafb',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1rem'
              }}>
                Recent Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { time: '2 hours ago', action: 'Bulk email sent to 150 leads', type: 'email' },
                  { time: '5 hours ago', action: 'New customer onboarded - TechCorp Ltd', type: 'customer' },
                  { time: '1 day ago', action: 'WhatsApp campaign completed - 85% delivery', type: 'whatsapp' },
                  { time: '2 days ago', action: 'Monthly invoice generated - ₹2,499', type: 'billing' },
                  { time: '3 days ago', action: 'Lead scoring updated for 200+ leads', type: 'system' }
                ].map((activity, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    background: darkMode ? '#4b5563' : 'white',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? '#6b7280' : '#e5e7eb'}`
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: activity.type === 'email' ? '#3b82f6' :
                                 activity.type === 'customer' ? '#22c55e' :
                                 activity.type === 'whatsapp' ? '#10b981' :
                                 activity.type === 'billing' ? '#f59e0b' : '#8b5cf6'
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.875rem',
                        color: darkMode ? 'white' : '#1f2937',
                        fontWeight: '500'
                      }}>
                        {activity.action}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Analysis */}
          <div style={{ ...cardStyle, padding: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1.5rem'
            }}>
              Cost Analysis & ROI
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                padding: '1.5rem',
                background: darkMode ? '#374151' : '#f9fafb',
                borderRadius: '12px'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Monthly Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { item: 'CRM Subscription', cost: currentPlan?.price || 2999, percentage: 65 },
                    { item: 'SMS Credits', cost: 450, percentage: 12 },
                    { item: 'Email Credits', cost: 300, percentage: 8 },
                    { item: 'WhatsApp API', cost: 580, percentage: 15 }
                  ].map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: darkMode ? '#4b5563' : 'white',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: darkMode ? 'white' : '#1f2937'
                        }}>
                          {item.item}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: darkMode ? '#9ca3af' : '#6b7280'
                        }}>
                          {item.percentage}% of total
                        </div>
                      </div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: darkMode ? 'white' : '#1f2937'
                      }}>
                        ₹{item.cost}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  opacity: 0.95
                }}>
                  ROI Analysis
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      opacity: 0.9,
                      marginBottom: '0.25rem'
                    }}>
                      Total Investment
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700'
                    }}>
                      ₹3,829/month
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      opacity: 0.9,
                      marginBottom: '0.25rem'
                    }}>
                      Revenue Generated
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700'
                    }}>
                      ₹1,25,000/month
                    </div>
                  </div>
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      opacity: 0.9,
                      marginBottom: '0.25rem'
                    }}>
                      Return on Investment
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700'
                    }}>
                      3,165%
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      opacity: 0.8
                    }}>
                      Excellent ROI performance
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Switching Modal */}
      {showPlanModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }} onClick={() => setShowPlanModal(false)}>
          <div style={{
            background: darkMode ? '#1f2937' : 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '1.5rem',
              borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0,
                marginBottom: '0.5rem'
              }}>
                Choose Your Plan
              </h2>
              <p style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                margin: 0,
                fontSize: '0.875rem'
              }}>
                Select the perfect plan for your business needs
              </p>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                {plans.map((plan, index) => (
                  <div key={index} style={{
                    padding: '1.5rem',
                    background: darkMode ? '#374151' : '#f9fafb',
                    borderRadius: '12px',
                    border: plan.popular ? '2px solid #22c55e' : `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                    position: 'relative',
                    transition: 'transform 0.2s ease',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    {plan.popular && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        MOST POPULAR
                      </div>
                    )}
                    
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: darkMode ? 'white' : '#1f2937',
                        marginBottom: '0.5rem'
                      }}>
                        {plan.name}
                      </h3>
                      <div style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        color: darkMode ? 'white' : '#1f2937',
                        marginBottom: '0.25rem'
                      }}>
                        ₹{plan.price.toLocaleString()}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}>
                        per month
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}>
                          <CheckCircle size={14} style={{ color: '#22c55e' }} />
                          <span style={{
                            fontSize: '0.75rem',
                            color: darkMode ? '#d1d5db' : '#374151'
                          }}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={async () => {
                        if (userRole === 'super-admin' || userRole === 'admin') {
                          try {
                            setSelectedPlan(plan);
                            setShowPlanModal(false);
                            setShowCongrats(true);
                            
                            // Update plan via backend API
                            if (companyData?._id) {
                              await apiService.put(`/companies/${companyData._id}/plan`, {
                                planName: plan.value
                              });
                              
                              // Update local state after successful backend update
                              setTimeout(() => {
                                setCurrentPlan({
                                  value: plan.value,
                                  name: plan.name,
                                  price: plan.price,
                                  billingCycle: 'monthly',
                                  nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                  status: 'active'
                                });
                                
                                // Refresh company data
                                const refreshData = async () => {
                                  try {
                                    const teamResponse = await apiService.getTeamMembers();
                                    if (teamResponse.success && teamResponse.company) {
                                      setCompanyData(teamResponse.company);
                                    }
                                  } catch (error) {
                                    console.error('Error refreshing company data:', error);
                                  }
                                };
                                refreshData();
                              }, 2000);
                            }
                          } catch (error) {
                            console.error('Error updating plan:', error);
                            alert('Failed to update plan. Please try again.');
                            setShowCongrats(false);
                            setSelectedPlan(null);
                          }
                        } else {
                          alert('Please contact your administrator to upgrade your plan.');
                          setShowPlanModal(false);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '0.625rem 1rem',
                        background: currentPlan.value === plan.value 
                          ? 'transparent'
                          : plan.popular 
                            ? 'linear-gradient(135deg, #22c55e, #4ade80)'
                            : 'transparent',
                        color: currentPlan.value === plan.value
                          ? (darkMode ? '#9ca3af' : '#6b7280')
                          : plan.popular 
                            ? 'white'
                            : (darkMode ? '#d1d5db' : '#374151'),
                        border: currentPlan.value === plan.value
                          ? `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
                          : plan.popular
                            ? 'none'
                            : `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '8px',
                        cursor: currentPlan.value === plan.value ? 'default' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                      disabled={currentPlan.value === plan.value}
                    >
                      {currentPlan.value === plan.value ? 'Current Plan' : 
                       userRole === 'super-admin' ? 'Switch to This Plan' : 'Contact Admin'}
                    </button>
                  </div>
                ))}
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '2rem'
              }}>
                <button 
                  onClick={() => setShowPlanModal(false)}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'transparent',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Congratulations Modal with Gift Animation */}
      {showCongrats && selectedPlan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fadeIn 0.5s ease-in'
        }}>
          <div style={{
            background: darkMode ? '#1f2937' : 'white',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '500px',
            width: '90%',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Confetti Animation */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              overflow: 'hidden'
            }}>
              {[...Array(20)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  background: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
                  left: `${Math.random() * 100}%`,
                  animation: `confetti 3s ease-out ${Math.random() * 2}s infinite`,
                  borderRadius: '50%'
                }} />)
              )}
            </div>

            {/* Gift Box Animation */}
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem',
              animation: 'giftBounce 2s ease-in-out'
            }}>
              🎁
            </div>

            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1rem',
              animation: 'slideUp 1s ease-out 0.5s both'
            }}>
              🎉 Congratulations!
            </h2>

            <p style={{
              fontSize: '1.25rem',
              color: darkMode ? '#d1d5db' : '#4b5563',
              marginBottom: '1.5rem',
              animation: 'slideUp 1s ease-out 0.7s both'
            }}>
              You've successfully upgraded to the <strong>{selectedPlan.name}</strong> plan!
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #22c55e, #4ade80)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              animation: 'slideUp 1s ease-out 0.9s both'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                ₹{selectedPlan.price.toLocaleString()}/month
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Your new plan is now active!
              </div>
            </div>

            <button 
              onClick={() => {
                setShowCongrats(false);
                setSelectedPlan(null);
              }}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                animation: 'slideUp 1s ease-out 1.1s both'
              }}
            >
              Awesome! Let's Go 🚀
            </button>
          </div>

          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes giftBounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-20px) scale(1.1); }
              60% { transform: translateY(-10px) scale(1.05); }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes confetti {
              0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;