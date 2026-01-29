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
  X,
  UserPlus,
  Trophy,
  Star,
  Send,
  BarChart2,
  PieChart,
  Mail
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
  const [performanceScore, setPerformanceScore] = useState(0);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [managerEmail, setManagerEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({});
  
  // Check if user is sales/support (not admin)
  const isSalesUser = user?.role && !['super-admin', 'admin', 'manager', 'senior-manager'].includes(user.role);

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
    // Use leads from crmData (parent) instead of fetching separately
    if (crmData.leads && Array.isArray(crmData.leads)) {
      setLeads(crmData.leads);
      console.log('📋 Dashboard using leads from crmData:', crmData.leads.length);
      console.log('📊 Assigned leads:', crmData.leads.filter(l => l.assignedTo).length);
    }
  }, [crmData.leads]);
  
  useEffect(() => {
    // Calculate quick stats
    const customers = crmData.customers || [];
    
    const wonCount = Array.isArray(leads) ? leads.filter(l => l.status === 'closed-won' || l.status === 'converted').length : 0;
    const totalCount = leads.length;
    const score = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;
    
    // Calculate monthly stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthLeads = Array.isArray(leads) ? leads.filter(l => {
      const createdDate = new Date(l.createdDate || l.createdAt || Date.now());
      return createdDate >= monthStart;
    }) : [];
    
    console.log('📅 Monthly leads calculation:', {
      totalLeads: leads.length,
      monthLeads: monthLeads.length,
      monthStart: monthStart.toISOString(),
      assignedCount: monthLeads.filter(l => l.assignedTo).length
    });
    
    const monthlyData = {
      totalLeads: monthLeads.length,
      assignedLeads: monthLeads.filter(l => l.assignedTo).length,
      wonLeads: monthLeads.filter(l => l.status === 'closed-won' || l.status === 'converted').length,
      activeLeads: monthLeads.filter(l => ['qualified', 'proposal', 'negotiation', 'contacted'].includes(l.status)).length,
      activities: monthLeads.length * 3
    };
    setMonthlyStats(monthlyData);
    
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
      hotLeads: Array.isArray(leads) ? leads.filter(l => l.priority === 'high' && l.status !== 'converted').length : 0,
      activeLeads: Array.isArray(leads) ? leads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length : 0,
      pendingLeads: Array.isArray(leads) ? leads.filter(l => ['new', 'contacted'].includes(l.status)).length : 0
    };
    
    setQuickStats(stats);
    setPerformanceScore(score);

    // Generate activities from today's assigned leads only
    const activities = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const leadsArray = Array.isArray(leads) ? leads : [];
    const todaysAssignedLeads = leadsArray.filter(lead => {
      if (!lead.assignedTo) return false;
      const assignDate = new Date(lead.assignedDate || lead.updatedAt || lead.createdDate);
      assignDate.setHours(0, 0, 0, 0);
      return assignDate.getTime() === today.getTime();
    });
    
    todaysAssignedLeads.slice(0, 5).forEach((lead, index) => {
      const assignedUser = lead.assignedTo?.name || lead.assignedTo || 'Team member';
      activities.push({
        id: index + 1,
        type: 'lead_assigned',
        message: `${lead.companyName} assigned to ${assignedUser}`,
        time: new Date(lead.assignedDate || lead.updatedAt || lead.createdDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        icon: UserPlus,
        color: '#3b82f6',
        leadId: lead.id
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

  const handleSendPerformance = async () => {
    if (!managerEmail || !managerEmail.includes('@')) {
      alert('Please enter a valid manager email');
      return;
    }
    
    setSendingEmail(true);
    try {
      // Prepare performance data
      const performanceData = {
        userName: user?.name,
        userEmail: user?.email,
        managerEmail: managerEmail,
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        stats: {
          totalLeads: quickStats.totalLeads,
          assignedLeads: monthlyStats.assignedLeads,
          wonLeads: monthlyStats.wonLeads,
          activeLeads: monthlyStats.activeLeads,
          conversionRate: quickStats.conversionRate,
          performanceScore: performanceScore,
          activities: monthlyStats.activities
        }
      };
      
      // Send email via API
      await apiService.sendPerformanceReport(performanceData);
      alert('✅ Performance report sent successfully to ' + managerEmail);
      setShowEmailModal(false);
      setManagerEmail('');
    } catch (error) {
      console.error('Failed to send performance report:', error);
      alert('❌ Failed to send report. Please try again.');
    } finally {
      setSendingEmail(false);
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
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes wave {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(5px) translateY(-5px); }
          50% { transform: translateX(0) translateY(-10px); }
          75% { transform: translateX(-5px) translateY(-5px); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
      
      {/* Simple Clean Header */}
      <div style={{
        background: darkMode 
          ? 'rgba(30, 41, 59, 0.5)'
          : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(20px)',
        borderRadius: '0 0 24px 24px',
        padding: '1.5rem 3rem',
        marginBottom: '2rem',
        border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
        borderTop: 'none',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ animation: 'slideInUp 0.8s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={24} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: darkMode ? '#f8fafc' : '#1e293b',
                  margin: 0
                }}>
                  Welcome back, {user?.name || 'User'}!
                </h1>
                <p style={{
                  color: darkMode ? '#94a3b8' : '#64748b',
                  fontSize: '0.95rem',
                  margin: 0
                }}>
                  Here's your sales overview
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
               Add New Lead
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
               Analytics
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 3rem' }}>
      {/* Enhanced Quick Stats - Compact & Glassmorphic */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
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
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: darkMode 
                  ? 'rgba(30, 41, 59, 0.6)' 
                  : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                borderRadius: '20px',
                border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(255, 255, 255, 0.3)'}`,
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                color: darkMode ? '#f8fafc' : '#1f2937',
                animation: `slideInUp 0.5s ease-out ${index * 0.08}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 20px 40px ${stat.color}35, inset 0 1px 0 rgba(255, 255, 255, 0.1)`;
                e.currentTarget.style.background = darkMode 
                  ? `rgba(30, 41, 59, 0.85)` 
                  : `rgba(255, 255, 255, 0.9)`;
                e.currentTarget.style.borderColor = `${stat.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = darkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.background = darkMode 
                  ? 'rgba(30, 41, 59, 0.6)' 
                  : 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.borderColor = darkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(255, 255, 255, 0.3)';
              }}
            >
              {/* Glassmorphic Background Orbs */}
              <div style={{
                position: 'absolute',
                top: '-30%',
                right: '-15%',
                width: '100px',
                height: '100px',
                background: `radial-gradient(circle, ${stat.color}25, transparent 70%)`,
                borderRadius: '50%',
                filter: 'blur(20px)',
                opacity: 0.6,
                animation: 'float 5s ease-in-out infinite'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-20%',
                left: '-10%',
                width: '80px',
                height: '80px',
                background: `radial-gradient(circle, ${stat.color}20, transparent 70%)`,
                borderRadius: '50%',
                filter: 'blur(15px)',
                opacity: 0.5,
                animation: 'float 7s ease-in-out infinite reverse'
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    padding: '0.875rem',
                    background: stat.bgGradient,
                    borderRadius: '16px',
                    boxShadow: `0 8px 20px ${stat.color}40`,
                    transform: 'rotate(-5deg)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'rotate(0deg) scale(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'rotate(-5deg) scale(1)';
                  }}>
                    <Icon size={24} color="white" />
                  </div>
                  
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: stat.change.startsWith('+') 
                      ? 'rgba(34, 197, 94, 0.12)' 
                      : 'rgba(239, 68, 68, 0.12)',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    color: stat.change.startsWith('+') ? '#16a34a' : '#dc2626',
                    fontWeight: '600',
                    border: `1px solid ${stat.change.startsWith('+') ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <TrendingUp size={12} />
                    {stat.change}
                  </div>
                </div>
                
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <h3 style={{
                      fontSize: '2.25rem',
                      fontWeight: '800',
                      margin: 0,
                      color: darkMode ? '#f8fafc' : '#1e293b',
                      letterSpacing: '-0.03em',
                      lineHeight: '1'
                    }}>
                      {stat.value}
                    </h3>
                    <div style={{
                      padding: '0.2rem 0.4rem',
                      background: `${stat.color}18`,
                      borderRadius: '6px',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      color: stat.color,
                      letterSpacing: '0.05em'
                    }}>
                      LIVE
                    </div>
                  </div>
                  <p style={{
                    color: darkMode ? '#94a3b8' : '#64748b',
                    fontSize: '0.95rem',
                    margin: 0,
                    fontWeight: '600',
                    letterSpacing: '0.01em'
                  }}>
                    {stat.title}
                  </p>
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    background: darkMode ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.6)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    color: darkMode ? '#64748b' : '#94a3b8',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#22c55e',
                      animation: 'pulse 2s infinite'
                    }} />
                    Updated just now
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Performance Charts for Sales Users - Enhanced with Graphs */}
      {isSalesUser && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
          padding: '0 3rem'
        }}>
          {/* Monthly Performance Chart - Bar Graph */}
          <div style={{
            ...cardStyle,
            padding: '1.5rem',
            background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(255, 255, 255, 0.3)'}`,
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)' 
              : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: darkMode ? '#f8fafc' : '#1f2937',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <BarChart2 size={18} color="#3b82f6" />
                Monthly Performance
              </h3>
              <div style={{
                fontSize: '0.75rem',
                color: darkMode ? '#cbd5e1' : '#64748b',
                background: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontWeight: '600'
              }}>
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            {/* Bar Chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '180px', marginBottom: '1rem' }}>
              {[
                { label: 'Total', value: monthlyStats.totalLeads || 0, color: '#3b82f6', max: 50 },
                { label: 'Assigned', value: monthlyStats.assignedLeads || 0, color: '#8b5cf6', max: 50 },
                { label: 'Won', value: monthlyStats.wonLeads || 0, color: '#22c55e', max: 50 },
                { label: 'Active', value: monthlyStats.activeLeads || 0, color: '#f59e0b', max: 50 }
              ].map((item, idx) => {
                const heightPercent = Math.min((item.value / item.max) * 100, 100);
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'flex-end',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '100%',
                        height: `${heightPercent}%`,
                        background: `linear-gradient(180deg, ${item.color}, ${item.color}dd)`,
                        borderRadius: '8px 8px 4px 4px',
                        position: 'relative',
                        boxShadow: `0 4px 12px ${item.color}40`,
                        transition: 'all 0.5s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scaleY(1.05)';
                        e.target.style.boxShadow = `0 8px 20px ${item.color}60`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scaleY(1)';
                        e.target.style.boxShadow = `0 4px 12px ${item.color}40`;
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-24px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: item.color,
                          background: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                          backdropFilter: 'blur(8px)'
                        }}>
                          {item.value}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600' }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
            {/* Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Total Leads', value: monthlyStats.totalLeads || 0, color: '#3b82f6', max: 50 },
                { label: 'Won', value: monthlyStats.wonLeads || 0, color: '#22c55e', max: 50 }
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', color: darkMode ? '#cbd5e1' : '#64748b', fontWeight: '600' }}>{item.label}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: item.color }}>{item.value}</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: darkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <div style={{
                      width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)`,
                      borderRadius: '3px',
                      transition: 'width 0.8s ease',
                      boxShadow: `0 0 8px ${item.color}60`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Summary - Circular Progress */}
          <div style={{
            ...cardStyle,
            padding: '1.5rem',
            background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(255, 255, 255, 0.3)'}`,
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)' 
              : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: darkMode ? '#f8fafc' : '#1f2937',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <PieChart size={18} color="#22c55e" />
                Activity Summary
              </h3>
            </div>
            {/* Circular Progress Chart */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: '140px' }}>
              <div style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: `conic-gradient(
                  #3b82f6 0deg ${(monthlyStats.activities || 0) * 3.6}deg,
                  #22c55e ${(monthlyStats.activities || 0) * 3.6}deg ${(monthlyStats.activities || 0) * 3.6 + (monthlyStats.wonLeads || 0) * 7.2}deg,
                  #f59e0b ${(monthlyStats.activities || 0) * 3.6 + (monthlyStats.wonLeads || 0) * 7.2}deg ${(monthlyStats.activities || 0) * 3.6 + (monthlyStats.wonLeads || 0) * 7.2 + (monthlyStats.activeLeads || 0) * 7.2}deg,
                  ${darkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.5)'} ${(monthlyStats.activities || 0) * 3.6 + (monthlyStats.wonLeads || 0) * 7.2 + (monthlyStats.activeLeads || 0) * 7.2}deg
                )`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                position: 'relative'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#22c55e' }}>{performanceScore}%</div>
                  <div style={{ fontSize: '0.65rem', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600' }}>Performance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Send to Manager Button - Enhanced */}
          <div style={{
            ...cardStyle,
            padding: '1.5rem',
            background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(255, 255, 255, 0.3)'}`,
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)' 
              : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated Background */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite'
            }} />
            <Mail size={40} color="#3b82f6" style={{ marginBottom: '1rem', position: 'relative', zIndex: 1 }} />
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: darkMode ? '#f8fafc' : '#1f2937',
              marginBottom: '0.5rem',
              position: 'relative',
              zIndex: 1
            }}>Share Performance</h3>
            <p style={{
              fontSize: '0.8rem',
              color: darkMode ? '#cbd5e1' : '#64748b',
              marginBottom: '1.25rem',
              position: 'relative',
              zIndex: 1
            }}>Send monthly report to manager</p>
            <button
              onClick={() => setShowEmailModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                position: 'relative',
                zIndex: 1
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }}
            >
              <Send size={16} />
              Send to Manager
            </button>
          </div>
        </div>
      )}

      {/* Today's Goals for Sales Users */}
      {isSalesUser && (
        <div style={{
          backgroundColor: darkMode ? '#1e293b' : 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
          border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Star size={24} color="#f59e0b" />
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: darkMode ? 'white' : '#111827',
              margin: 0
            }}>Today's Goals</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{
              padding: '16px',
              background: darkMode ? '#0f172a' : '#f9fafb',
              borderRadius: '12px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <div style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '4px' }}>Follow-ups</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: darkMode ? 'white' : '#111827' }}>
                {quickStats.pendingLeads || 0} pending
              </div>
            </div>
            <div style={{
              padding: '16px',
              background: darkMode ? '#0f172a' : '#f9fafb',
              borderRadius: '12px',
              borderLeft: '4px solid #22c55e'
            }}>
              <div style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '4px' }}>Close Deals</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: darkMode ? 'white' : '#111827' }}>
                {quickStats.activeLeads || 0} active
              </div>
            </div>
            <div style={{
              padding: '16px',
              background: darkMode ? '#0f172a' : '#f9fafb',
              borderRadius: '12px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <div style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '4px' }}>Target Progress</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: darkMode ? 'white' : '#111827' }}>
                {quickStats.conversionRate || 0}%
              </div>
            </div>
          </div>
        </div>
      )}

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
              color: darkMode ? '#f8fafc' : '#1f2937',
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
                      color: darkMode ? '#f8fafc' : '#1f2937',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {activity.message}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#cbd5e1' : '#6b7280',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Clock size={10} />
                      Today at {activity.time}
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
              color: darkMode ? '#f8fafc' : '#1f2937',
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
                    color: darkMode ? '#f8fafc' : '#1f2937',
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
                  color: darkMode ? '#cbd5e1' : '#6b7280',
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



      {/* Email Modal */}
      {showEmailModal && (
        <div style={modalOverlayStyle} onClick={() => setShowEmailModal(false)}>
          <div style={{
            ...modalContentStyle,
            maxWidth: '400px'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Send Performance Report</h3>
              <button onClick={() => setShowEmailModal(false)} style={closeButtonStyle}>&times;</button>
            </div>
            <div style={{ padding: '1rem 0' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: darkMode ? '#d1d5db' : '#374151',
                marginBottom: '0.5rem'
              }}>Manager's Email</label>
              <input
                type="email"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                placeholder="manager@company.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937',
                  outline: 'none'
                }}
              />
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: darkMode ? '#374151' : '#f9fafb',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                <strong>Report includes:</strong>
                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
                  <li>Total leads worked: {quickStats.totalLeads}</li>
                  <li>Leads assigned: {monthlyStats.assignedLeads}</li>
                  <li>Conversion rate: {quickStats.conversionRate}%</li>
                  <li>Performance score: {performanceScore}%</li>
                  <li>Monthly activities: {monthlyStats.activities}</li>
                </ul>
              </div>
              <button
                onClick={handleSendPerformance}
                disabled={sendingEmail}
                style={{
                  width: '100%',
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: sendingEmail ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: sendingEmail ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {sendingEmail ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Report
                  </>
                )}
              </button>
            </div>
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