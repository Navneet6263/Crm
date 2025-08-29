import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Calendar, Clock, CheckCircle, AlertCircle, Users, Target, TrendingUp } from 'lucide-react';
import apiService from '../services/apiService';

const RoleBasedDashboard = ({ darkMode = false }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    won: 0,
    pending: 0
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(currentUser);
    fetchAssignedLeads();
  }, []);

  const fetchAssignedLeads = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyLeads();
      const assignedLeads = response.leads || response || [];
      setLeads(assignedLeads);
      
      // Calculate stats
      setStats({
        total: assignedLeads.length,
        active: assignedLeads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length,
        won: assignedLeads.filter(l => l.status === 'closed-won').length,
        pending: assignedLeads.filter(l => ['new', 'contacted'].includes(l.status)).length
      });
    } catch (error) {
      console.error('Error fetching assigned leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await apiService.updateLead(leadId, { status: newStatus });
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead._id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
      // Refresh stats
      fetchAssignedLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Failed to update lead status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': { bg: '#f3f4f6', text: '#6b7280', icon: Clock },
      'contacted': { bg: '#dbeafe', text: '#2563eb', icon: Phone },
      'qualified': { bg: '#dcfce7', text: '#16a34a', icon: CheckCircle },
      'proposal': { bg: '#fef3c7', text: '#d97706', icon: AlertCircle },
      'negotiation': { bg: '#fde68a', text: '#d97706', icon: AlertCircle },
      'closed-won': { bg: '#dcfce7', text: '#16a34a', icon: CheckCircle },
      'closed-lost': { bg: '#fee2e2', text: '#dc2626', icon: AlertCircle }
    };
    return colors[status] || colors['new'];
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'super-admin': 'Super Admin',
      'admin': 'Admin',
      'manager': 'Manager',
      'sales': 'Sales Executive',
      'support': 'Support Agent'
    };
    return roleNames[role] || role;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: darkMode ? '#9ca3af' : '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3>Loading your assigned leads...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: darkMode ? '#374151' : 'white',
          borderRadius: '16px',
          boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          marginBottom: '32px',
          border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <User size={32} color={darkMode ? '#60a5fa' : '#3b82f6'} />
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: darkMode ? 'white' : '#111827',
                margin: 0
              }}>
                My Dashboard
              </h1>
              <p style={{
                fontSize: '16px',
                color: darkMode ? '#9ca3af' : '#6b7280',
                margin: '4px 0 0 0'
              }}>
                Welcome back, {user?.name} ({getRoleDisplayName(user?.role)})
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Target size={24} color="#3b82f6" />
              <span style={{ fontSize: '14px', color: darkMode ? '#d1d5db' : '#6b7280' }}>Total Assigned</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
              {stats.total}
            </div>
          </div>

          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <TrendingUp size={24} color="#22c55e" />
              <span style={{ fontSize: '14px', color: darkMode ? '#d1d5db' : '#6b7280' }}>Active Opportunities</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>
              {stats.active}
            </div>
          </div>

          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <CheckCircle size={24} color="#f59e0b" />
              <span style={{ fontSize: '14px', color: darkMode ? '#d1d5db' : '#6b7280' }}>Closed Won</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats.won}
            </div>
          </div>

          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Clock size={24} color="#ef4444" />
              <span style={{ fontSize: '14px', color: darkMode ? '#d1d5db' : '#6b7280' }}>Pending Action</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
              {stats.pending}
            </div>
          </div>
        </div>

        {/* Assigned Leads */}
        <div style={{
          backgroundColor: darkMode ? '#374151' : 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: darkMode ? 'white' : '#111827',
              margin: 0
            }}>
              My Assigned Leads ({leads.length})
            </h2>
          </div>

          {leads.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No leads assigned</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                You don't have any leads assigned to you yet.
              </p>
            </div>
          ) : (
            leads.map((lead, index) => {
              const statusInfo = getStatusColor(lead.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div 
                  key={lead._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '20px',
                    borderBottom: index < leads.length - 1 ? `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}` : 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? '#4b556320' : '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    {(lead.contactPerson || lead.name || 'U').split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Lead Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: darkMode ? 'white' : '#111827',
                        margin: 0
                      }}>
                        {lead.contactPerson || lead.name}
                      </h3>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.text,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <StatusIcon size={12} />
                        {lead.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: darkMode ? '#d1d5db' : '#6b7280'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={14} />
                        <span>{lead.companyName || lead.company}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={14} />
                        <span>{lead.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} />
                        <span>{lead.phone}</span>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '13px',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      <span>Value: ₹{lead.estimatedValue ? Number(lead.estimatedValue).toLocaleString() : '0'}</span>
                      <span>Assigned: {new Date(lead.createdAt).toLocaleDateString()}</span>
                      {lead.nextFollowUp && (
                        <span style={{ color: '#f59e0b' }}>
                          Next Follow-up: {new Date(lead.nextFollowUp).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div style={{ marginLeft: '16px' }}>
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                      style={{
                        padding: '6px 8px',
                        border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        backgroundColor: darkMode ? '#1f2937' : 'white',
                        color: darkMode ? 'white' : '#374151',
                        fontSize: '12px'
                      }}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed-won">Closed Won</option>
                      <option value="closed-lost">Closed Lost</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;