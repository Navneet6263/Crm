import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign,
  Target,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  Activity,
  UserCheck,
  Check,
  X
} from 'lucide-react';
import apiService from '../services/apiService';

const ProfessionalDashboard = ({ darkMode, crmData, user, setActiveView }) => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [quickStats, setQuickStats] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalItems, setModalItems] = useState([]);
  const [demoRequests, setDemoRequests] = useState([]);
  const [leads, setLeads] = useState([]);

  const handleStatCardClick = (stat) => {
    console.log('Stat card clicked:', stat.title);
    let items = [];
    const allLeads = crmData.leads || [];
    console.log('Available leads:', allLeads.length);

    switch (stat.view) {
      case 'leads':
        setModalTitle(stat.title);
        items = allLeads.map(l => ({ id: l.id, name: l.contactPerson, company: l.companyName }));
        break;
      case 'customers':
        setModalTitle('Converted Leads (Customers)');
        items = allLeads.filter(l => l.status === 'converted').map(l => ({ id: l.id, name: l.contactPerson, company: l.companyName }));
        break;
      case 'my-leads': // This is for 'Hot Leads'
        setModalTitle('Hot Leads (High Priority)');
        items = allLeads.filter(l => l.priority === 'high' && l.status !== 'converted').map(l => ({ id: l.id, name: l.contactPerson, company: l.companyName }));
        break;
      default:
        return;
    }

    console.log('Modal items:', items);
    setModalItems(items);
    setIsModalOpen(true);
    console.log('Modal should be open now');
  };

  useEffect(() => {
    // Fetch leads from apiService
    const fetchLeads = async () => {
      try {
        const fetchedLeads = await apiService.getAllLeads();
        setLeads(fetchedLeads);
        console.log('📋 Fetched leads for dashboard:', fetchedLeads.length);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setLeads([]);
      }
    };
    
    fetchLeads();
  }, []);
  
  useEffect(() => {
    // Calculate quick stats
    const customers = crmData.customers || [];
    
    const stats = {
      totalLeads: leads.length,
      totalCustomers: customers.length,
      pipelineValue: Array.isArray(leads) ? leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0) : 0,
      conversionRate: Array.isArray(leads) && leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0,
      newLeadsThisWeek: Array.isArray(leads) ? leads.filter(l => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(l.createdDate) > weekAgo;
      }).length : 0,
      hotLeads: Array.isArray(leads) ? leads.filter(l => l.priority === 'high' && l.status !== 'converted').length : 0
    };
    
    setQuickStats(stats);

    // Generate activities from real data
    const activities = [];
    
    // Add recent lead activities
    const leadsArray = Array.isArray(leads) ? leads : [];
    leadsArray.slice(0, 4).forEach((lead, index) => {
      activities.push({
        id: index + 1,
        type: 'lead_created',
        message: `New lead: ${lead.companyName}`,
        time: new Date(lead.createdDate).toLocaleDateString(),
        icon: Users,
        color: '#22c55e'
      });
    });
    
    setRecentActivities(activities);

    // Generate tasks from real leads
    const tasks = [];
    
    // Create follow-up tasks for high priority leads
    leadsArray.filter(l => l.priority === 'high' && l.status !== 'converted').slice(0, 3).forEach((lead, index) => {
      tasks.push({
        id: index + 1,
        title: `Follow up with ${lead.companyName}`,
        dueDate: 'Today',
        priority: lead.priority,
        type: 'call'
      });
    });
    
    setUpcomingTasks(tasks);

    // Fetch demo requests for super-admin
    if (user?.role === 'super-admin') {
      const fetchDemoRequests = async () => {
        try {
          const requests = await apiService.getDemoRequests();
          setDemoRequests(requests.filter(req => req.status === 'pending'));
        } catch (error) {
          console.error("Failed to fetch demo requests:", error);
          setDemoRequests([]); // Set to empty array on error
        }
      };
      fetchDemoRequests();
    }
  }, [crmData, user, leads]);

  const containerStyle = {
    padding: '0',
    background: darkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    minHeight: '100vh',
    color: darkMode ? '#f8fafc' : '#1f2937',
    position: 'relative',
    overflow: 'hidden'
  };

  const cardStyle = {
    background: darkMode ? '#1e293b' : 'white',
    borderRadius: '16px',
    boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  };

  const modalContentStyle = {
    background: darkMode ? '#1e293b' : 'white',
    padding: '1.5rem',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
  };

  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    paddingBottom: '1rem',
    marginBottom: '1rem',
    color: darkMode ? 'white' : '#1f2937'
  };

  const modalBodyStyle = {
    overflowY: 'auto',
    color: darkMode ? '#d1d5db' : '#374151'
  };

  const listItemStyle = {
    padding: '0.75rem 0.25rem',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    listStyle: 'none'
  };

  const closeButtonStyle = {
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: darkMode ? '#9ca3af' : '#6b7280'
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      if (action === 'approve') {
        await apiService.approveDemoRequest(requestId);
      } else {
        await apiService.rejectDemoRequest(requestId);
      }
      setDemoRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slideInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      {/* Modern Glassmorphism Header */}
      <div style={{
        background: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '0 0 32px 32px',
        padding: '2rem 3rem',
        marginBottom: '2rem',
        border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
        boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ animation: 'slideInUp 0.8s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                animation: 'pulse 2s infinite'
              }}>👋</div>
              <div>
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  background: darkMode ? 'linear-gradient(135deg, #f8fafc, #e2e8f0)' : 'linear-gradient(135deg, #1e293b, #475569)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}>
                  Welcome back, {user?.name || 'User'}!
                </h1>
                <p style={{
                  color: darkMode ? '#94a3b8' : '#64748b',
                  fontSize: '1.125rem',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  🚀 Here's your sales empire today
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', animation: 'slideInUp 0.8s ease-out 0.2s both' }}>
            <button
              onClick={() => setActiveView('add-enquiry')}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #22c55e, #16a34a, #15803d)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '700',
                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                e.target.style.boxShadow = '0 12px 35px rgba(34, 197, 94, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.4)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s'
              }} />
              <Plus size={24} />
              🎆 Add New Lead
            </button>
            
            <button
              onClick={() => setActiveView('analytics')}
              style={{
                padding: '1rem 1.5rem',
                background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📈 Analytics
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 3rem' }}>
      {/* Enhanced Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
        position: 'relative',
        zIndex: 5
      }}>
        {[
          {
            title: 'Total Leads',
            value: quickStats.totalLeads,
            change: `+${quickStats.newLeadsThisWeek} this week`,
            icon: Users,
            color: '#3b82f6', // blue
            bgGradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            view: 'leads'
          },
          {
            title: 'Pipeline Value',
            value: `₹${((quickStats.pipelineValue || 0) / 100000).toFixed(1)}L`,
            change: '+12% from last month',
            icon: DollarSign,
            color: '#22c55e', // green
            bgGradient: 'linear-gradient(135deg, #22c55e, #4ade80)',
            view: 'leads'
          },
          {
            title: 'Conversion Rate',
            value: `${quickStats.conversionRate}%`,
            change: '+5% improvement',
            icon: TrendingUp,
            color: '#8b5cf6', // purple
            bgGradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
            view: 'customers'
          },
          {
            title: 'Hot Leads',
            value: quickStats.hotLeads,
            change: 'Require attention',
            icon: Target,
            color: '#ef4444', // red
            bgGradient: 'linear-gradient(135deg, #ef4444, #f87171)',
            view: 'my-leads'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={() => {
                console.log('Card clicked for:', stat.title);
                handleStatCardClick(stat);
              }}
              style={{
                padding: '2.5rem',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                background: darkMode 
                  ? 'rgba(30, 41, 59, 0.8)' 
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
                color: darkMode ? '#f8fafc' : '#1f2937',
                animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)';
                e.currentTarget.style.boxShadow = `0 25px 50px ${stat.color}40`;
                e.currentTarget.style.background = darkMode 
                  ? `rgba(30, 41, 59, 0.95)` 
                  : `rgba(255, 255, 255, 0.95)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = darkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.background = darkMode 
                  ? 'rgba(30, 41, 59, 0.8)' 
                  : 'rgba(255, 255, 255, 0.9)';
              }}
            >
              {/* Animated Background Orbs */}
              <div style={{
                position: 'absolute',
                top: '-40%',
                right: '-20%',
                width: '120px',
                height: '120px',
                background: stat.bgGradient,
                borderRadius: '50%',
                opacity: 0.2,
                animation: 'float 4s ease-in-out infinite'
              }} />
              <div style={{
                position: 'absolute',
                top: '60%',
                left: '-10%',
                width: '80px',
                height: '80px',
                background: `radial-gradient(circle, ${stat.color}30, transparent)`,
                borderRadius: '50%',
                opacity: 0.4,
                animation: 'float 6s ease-in-out infinite reverse'
              }} />
              <div style={{
                position: 'absolute',
                top: '15%',
                right: '15%',
                width: '60px',
                height: '60px',
                background: `${stat.color}15`,
                borderRadius: '50%',
                opacity: 0.8,
                animation: 'pulse 3s infinite'
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{
                    padding: '1.25rem',
                    background: stat.bgGradient,
                    borderRadius: '20px',
                    boxShadow: `0 12px 30px ${stat.color}50`,
                    transform: 'rotate(-8deg)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'rotate(0deg) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'rotate(-8deg) scale(1)';
                  }}>
                    <Icon size={32} color="white" />
                  </div>
                  
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: stat.change.startsWith('+') 
                      ? 'rgba(34, 197, 94, 0.15)' 
                      : 'rgba(239, 68, 68, 0.15)',
                    borderRadius: '25px',
                    fontSize: '0.875rem',
                    color: stat.change.startsWith('+') ? '#16a34a' : '#dc2626',
                    fontWeight: '700',
                    border: `2px solid ${stat.change.startsWith('+') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>{stat.change.startsWith('+') ? '📈' : '📉'}</span>
                    {stat.change}
                  </div>
                </div>
                
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    <h3 style={{
                      fontSize: '3rem',
                      fontWeight: '900',
                      margin: 0,
                      background: darkMode 
                        ? 'linear-gradient(135deg, #f8fafc, #e2e8f0)' 
                        : 'linear-gradient(135deg, #1e293b, #475569)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.02em',
                      lineHeight: '1'
                    }}>
                      {stat.value}
                    </h3>
                    <div style={{
                      padding: '0.25rem 0.5rem',
                      background: `${stat.color}20`,
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: stat.color
                    }}>
                      LIVE
                    </div>
                  </div>
                  <p style={{
                    color: darkMode ? '#94a3b8' : '#64748b',
                    fontSize: '1.125rem',
                    margin: 0,
                    fontWeight: '600',
                    letterSpacing: '0.025em'
                  }}>
                    {stat.title}
                  </p>
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 0',
                    borderTop: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                    fontSize: '0.875rem',
                    color: darkMode ? '#64748b' : '#94a3b8',
                    fontWeight: '500'
                  }}>
                    🔥 Updated just now
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Recent Activities */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Activity style={{ color: '#3b82f6' }} size={20} />
              Recent Activities
            </h3>
            
            <button
              onClick={() => setActiveView('lead-history')}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: '#3b82f6',
                border: `1px solid #3b82f6`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentActivities.map(activity => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: darkMode ? '#334155' : '#f9fafb',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = darkMode ? '#475569' : '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.background = darkMode ? '#334155' : '#f9fafb'}
                >
                  <div style={{
                    padding: '0.75rem',
                    background: activity.color,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={16} color="white" />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: darkMode ? 'white' : '#1f2937',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {activity.message}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      margin: 0
                    }}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock style={{ color: '#f59e0b' }} size={20} />
              Upcoming Tasks
            </h3>
            
            <button
              onClick={() => setActiveView('tasks')}
              style={{
                padding: '0.5rem',
                background: 'transparent',
                color: '#f59e0b',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingTasks.map(task => (
              <div key={task.id} style={{
                padding: '1rem',
                background: darkMode ? '#334155' : '#f9fafb',
                borderRadius: '8px',
                borderLeft: `4px solid ${getPriorityColor(task.priority)}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: 0
                  }}>
                    {task.title}
                  </h4>
                  
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: getPriorityColor(task.priority),
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {task.priority}
                  </span>
                </div>
                
                <p style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Calendar size={12} />
                  {task.dueDate}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Demo Requests for Super Admin */}
      {user?.role === 'super-admin' && demoRequests.length > 0 && (
        <div style={{ ...cardStyle, padding: '1.5rem', marginTop: '2rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <UserCheck style={{ color: '#8b5cf6' }} size={20} />
            Demo Requests Pending Approval
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {demoRequests.map(req => (
              <div key={req.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: darkMode ? '#334155' : '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <p style={{ fontWeight: '600', margin: 0, color: darkMode ? 'white' : '#1f2937' }}>
                    {req.companyName}
                  </p>
                  <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0 0', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    Requested by: {req.requestedBy}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleRequestAction(req.id, 'approve')}
                    style={{ background: '#22c55e20', color: '#22c55e', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Approve"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleRequestAction(req.id, 'reject')}
                    style={{ background: '#ef444420', color: '#ef4444', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Reject"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {isModalOpen && (
        <div style={modalOverlayStyle} onClick={() => setIsModalOpen(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{modalTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} style={closeButtonStyle}>&times;</button>
            </div>
            <div style={modalBodyStyle}>
              {modalItems.length > 0 ? (
                <ul style={{ padding: 0, margin: 0 }}>
                  {modalItems.map(item => (
                    <li key={item.id} style={listItemStyle}>
                      <strong style={{ color: darkMode ? 'white' : '#1f2937' }}>{item.name}</strong>
                      <span style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}> from {item.company}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No items to display for this category.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalDashboard;