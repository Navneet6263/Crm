import React, { useState, useEffect } from 'react';

import { 
  User, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Building,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  MessageCircle,
  TrendingUp,
  Clock,
  Target,
  Plus
} from 'lucide-react';

const ProfessionalMyLeads = ({ darkMode, crmData, user }) => {
  const [myLeads, setMyLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);

  useEffect(() => {
    // Filter leads assigned to current user
    const leadsArray = Array.isArray(crmData.leads) ? crmData.leads : [];
    const userLeads = leadsArray.filter(lead => {
      if (!user) return false;
      
      // Check if lead is assigned to current user
      if (lead.assignedTo) {
        // Handle both object and string assignment formats
        const assignedUserId = typeof lead.assignedTo === 'object' 
          ? lead.assignedTo._id || lead.assignedTo.id
          : lead.assignedTo;
        const currentUserId = user._id || user.id;
        
        return assignedUserId === currentUserId;
      }
      
      // For super-admin and admin roles, show all leads if no specific assignment
      if (user.role === 'super-admin' || user.role === 'admin') {
        return true;
      }
      
      return false;
    });
    
    setMyLeads(userLeads);
    setFilteredLeads(userLeads);
  }, [crmData, user]);

  useEffect(() => {
    let filtered = [...myLeads];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(lead => lead.priority === priorityFilter);
    }

    setFilteredLeads(filtered);
  }, [myLeads, searchTerm, statusFilter, priorityFilter]);

  const getStatusColor = (status) => {
    const colors = {
      'new': { bg: '#dbeafe', text: '#1d4ed8', border: '#3b82f6' },
      'contacted': { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
      'qualified': { bg: '#e0e7ff', text: '#5b21b6', border: '#8b5cf6' },
      'proposal': { bg: '#fce7f3', text: '#be185d', border: '#ec4899' },
      'converted': { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
      'lost': { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' }
    };
    return colors[status] || colors['new'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' },
      'medium': { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
      'high': { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
      'urgent': { bg: '#fecaca', text: '#991b1b', border: '#dc2626' }
    };
    return colors[priority] || colors['medium'];
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <User style={{ color: '#22c55e' }} size={32} />
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0
            }}>
              My Leads
            </h1>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
              Manage your assigned leads and track your sales pipeline
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          { 
            label: 'Total Leads', 
            value: myLeads.length,
            icon: Target, 
            color: '#3b82f6' 
          },
          { 
            label: 'High Priority', 
            value: myLeads.filter(l => l.priority === 'high').length,
            icon: TrendingUp, 
            color: '#ef4444' 
          },
          { 
            label: 'This Week', 
            value: myLeads.filter(l => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(l.createdDate) > weekAgo;
            }).length,
            icon: Calendar, 
            color: '#22c55e' 
          },
          { 
            label: 'Pipeline Value', 
            value: `₹${((myLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)) / 100000).toFixed(1)}L`,
            icon: DollarSign, 
            color: '#f59e0b' 
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} style={{ ...cardStyle, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    {stat.label}
                  </p>
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: darkMode ? 'white' : '#1f2937'
                  }}>
                    {stat.value}
                  </p>
                </div>
                <Icon style={{ color: stat.color }} size={28} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search your leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#1f2937',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              background: darkMode ? '#374151' : 'white',
              color: darkMode ? 'white' : '#1f2937',
              fontSize: '1rem',
              outline: 'none'
            }}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="converted">Converted</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              background: darkMode ? '#374151' : 'white',
              color: darkMode ? 'white' : '#1f2937',
              fontSize: '1rem',
              outline: 'none'
            }}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Leads Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredLeads.map(lead => {
          const statusColor = getStatusColor(lead.status);
          const priorityColor = getPriorityColor(lead.priority);
          
          return (
            <div key={lead.id} style={{ ...cardStyle, padding: '1.5rem' }}>
              {/* Lead Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {lead.contactPerson}
                  </h3>
                  <p style={{
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: '0.875rem',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Building size={14} />
                    {lead.companyName}
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    background: priorityColor.bg,
                    color: priorityColor.text,
                    border: `1px solid ${priorityColor.border}`
                  }}>
                    {lead.priority}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#d1d5db' : '#374151'
                }}>
                  <Mail size={14} style={{ color: '#3b82f6' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lead.email}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#d1d5db' : '#374151'
                }}>
                  <Phone size={14} style={{ color: '#22c55e' }} />
                  <span>{lead.phone}</span>
                </div>
              </div>

              {/* Lead Details */}
              <div style={{
                background: darkMode ? '#374151' : '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      display: 'block'
                    }}>
                      Value
                    </span>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#22c55e'
                    }}>
                      ₹{(lead.estimatedValue || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      display: 'block'
                    }}>
                      Status
                    </span>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      background: statusColor.bg,
                      color: statusColor.text,
                      border: `1px solid ${statusColor.border}`
                    }}>
                      {lead.status}
                    </span>
                  </div>
                </div>
                
                {lead.notes && (
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      display: 'block',
                      marginBottom: '0.25rem'
                    }}>
                      Notes
                    </span>
                    <p style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#d1d5db' : '#374151',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {lead.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  fontSize: '0.875rem'
                }}>
                  <div>
                    <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Last Contact:</span>
                    <br />
                    <span style={{ color: darkMode ? '#d1d5db' : '#374151', fontWeight: '500' }}>
                      {lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : 'Not contacted'}
                    </span>
                  </div>
                  
                  <div>
                    <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Next Follow-up:</span>
                    <br />
                    <span style={{ color: '#f59e0b', fontWeight: '500' }}>
                      {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : 'Not scheduled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    style={{
                      padding: '0.5rem',
                      background: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Call"
                  >
                    <Phone size={14} />
                  </button>
                  
                  <button
                    style={{
                      padding: '0.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Email"
                  >
                    <Mail size={14} />
                  </button>
                  
                  <button
                    style={{
                      padding: '0.5rem',
                      background: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Message"
                  >
                    <MessageCircle size={14} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowLeadModal(true);
                    }}
                    style={{
                      padding: '0.5rem',
                      background: darkMode ? '#374151' : '#f3f4f6',
                      color: darkMode ? '#d1d5db' : '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>
                  
                  <button
                    style={{
                      padding: '0.5rem',
                      background: darkMode ? '#374151' : '#f3f4f6',
                      color: darkMode ? '#d1d5db' : '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div style={{
          ...cardStyle,
          padding: '3rem',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <User size={48} style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem' }} />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            No leads found
          </h3>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No leads assigned to you yet'
            }
          </p>
        </div>
      )}
      
      {/* Lead Detail Modal with Activity Timeline */}
      {showLeadModal && selectedLead && (
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
          padding: '2rem'
        }}>
          <div style={{
            background: darkMode ? '#1f2937' : 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Lead Details - {selectedLead.contactPerson}
              </h3>
              <button
                onClick={() => setShowLeadModal(false)}
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

            <div style={{ padding: '1.5rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                {/* Lead Info */}
                <div>
                  <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#1f2937',
                    marginBottom: '1rem'
                  }}>
                    Contact Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Company</label>
                      <p style={{ fontWeight: '500', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>{selectedLead.companyName}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Email</label>
                      <p style={{ fontWeight: '500', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>{selectedLead.email}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Phone</label>
                      <p style={{ fontWeight: '500', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>{selectedLead.phone}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Industry</label>
                      <p style={{ fontWeight: '500', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>{selectedLead.industry}</p>
                    </div>
                  </div>
                </div>

                {/* Lead Status */}
                <div>
                  <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#1f2937',
                    marginBottom: '1rem'
                  }}>
                    Lead Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Estimated Value</label>
                      <p style={{ fontWeight: '500', color: '#22c55e', margin: 0 }}>₹{selectedLead.estimatedValue?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Status</label>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        ...getStatusColor(selectedLead.status)
                      }}>
                        {selectedLead.status}
                      </span>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Priority</label>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        ...getPriorityColor(selectedLead.priority)
                      }}>
                        {selectedLead.priority}
                      </span>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Created Date</label>
                      <p style={{ fontWeight: '500', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>
                        {new Date(selectedLead.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Notes
                </h4>
                <div style={{
                  background: darkMode ? '#374151' : '#f9fafb',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
                }}>
                  <p style={{
                    color: darkMode ? '#d1d5db' : '#374151',
                    margin: 0,
                    lineHeight: '1.6'
                  }}>
                    {selectedLead.notes || 'No notes available'}
                  </p>
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h4 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Activity Timeline
                </h4>
                <div style={{
                  background: darkMode ? '#374151' : '#f9fafb',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#22c55e',
                      borderRadius: '50%'
                    }} />
                    <div>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? 'white' : '#1f2937',
                        margin: 0
                      }}>
                        Lead created
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        margin: 0
                      }}>
                        {new Date(selectedLead.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {selectedLead.lastContact && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#3b82f6',
                        borderRadius: '50%'
                      }} />
                      <div>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: darkMode ? 'white' : '#1f2937',
                          margin: 0
                        }}>
                          Last contacted
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: darkMode ? '#9ca3af' : '#6b7280',
                          margin: 0
                        }}>
                          {new Date(selectedLead.lastContact).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '2rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <MessageCircle size={16} />
                  Contact Lead
                </button>
                <button
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
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <Edit size={16} />
                  Edit Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalMyLeads;