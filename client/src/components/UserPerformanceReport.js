import React, { useState, useEffect } from 'react';
import { Download, Users, Activity, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { showToast } from './ToastNotification';
import apiService from '../services/apiService';

const UserPerformanceReport = ({ darkMode, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('7days');
  const [expandedRoles, setExpandedRoles] = useState({});
  const [expandedUsers, setExpandedUsers] = useState({});
  const [leadStatusChanges, setLeadStatusChanges] = useState({});
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
      
      // Fetch analytics and leads data
      const analyticsPromise = fetch(`${apiUrl}/analytics/crm-usage?range=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      const leadsPromise = (async () => {
        const allLeads = [];
        await apiService.fetchPagedLeads({
          path: '/leads',
          pageSize: 200,
          onPage: (pageLeads) => {
            allLeads.push(...pageLeads);
          }
        });
        return allLeads;
      })();

      const [analyticsResponse, allLeads] = await Promise.all([analyticsPromise, leadsPromise]);

      if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      if (!analyticsData || !analyticsData.userActivity) {
        setAnalytics(null);
        setLeadStatusChanges({});
        return;
      }
        const allLeadsList = Array.isArray(allLeads) ? allLeads : [];

        // Fast lookup for leads by assigned email/id
        const leadIndex = {};
        allLeadsList.forEach(lead => {
          const at = lead.assignedTo || null;
          const email = at && typeof at === 'object' && at.email ? at.email.toLowerCase() : '';
          const username = at && typeof at === 'object' && at.username ? at.username.toLowerCase() : '';
          const id = at && typeof at === 'object' ? (at._id || at.id) : at;
          const keys = [];
          if (email) keys.push(`email:${email}`);
          if (username) keys.push(`email:${username}`);
          if (id) keys.push(`id:${id}`);
          keys.forEach(k => {
            if (!leadIndex[k]) leadIndex[k] = [];
            leadIndex[k].push(lead);
          });
        });

        // Build status change history per user
        const statusChangesByUser = {};
        
        // Enhance user activity with lead details
        const enhancedUserActivity = (analyticsData.userActivity || []).map(user => {
          const emailKey = user.userEmail ? `email:${user.userEmail.toLowerCase()}` : null;
          const idKey = user.userId || user._id || user.id ? `id:${user.userId || user._id || user.id}` : null;

          const userLeads = [
            ...(emailKey && leadIndex[emailKey] ? leadIndex[emailKey] : []),
            ...(idKey && leadIndex[idKey] ? leadIndex[idKey] : [])
          ];

          // de-duplicate
          const seen = new Set();
          const uniqueLeads = userLeads.filter(l => {
            const key = l._id || l.id;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          
          // Calculate this month's assignments
          const thisMonth = new Date();
          const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
          
          const leadsAssignedThisMonth = uniqueLeads.filter(lead => 
            lead.assignedAt && new Date(lead.assignedAt) >= monthStart
          ).length;
          
          // Count leads worked on (with notes or activities)
          const leadsWorkedOn = uniqueLeads.filter(lead => 
            (lead.notes && lead.notes.length > 0) || 
            (lead.activities && lead.activities.length > 0)
          ).length;
          
          // Extract status changes with details
          const statusChangeDetails = [];
          uniqueLeads.forEach(lead => {
            // Check activities array for status changes
            if (lead.activities && lead.activities.length > 0) {
              lead.activities.forEach(activity => {
                if (activity.type === 'status_change') {
                  statusChangeDetails.push({
                    leadName: lead.contactPerson || lead.companyName,
                    leadId: lead._id,
                    description: activity.description || `Status changed to ${lead.status}`,
                    date: activity.createdAt || activity.timestamp,
                    currentStatus: lead.status,
                    fromStatus: activity.metadata?.fromStatus || 'unknown',
                    toStatus: activity.metadata?.toStatus || lead.status
                  });
                }
              });
            }
            
            // Also check notes for status change mentions
            if (lead.notes && lead.notes.length > 0) {
              lead.notes.forEach(note => {
                if (note.content && (note.content.toLowerCase().includes('status') || note.content.toLowerCase().includes('changed'))) {
                  const match = note.content.match(/status.*?(new|contacted|qualified|proposal|negotiation|closed-won|closed-lost)/i);
                  if (match) {
                    statusChangeDetails.push({
                      leadName: lead.contactPerson || lead.companyName,
                      leadId: lead._id,
                      description: note.content.substring(0, 100),
                      date: note.createdAt,
                      currentStatus: lead.status
                    });
                  }
                }
              });
            }
          });
          
          statusChangesByUser[user.userEmail] = statusChangeDetails;
          
          return {
            ...user,
            leadsAssignedThisMonth,
            leadsWorkedOn,
            statusChanges: statusChangeDetails.length,
            totalAssignedLeads: userLeads.length
          };
        });
        
        setLeadStatusChanges(statusChangesByUser);
        setAnalytics({
          ...analyticsData,
          userActivity: enhancedUserActivity
        });
      } else {
        showToast('error', 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast('error', 'Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (filterRole = roleFilter) => {
    if (!analytics || !analytics.userActivity) {
      showToast('error', 'No data to download');
      return;
    }

    const filteredUsers = filterRole === 'all' 
      ? analytics.userActivity 
      : analytics.userActivity.filter(u => u.userRole === filterRole);

    if (filteredUsers.length === 0) {
      showToast('error', 'No users found for selected role');
      return;
    }

    const isSalesRole = ['sales', 'sales-rep', 'sales-manager'].includes(filterRole);
    const headers = isSalesRole
      ? ['User Name', 'Email', 'Role', 'Status', 'Sessions', 'Time (mins)', 'Leads Added', 'Customers Added', 'Assigned (Month)', 'Worked On', 'Status Changes', 'Last Active']
      : ['User Name', 'Email', 'Role', 'Status', 'Sessions', 'Time (mins)', 'Leads Added', 'Customers Added', 'Last Active'];

    const rows = filteredUsers.map(user => {
      const baseData = [
        user.userName,
        user.userEmail,
        user.userRole || 'N/A',
        user.isActive ? 'Active' : 'Inactive',
        user.sessions,
        user.totalTime,
        user.leadsAdded,
        user.customersAdded
      ];

      if (isSalesRole) {
        return [
          ...baseData,
          user.leadsAssignedThisMonth || 0,
          user.leadsWorkedOn || 0,
          user.statusChanges || 0,
          new Date(user.lastActive).toLocaleString('en-IN')
        ];
      }

      return [...baseData, new Date(user.lastActive).toLocaleString('en-IN')];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const roleName = filterRole === 'all' ? 'all_users' : filterRole;
    link.download = `user_performance_${roleName}_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showToast('success', `✅ ${filteredUsers.length} users downloaded!`);
  };

  const downloadExcel = (filterRole = roleFilter) => {
    if (!analytics || !analytics.userActivity) {
      showToast('error', 'No data to download');
      return;
    }

    const filteredUsers = filterRole === 'all' 
      ? analytics.userActivity 
      : analytics.userActivity.filter(u => u.userRole === filterRole);

    if (filteredUsers.length === 0) {
      showToast('error', 'No users found for selected role');
      return;
    }

    const isSalesRole = ['sales', 'sales-rep', 'sales-manager'].includes(filterRole);

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>
      <table border="1">
        <tr style="background-color: #22c55e; color: white; font-weight: bold;">
          <th>User Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Sessions</th>
          <th>Time (mins)</th>
          <th>Leads Added</th>
          <th>Customers Added</th>
          ${isSalesRole ? '<th>Assigned (Month)</th><th>Worked On</th><th>Status Changes</th>' : ''}
          <th>Last Active</th>
        </tr>
    `;

    filteredUsers.forEach(user => {
      html += `
        <tr>
          <td>${user.userName}</td>
          <td>${user.userEmail}</td>
          <td>${user.userRole || 'N/A'}</td>
          <td>${user.isActive ? 'Active' : 'Inactive'}</td>
          <td>${user.sessions}</td>
          <td>${user.totalTime}</td>
          <td>${user.leadsAdded}</td>
          <td>${user.customersAdded}</td>
          ${isSalesRole ? `<td>${user.leadsAssignedThisMonth || 0}</td><td>${user.leadsWorkedOn || 0}</td><td>${user.statusChanges || 0}</td>` : ''}
          <td>${new Date(user.lastActive).toLocaleString('en-IN')}</td>
        </tr>
      `;
    });

    html += '</table></body></html>';

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const roleName = filterRole === 'all' ? 'all_users' : filterRole;
    link.download = `user_performance_${roleName}_${dateRange}_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    
    showToast('success', `✅ ${filteredUsers.length} users downloaded!`);
  };

  const cardStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
  };

  return (
    <div style={{
      padding: '2rem',
      background: darkMode ? '#111827' : '#f9fafb',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BarChart3 style={{ color: '#3b82f6' }} size={32} />
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                User Performance Report
              </h1>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1rem', margin: 0 }}>
                Track team activity and productivity
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#1f2937',
                fontSize: '1rem'
              }}
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#1f2937',
                fontSize: '1rem'
              }}
            >
              <option value="all">All Roles</option>
              <option value="super-admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="senior-manager">Senior Manager</option>
              <option value="sales-manager">Sales Manager</option>
              <option value="sales">Sales</option>
              <option value="sales-rep">Sales Rep</option>
              <option value="marketing">Marketing</option>
              <option value="support">Support</option>
              <option value="legal-team">Legal Team</option>
              <option value="finance-team">Finance Team</option>
            </select>

            <button
              onClick={() => downloadCSV()}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              <Download size={20} />
              CSV
            </button>

            <button
              onClick={() => downloadExcel()}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              <Download size={20} />
              Excel
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
          Loading analytics...
        </div>
      ) : analytics ? (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={24} color="white" />
                </div>
                <div>
                  <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                    Active Users
                  </p>
                  <h3 style={{ color: darkMode ? 'white' : '#1f2937', fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
                    {analytics.totalActiveUsers}
                  </h3>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Activity size={24} color="white" />
                </div>
                <div>
                  <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                    Total Sessions
                  </p>
                  <h3 style={{ color: darkMode ? 'white' : '#1f2937', fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
                    {analytics.totalSessions}
                  </h3>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={24} color="white" />
                </div>
                <div>
                  <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                    Avg Session Time
                  </p>
                  <h3 style={{ color: darkMode ? 'white' : '#1f2937', fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
                    {analytics.avgSessionTime} min
                  </h3>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUp size={24} color="white" />
                </div>
                <div>
                  <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                    Adoption Rate
                  </p>
                  <h3 style={{ color: darkMode ? 'white' : '#1f2937', fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
                    {analytics.adoptionRate}%
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* User Activity Table - Role-wise Grouped */}
          <div style={cardStyle}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1.5rem'
            }}>
              User Activity Details (Role-wise)
            </h2>

            {/* Group users by role */}
            {(() => {
              const roleGroups = {
                'super-admin': [],
                'admin': [],
                'manager': [],
                'senior-manager': [],
                'sales-manager': [],
                'sales': [],
                'sales-rep': [],
                'marketing': [],
                'support': [],
                'legal-team': [],
                'finance-team': [],
                'other': []
              };

              analytics.userActivity.forEach(user => {
                const role = user.userRole || 'other';
                if (roleGroups[role]) {
                  roleGroups[role].push(user);
                } else {
                  roleGroups.other.push(user);
                }
              });

              const roleLabels = {
                'super-admin': '🔴 Super Admin',
                'admin': '🟠 Admin',
                'manager': '🔵 Manager',
                'senior-manager': '🟣 Senior Manager',
                'sales-manager': '🔵 Sales Manager',
                'sales': '🟢 Sales',
                'sales-rep': '🟢 Sales Rep',
                'marketing': '🟡 Marketing',
                'support': '🔵 Support',
                'legal-team': '⚖️ Legal Team',
                'finance-team': '💰 Finance Team',
                'other': '⚪ Other'
              };

              return Object.entries(roleGroups).map(([role, users]) => {
                if (users.length === 0) return null;

                const isSalesRole = ['sales', 'sales-rep', 'sales-manager'].includes(role);
                const isExpanded = expandedRoles[role];

                return (
                  <div key={role} style={{ marginBottom: '2rem' }}>
                    <div
                      onClick={() => setExpandedRoles(prev => ({ ...prev, [role]: !prev[role] }))}
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: darkMode ? '#60a5fa' : '#3b82f6',
                        marginBottom: '1rem',
                        padding: '0.75rem',
                        background: darkMode ? '#1e3a8a20' : '#eff6ff',
                        borderRadius: '8px',
                        borderLeft: '4px solid #3b82f6',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = darkMode ? '#1e3a8a40' : '#dbeafe';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = darkMode ? '#1e3a8a20' : '#eff6ff';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <span>{roleLabels[role]} ({users.length})</span>
                      <span style={{ fontSize: '1.5rem' }}>{isExpanded ? '▼' : '▶'}</span>
                    </div>

                    {isExpanded && (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`, background: darkMode ? '#0f172a' : '#f8fafc' }}>
                            <th style={{ padding: '0.9rem', textAlign: 'left', color: darkMode ? '#cbd5e1' : '#4b5563', fontWeight: '700', letterSpacing: '0.01em' }}>User</th>
                            <th style={{ padding: '0.9rem', textAlign: 'left', color: darkMode ? '#cbd5e1' : '#4b5563', fontWeight: '700', letterSpacing: '0.01em' }}>Status</th>
                            <th style={{ padding: '0.9rem', textAlign: 'center', color: darkMode ? '#cbd5e1' : '#4b5563', fontWeight: '700', letterSpacing: '0.01em' }}>Sessions</th>
                            <th style={{ padding: '0.9rem', textAlign: 'center', color: darkMode ? '#cbd5e1' : '#4b5563', fontWeight: '700', letterSpacing: '0.01em' }}>Time (mins)</th>
                            <th style={{ padding: '0.9rem', textAlign: 'center', color: darkMode ? '#cbd5e1' : '#4b5563', fontWeight: '700', letterSpacing: '0.01em' }}>Leads Added</th>
                            <th style={{ padding: '0.9rem', textAlign: 'center', color: darkMode ? '#cbd5e1' : '#4b5563', fontWeight: '700', letterSpacing: '0.01em' }}>Customers</th>
                            {isSalesRole && (
                              <>
                                <th style={{ padding: '0.9rem', textAlign: 'center', color: darkMode ? '#cbd5e1' : '#4b5563', fontWeight: '700', letterSpacing: '0.01em' }}>Assigned (Month)</th>
                                <th style={{ padding: '0.9rem', textAlign: 'center', color: darkMode ? '#cbd5e1' : '#4b5563', fontWeight: '700', letterSpacing: '0.01em' }}>Worked On</th>
                                <th style={{ padding: '0.9rem', textAlign: 'center', color: darkMode ? '#cbd5e1' : '#4b5563', fontWeight: '700', letterSpacing: '0.01em' }}>Status Changed</th>
                              </>
                            )}
                            <th style={{ padding: '0.9rem', textAlign: 'left', color: darkMode ? '#cbd5e1' : '#4b5563', fontWeight: '700', letterSpacing: '0.01em' }}>Last Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user, index) => (
                            <React.Fragment key={index}>
                              <tr style={{ borderBottom: `1px solid ${darkMode ? '#1f2937' : '#e5e7eb'}`, background: index % 2 === 0 ? (darkMode ? '#0f172a' : '#f8fafc') : 'transparent' }}>
                                <td style={{ padding: '0.9rem' }}>
                                  <div>
                                    <div style={{ color: darkMode ? 'white' : '#1f2937', fontWeight: '500' }}>{user.userName}</div>
                                    <div style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>{user.userEmail}</div>
                                  </div>
                                </td>
                                <td style={{ padding: '0.9rem' }}>
                                  <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '12px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    background: user.isActive ? '#dcfce7' : '#fee2e2',
                                    color: user.isActive ? '#166534' : '#dc2626'
                                  }}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td style={{ padding: '0.9rem', textAlign: 'center', color: darkMode ? 'white' : '#1f2937', fontWeight: '700' }}>
                                  {user.sessions}
                                </td>
                                <td style={{ padding: '0.9rem', textAlign: 'center', color: darkMode ? 'white' : '#1f2937', fontWeight: '700' }}>
                                  {user.totalTime}
                                </td>
                                <td style={{ padding: '0.9rem', textAlign: 'center', color: darkMode ? 'white' : '#1f2937', fontWeight: '700' }}>
                                  {user.leadsAdded}
                                </td>
                                <td style={{ padding: '0.9rem', textAlign: 'center', color: darkMode ? 'white' : '#1f2937', fontWeight: '700' }}>
                                  {user.customersAdded}
                                </td>
                                {isSalesRole && (
                                  <>
                                    <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                                      <span style={{
                                        padding: '0.35rem 0.6rem',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        fontWeight: '700',
                                        background: '#dbeafe',
                                        color: '#1e3a8a'
                                      }}>
                                        {user.leadsAssignedThisMonth || 0}
                                      </span>
                                    </td>
                                    <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                                      <span style={{
                                        padding: '0.35rem 0.6rem',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        fontWeight: '700',
                                        background: '#dcfce7',
                                        color: '#166534'
                                      }}>
                                        {user.leadsWorkedOn || 0}
                                      </span>
                                    </td>
                                    <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                                      <span 
                                        onClick={() => setExpandedUsers(prev => ({ ...prev, [user.userEmail]: !prev[user.userEmail] }))}
                                        style={{
                                          padding: '0.35rem 0.6rem',
                                          borderRadius: '8px',
                                          fontSize: '0.95rem',
                                          fontWeight: '700',
                                          background: '#fef3c7',
                                          color: '#d97706',
                                          cursor: user.statusChanges > 0 ? 'pointer' : 'default',
                                          textDecoration: user.statusChanges > 0 ? 'underline' : 'none'
                                        }}>
                                        {user.statusChanges || 0} {user.statusChanges > 0 && (expandedUsers[user.userEmail] ? '▼' : '▶')}
                                      </span>
                                    </td>
                                  </>
                                )}
                                <td style={{ padding: '0.9rem', color: darkMode ? '#94a3b8' : '#6b7280', fontSize: '0.85rem' }}>
                                  {new Date(user.lastActive).toLocaleString('en-IN')}
                                </td>
                              </tr>
                              {isSalesRole && expandedUsers[user.userEmail] && leadStatusChanges[user.userEmail] && leadStatusChanges[user.userEmail].length > 0 && (
                                <tr>
                                  <td colSpan="10" style={{ padding: '1rem', background: darkMode ? '#0f172a' : '#f8fafc' }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#60a5fa' : '#3b82f6', marginBottom: '0.5rem' }}>
                                      📊 Status Changes Details:
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                      {leadStatusChanges[user.userEmail].map((change, idx) => (
                                        <div key={idx} style={{
                                          padding: '0.5rem',
                                          background: darkMode ? '#1e293b' : 'white',
                                          borderRadius: '6px',
                                          borderLeft: '3px solid #22c55e',
                                          fontSize: '0.875rem'
                                        }}>
                                          <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                                            🔹 <strong style={{ color: darkMode ? 'white' : '#1f2937' }}>{change.leadName}</strong> - {change.description}
                                          </span>
                                          <span style={{ color: darkMode ? '#6b7280' : '#9ca3af', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                                            ({new Date(change.date).toLocaleDateString('en-IN')})
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
          No data available
        </div>
      )}
    </div>
  );
};

export default UserPerformanceReport;
