import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Building, Mail, Phone, Target } from 'lucide-react';
import apiService from '../services/apiService';

const GroupLeads = ({ darkMode = false }) => {
  const [groupLeads, setGroupLeads] = useState([]);
  const [salesStats, setSalesStats] = useState({ stats: [], pendingLeads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsData, statsData] = await Promise.all([
        apiService.getPendingGroupLeads(),
        apiService.getSalesTeamStats()
      ]);
      setGroupLeads(leadsData || []);
      setSalesStats(statsData || { stats: [], pendingLeads: 0 });
    } catch (error) {
      console.error('Error fetching data:', error);
      setGroupLeads([]);
      setSalesStats({ stats: [], pendingLeads: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (leadId) => {
    try {
      await apiService.acceptGroupLead(leadId);
      setGroupLeads(prev => prev.filter(lead => (lead._id || lead.id) !== leadId));
      // Refresh stats
      const statsData = await apiService.getSalesTeamStats();
      setSalesStats(statsData || { stats: [], pendingLeads: 0 });
      if (window.showToast) {
        window.showToast('success', '✅ Lead accepted successfully!');
      } else {
        alert('Lead accepted successfully!');
      }
    } catch (error) {
      console.error('Error accepting lead:', error);
      if (window.showToast) {
        window.showToast('error', '❌ Failed to accept lead');
      } else {
        alert('Failed to accept lead');
      }
    }
  };

  const handleReject = async (leadId) => {
    try {
      await apiService.declineGroupLead(leadId);
      setGroupLeads(prev => prev.filter(lead => (lead._id || lead.id) !== leadId));
      if (window.showToast) {
        window.showToast('info', 'Lead declined');
      } else {
        alert('Lead declined');
      }
    } catch (error) {
      console.error('Error rejecting lead:', error);
      if (window.showToast) {
        window.showToast('error', '❌ Failed to decline lead');
      } else {
        alert('Failed to decline lead');
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center', color: darkMode ? '#9ca3af' : '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3>Loading group leads...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: darkMode ? '#374151' : 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <Target size={32} color="#f59e0b" />
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: darkMode ? 'white' : '#111827',
              margin: 0
            }}>
              Group Leads
            </h1>
          </div>
          <p style={{
            fontSize: '16px',
            color: darkMode ? '#d1d5db' : '#6b7280',
            margin: 0
          }}>
            Leads assigned to your team - Accept to add to your pipeline
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
              {groupLeads.length}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Available Leads</div>
          </div>
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e' }}>
              {salesStats.stats.reduce((sum, s) => sum + s.acceptedLeads, 0)}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Total Accepted</div>
          </div>
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
              {salesStats.stats.length}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Sales Team</div>
          </div>
        </div>

        {/* Sales Team Performance */}
        {salesStats.stats.length > 0 && (
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? 'white' : '#111827', marginBottom: '16px' }}>
              📈 Sales Team Performance
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {salesStats.stats.map((stat) => (
                <div key={stat.userId} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? '#6b7280' : '#e5e7eb'}`
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? 'white' : '#111827' }}>
                      {stat.name}
                    </div>
                    <div style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      {stat.email}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>
                        {stat.acceptedLeads}
                      </div>
                      <div style={{ fontSize: '11px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Accepted</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads List */}
        {groupLeads.length === 0 ? (
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: darkMode ? 'white' : '#111827', marginBottom: '8px' }}>No Pending Leads</h3>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>No group leads available at the moment</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {groupLeads.map((lead) => {
              const leadId = lead._id || lead.id;
              return (
                <div key={leadId} style={{
                  backgroundColor: darkMode ? '#374151' : 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                  border: `2px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '24px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        {lead.product && (
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: lead.product.color || '#22c55e',
                            color: 'white'
                          }}>
                            {lead.product.icon} {lead.product.name}
                          </span>
                        )}
                      </div>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: darkMode ? 'white' : '#111827',
                        marginBottom: '8px'
                      }}>
                        {lead.companyName || 'No Company'}
                      </h3>
                      <p style={{
                        fontSize: '16px',
                        color: darkMode ? '#d1d5db' : '#6b7280',
                        marginBottom: '12px'
                      }}>
                        {lead.contactPerson || 'No Contact'}
                      </p>
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        fontSize: '14px',
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={14} />
                          <span>{lead.phone || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={14} />
                          <span>{lead.email || 'N/A'}</span>
                        </div>
                        <div>
                          Value: ₹{lead.estimatedValue ? Number(lead.estimatedValue).toLocaleString() : '0'}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleAccept(leadId)}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#22c55e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#16a34a'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#22c55e'}
                      >
                        <CheckCircle size={16} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(leadId)}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                      >
                        <XCircle size={16} />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupLeads;