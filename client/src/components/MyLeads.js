import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Calendar, Clock, CheckCircle, AlertCircle, Eye, FileText, Edit, Search, Filter, DollarSign, Target, TrendingUp, MessageCircle } from 'lucide-react';
import apiService from '../services/apiService';

const MyLeads = ({ darkMode = false, crmData, user }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    notes: '',
    priority: ''
  });

  useEffect(() => {
    const fetchMyLeads = async () => {
      try {
        setLoading(true);
        // Primary: Use backend API
        let leadsData = [];
        try {
          const response = await apiService.getMyLeads();
          leadsData = Array.isArray(response) ? response : (response.leads || []);
          
          // If backend doesn't return leads, try getAllLeads and filter
          if (leadsData.length === 0) {
            const allLeadsResponse = await apiService.getAllLeads();
            const allLeads = Array.isArray(allLeadsResponse) ? allLeadsResponse : (allLeadsResponse.leads || []);
            
            if (user && allLeads.length > 0) {
              const currentUserId = user._id || user.id;
              
              leadsData = allLeads.filter(lead => {
                // Show leads assigned to current user
                if (lead.assignedTo) {
                  const assignedUserId = typeof lead.assignedTo === 'object' 
                    ? lead.assignedTo._id || lead.assignedTo.id
                    : lead.assignedTo;
                  if (assignedUserId === currentUserId) {
                    return true;
                  }
                }
                
                // Show leads created by current user
                if (lead.createdBy) {
                  const createdByUserId = typeof lead.createdBy === 'object'
                    ? lead.createdBy._id || lead.createdBy.id
                    : lead.createdBy;
                  if (createdByUserId === currentUserId) {
                    return true;
                  }
                }
                
                // For admin roles, show all leads
                if (user.role === 'super-admin' || user.role === 'admin') {
                  return true;
                }
                
                return false;
              });
            }
          }
        } catch (apiError) {
          // Fallback: Use crmData prop if available
          if (crmData && crmData.leads) {
            const leadsArray = Array.isArray(crmData.leads) ? crmData.leads : [];
            
            leadsData = leadsArray.filter(lead => {
              if (!user) return true;
              
              const currentUserId = user._id || user.id;
              
              // Show leads that are assigned to current user
              if (lead.assignedTo) {
                const assignedUserId = typeof lead.assignedTo === 'object' 
                  ? lead.assignedTo._id || lead.assignedTo.id
                  : lead.assignedTo;
                if (assignedUserId === currentUserId) {
                  return true;
                }
              }
              
              // Show leads created by current user
              if (lead.createdBy) {
                const createdByUserId = typeof lead.createdBy === 'object'
                  ? lead.createdBy._id || lead.createdBy.id
                  : lead.createdBy;
                if (createdByUserId === currentUserId) {
                  return true;
                }
              }
              
              // For admin roles, show all leads
              if (user.role === 'super-admin' || user.role === 'admin') {
                return true;
              }
              
              return false;
            });
          }
        }
        
        setLeads(leadsData);
      } catch (error) {
        console.error('Error fetching my leads:', error);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyLeads();
  }, [crmData, user]);

  // Enhanced filtering with priority
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.contactPerson || lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.companyName || lead.company || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await apiService.updateLead(leadId, { status: newStatus });
      
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          (lead._id || lead.id) === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert(`Failed to update lead status: ${error.message}`);
    }
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setEditData({
      status: lead.status || 'new',
      notes: lead.notes || '',
      priority: lead.priority || 'medium'
    });
    setShowEditModal(true);
  };

  const saveEditLead = async () => {
    try {
      const updatedLead = {
        status: editData.status,
        notes: editData.notes,
        priority: editData.priority,
        lastActivity: new Date().toISOString()
      };

      const leadId = selectedLead._id || selectedLead.id;
      
      await apiService.updateLead(leadId, updatedLead);
      
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          (lead._id || lead.id) === leadId ? { ...lead, ...updatedLead } : lead
        )
      );
      
      setShowEditModal(false);
      setSelectedLead(null);
      alert('Lead updated successfully!');
    } catch (error) {
      console.error('Error updating lead:', error);
      alert(`Error updating lead: ${error.message}`);
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
    { value: 'converted', label: 'Converted' },
    { value: 'closed-won', label: 'Closed Won' },
    { value: 'closed-lost', label: 'Closed Lost' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      'low': { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' },
      'medium': { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
      'high': { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
      'urgent': { bg: '#fecaca', text: '#991b1b', border: '#dc2626' }
    };
    return colors[priority] || colors['medium'];
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <User size={32} color={darkMode ? '#60a5fa' : '#3b82f6'} />
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: darkMode ? 'white' : '#111827',
                  margin: 0
                }}>
                  My Leads
                </h1>
                <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
                  Manage your assigned leads and track your sales pipeline
                </p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#3b82f6' : (darkMode ? '#4b5563' : '#f3f4f6'),
                  color: viewMode === 'grid' ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'list' ? '#3b82f6' : (darkMode ? '#4b5563' : '#f3f4f6'),
                  color: viewMode === 'list' ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                List
              </button>
            </div>
          </div>
          
          {/* Enhanced Filters */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: darkMode ? '#9ca3af' : '#6b7280'
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
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[
            { 
              label: 'Total Leads', 
              value: leads.length,
              icon: Target, 
              color: '#3b82f6' 
            },
            { 
              label: 'High Priority', 
              value: leads.filter(l => l.priority === 'high' || l.priority === 'urgent').length,
              icon: TrendingUp, 
              color: '#ef4444' 
            },
            { 
              label: 'This Week', 
              value: leads.filter(l => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(l.createdAt || l.createdDate) > weekAgo;
              }).length,
              icon: Calendar, 
              color: '#22c55e' 
            },
            { 
              label: 'Pipeline Value', 
              value: `₹${((leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)) / 100000).toFixed(1)}L`,
              icon: DollarSign, 
              color: '#f59e0b' 
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} style={{
                backgroundColor: darkMode ? '#374151' : 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
              }}>
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

        {/* Leads Display */}
        <div style={{
          display: viewMode === 'grid' ? 'grid' : 'block',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(420px, 1fr))' : '1fr',
          gap: viewMode === 'grid' ? '1.5rem' : '0',
          backgroundColor: viewMode === 'list' ? (darkMode ? '#374151' : 'white') : 'transparent',
          borderRadius: viewMode === 'list' ? '16px' : '0',
          overflow: viewMode === 'list' ? 'hidden' : 'visible',
          boxShadow: viewMode === 'list' ? (darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)') : 'none',
          border: viewMode === 'list' ? (darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb') : 'none'
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
              const priorityInfo = getPriorityColor(lead.priority);
              const StatusIcon = statusInfo.icon;
              
              if (viewMode === 'grid') {
                return (
                  <div 
                    key={lead._id || lead.id}
                    style={{
                      backgroundColor: darkMode ? '#374151' : 'white',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = darkMode ? '0 8px 25px -8px rgba(0, 0, 0, 0.4)' : '0 8px 25px -8px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {/* Priority Indicator */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '4px',
                      height: '100%',
                      background: priorityInfo.border
                    }} />
                    
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          {(lead.contactPerson || lead.name || 'U').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: darkMode ? 'white' : '#111827',
                            margin: 0,
                            marginBottom: '4px'
                          }}>
                            {lead.contactPerson || lead.name}
                          </h3>
                          <p style={{
                            fontSize: '14px',
                            color: darkMode ? '#9ca3af' : '#6b7280',
                            margin: 0
                          }}>
                            {lead.companyName || lead.company}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.text,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <StatusIcon size={12} />
                          {lead.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: darkMode ? '#d1d5db' : '#6b7280' }}>
                          <Mail size={16} style={{ color: '#3b82f6' }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: darkMode ? '#d1d5db' : '#6b7280' }}>
                          <Phone size={16} style={{ color: '#22c55e' }} />
                          <span>{lead.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Value & Priority */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: darkMode ? '#4b556320' : '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <p style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', margin: 0 }}>Estimated Value</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e', margin: 0 }}>
                          ₹{lead.estimatedValue ? Number(lead.estimatedValue).toLocaleString() : '0'}
                        </p>
                      </div>
                      <div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: priorityInfo.bg,
                          color: priorityInfo.text,
                          border: `1px solid ${priorityInfo.border}`
                        }}>
                          {lead.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                            setShowLeadDetails(true);
                          }}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                          onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                        >
                          <Eye size={14} />
                          View
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLead(lead);
                          }}
                          style={{
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#d97706'}
                          onMouseLeave={(e) => e.target.style.background = '#f59e0b'}
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                      </div>
                      
                      <select
                        value={lead.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateLeadStatus(lead._id || lead.id, e.target.value);
                        }}
                        style={{
                          padding: '6px 8px',
                          border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                          borderRadius: '6px',
                          backgroundColor: darkMode ? '#1f2937' : 'white',
                          color: darkMode ? 'white' : '#374151',
                          fontSize: '12px',
                          cursor: 'pointer'
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
              } else {
                // List View
                return (
                  <div 
                    key={lead._id || lead.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '20px',
                      borderBottom: index < filteredLeads.length - 1 ? `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}` : 'none',
                      transition: 'all 0.2s',
                      position: 'relative'
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
                    <div style={{ 
                      marginLeft: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      position: 'relative',
                      zIndex: 10
                    }}>
                      {/* View Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                          setShowLeadDetails(true);
                        }}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                        title="View Lead Details"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      
                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLead(lead);
                        }}
                        style={{
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#d97706'}
                        onMouseLeave={(e) => e.target.style.background = '#f59e0b'}
                        title="Edit Lead"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      
                      {/* Status Update */}
                      <select
                        value={lead.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateLeadStatus(lead._id || lead.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          padding: '8px',
                          border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                          borderRadius: '6px',
                          backgroundColor: darkMode ? '#1f2937' : 'white',
                          color: darkMode ? 'white' : '#374151',
                          fontSize: '12px',
                          minWidth: '100px',
                          cursor: 'pointer'
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
              }
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
                  
                  {/* Edit Button */}
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        console.log('Edit button clicked in modal for lead:', selectedLead._id);
                        setShowLeadDetails(false);
                        handleEditLead(selectedLead);
                      }}
                      style={{
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        background: '#3b82f6',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Edit size={16} />
                      Edit Lead
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Lead Modal */}
        {showEditModal && selectedLead && (
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
              maxWidth: '500px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              {/* Header */}
              <div style={{
                padding: '1.5rem',
                borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  margin: 0
                }}>
                  Edit Lead: {selectedLead.companyName}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
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
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '1rem'
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

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Priority
                  </label>
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({...editData, priority: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Notes
                  </label>
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    placeholder="Add notes about this lead..."
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem'
                }}>
                  <button
                    onClick={() => {
                      console.log('Cancel clicked');
                      setShowEditModal(false);
                    }}
                    style={{
                      padding: '12px 24px',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      background: 'transparent',
                      color: darkMode ? '#d1d5db' : '#374151',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      console.log('Save clicked');
                      saveEditLead();
                    }}
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#3b82f6',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Edit size={16} />
                    Update Lead
                  </button>
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