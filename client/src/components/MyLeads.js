import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Calendar, Clock, CheckCircle, AlertCircle, Eye, FileText } from 'lucide-react';
import apiService from '../services/apiService';

const MyLeads = ({ darkMode = false }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);

  useEffect(() => {
    const fetchMyLeads = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMyLeads();
        setLeads(response.leads || response || []);
      } catch (error) {
        console.error('Error fetching my leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyLeads();
  }, []);

  // Filter leads based on search term and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.contactPerson || lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.companyName || lead.company || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await apiService.updateLead(leadId, { status: newStatus });
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead._id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
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

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed-won', label: 'Closed Won' },
    { value: 'closed-lost', label: 'Closed Lost' }
  ];

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
          <h3>Loading your leads...</h3>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <User size={32} color={darkMode ? '#60a5fa' : '#3b82f6'} />
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: darkMode ? 'white' : '#111827',
              margin: 0
            }}>
              My Leads
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search my leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: darkMode ? '#1f2937' : 'white',
                  color: darkMode ? 'white' : '#374151',
                  fontSize: '14px'
                }}
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                🔍
              </div>
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '8px',
                backgroundColor: darkMode ? '#1f2937' : 'white',
                color: darkMode ? 'white' : '#374151',
                fontSize: '14px'
              }}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
              {filteredLeads.length}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
              {searchTerm || statusFilter !== 'all' ? 'Filtered Leads' : 'Total My Leads'}
            </div>
          </div>
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e' }}>
              {filteredLeads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Active Opportunities</div>
          </div>
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
              {filteredLeads.filter(l => l.status === 'closed-won').length}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Closed Won</div>
          </div>
        </div>

        {/* Leads List */}
        <div style={{
          backgroundColor: darkMode ? '#374151' : 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {filteredLeads.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No leads found</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No leads assigned to you yet'}
              </p>
            </div>
          ) : (
            filteredLeads.map((lead, index) => {
              const statusInfo = getStatusColor(lead.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div 
                  key={lead._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '20px',
                    borderBottom: index < filteredLeads.length - 1 ? `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}` : 'none',
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
                      <span>Created: {new Date(lead.createdAt).toLocaleDateString()}</span>
                      {lead.nextFollowUp && (
                        <span style={{ color: '#f59e0b' }}>
                          Next Follow-up: {new Date(lead.nextFollowUp).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {/* Requirements Preview */}
                    {lead.requirements && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: darkMode ? '#4b556320' : '#f8fafc',
                        borderRadius: '6px',
                        border: `1px solid ${darkMode ? '#4b5563' : '#e2e8f0'}`,
                        fontSize: '13px',
                        color: darkMode ? '#d1d5db' : '#64748b'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <FileText size={12} />
                          <span style={{ fontWeight: '600' }}>Requirements:</span>
                        </div>
                        <div style={{ 
                          maxHeight: '40px', 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {lead.requirements}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* View Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                        setShowLeadDetails(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '6px',
                        color: darkMode ? '#60a5fa' : '#3b82f6',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = darkMode ? '#3b82f620' : '#dbeafe';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="View Lead Details"
                    >
                      <Eye size={16} />
                    </button>
                    
                    {/* Status Update */}
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
        
        {/* Lead Details Modal */}
        {showLeadDetails && selectedLead && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              {/* Header */}
              <div style={{
                padding: '2rem',
                borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: 0
                  }}>
                    Lead Details
                  </h2>
                  <p style={{
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    {selectedLead.contactPerson} - {selectedLead.companyName}
                  </p>
                </div>
                <button
                  onClick={() => setShowLeadDetails(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>
              
              {/* Content */}
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Contact Person</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.contactPerson}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Company</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.companyName}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Email</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.email}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Phone</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.phone}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Industry</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Lead Source</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.leadSource}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Status</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.status}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Priority</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.priority}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Estimated Value</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>₹{selectedLead.estimatedValue ? Number(selectedLead.estimatedValue).toLocaleString() : '0'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Assigned To</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.assignedTo ? (typeof selectedLead.assignedTo === 'object' ? selectedLead.assignedTo.name : selectedLead.assignedTo) : 'Unassigned'}</p>
                    </div>
                  </div>
                  
                  {/* Requirements Section */}
                  {selectedLead.requirements && (
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151', display: 'block', marginBottom: '0.5rem' }}>Requirements / Services Needed</label>
                      <div style={{
                        padding: '1rem',
                        backgroundColor: darkMode ? '#374151' : '#f8fafc',
                        borderRadius: '8px',
                        border: `1px solid ${darkMode ? '#4b5563' : '#e2e8f0'}`,
                        color: darkMode ? '#d1d5db' : '#374151',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {selectedLead.requirements}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Created Date</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Created By</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.createdBy ? (typeof selectedLead.createdBy === 'object' ? selectedLead.createdBy.name : selectedLead.createdBy) : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLeads;