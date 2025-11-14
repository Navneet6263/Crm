import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Download,
  ArrowUpDown,
  Activity
} from 'lucide-react';

const LeadHistory = ({ crmData, darkMode = false }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'timeline'

  useEffect(() => {
    const allLeads = Array.isArray(crmData.leads) ? crmData.leads : (crmData.leads?.leads || []);
    setLeads(allLeads);
    setFilteredLeads(allLeads);
  }, [crmData]);

  useEffect(() => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        (lead.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(lead => {
            const leadDate = new Date(lead.createdDate || lead.createdAt);
            return !isNaN(leadDate.getTime()) && leadDate >= filterDate;
          });
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(lead => {
            const leadDate = new Date(lead.createdDate || lead.createdAt);
            return !isNaN(leadDate.getTime()) && leadDate >= filterDate;
          });
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(lead => {
            const leadDate = new Date(lead.createdDate || lead.createdAt);
            return !isNaN(leadDate.getTime()) && leadDate >= filterDate;
          });
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdDate || a.createdAt);
          bValue = new Date(b.createdDate || b.createdAt);
          break;
        case 'name':
          aValue = (a.contactPerson || '').toLowerCase();
          bValue = (b.contactPerson || '').toLowerCase();
          break;
        case 'company':
          aValue = (a.companyName || '').toLowerCase();
          bValue = (b.companyName || '').toLowerCase();
          break;
        case 'value':
          aValue = a.estimatedValue || 0;
          bValue = b.estimatedValue || 0;
          break;
        default:
          aValue = new Date(a.createdDate || a.createdAt);
          bValue = new Date(b.createdDate || b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  const getStatusColor = (status) => {
    const colors = {
      'new': { bg: '#dbeafe', text: '#1d4ed8', border: '#3b82f6' },
      'contacted': { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
      'qualified': { bg: '#e0e7ff', text: '#5b21b6', border: '#8b5cf6' },
      'proposal': { bg: '#fce7f3', text: '#be185d', border: '#ec4899' },
      'negotiation': { bg: '#fde68a', text: '#d97706', border: '#f59e0b' },
      'converted': { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
      'closed-won': { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
      'lost': { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
      'closed-lost': { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' }
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

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewDetails = (lead) => {
    setSelectedLead(lead);
    setShowDetails(true);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not available';
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString('en-IN');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const containerStyle = {
    padding: '0',
    background: darkMode ? '#111827' : '#f9fafb',
    minHeight: '100vh'
  };

  const cardStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '16px',
    boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Clock style={{ color: '#3b82f6' }} size={32} />
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Lead History
              </h1>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
                Complete timeline and history of all your leads
              </p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'table' ? '#3b82f6' : (darkMode ? '#4b5563' : '#f3f4f6'),
                color: viewMode === 'table' ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'timeline' ? '#3b82f6' : (darkMode ? '#4b5563' : '#f3f4f6'),
                color: viewMode === 'timeline' ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Timeline
            </button>
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
            value: leads.length,
            icon: User, 
            color: '#3b82f6',
            trend: '+12%'
          },
          { 
            label: 'Converted', 
            value: leads.filter(l => ['converted', 'closed-won'].includes(l.status)).length,
            icon: TrendingUp, 
            color: '#22c55e',
            trend: '+8%'
          },
          { 
            label: 'In Progress', 
            value: leads.filter(l => ['contacted', 'qualified', 'proposal', 'negotiation'].includes(l.status)).length,
            icon: Clock, 
            color: '#f59e0b',
            trend: '+5%'
          },
          { 
            label: 'Lost Leads', 
            value: leads.filter(l => ['lost', 'closed-lost'].includes(l.status)).length,
            icon: TrendingDown, 
            color: '#ef4444',
            trend: '-3%'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} style={{ ...cardStyle, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <Icon style={{ color: stat.color }} size={24} />
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: stat.trend.startsWith('+') ? '#22c55e' : '#ef4444'
                }}>
                  {stat.trend}
                </span>
              </div>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  {stat.label}
                </p>
                <p style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: darkMode ? 'white' : '#1f2937',
                  margin: 0
                }}>
                  {stat.value}
                </p>
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
              placeholder="Search leads by name, company, or email..."
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={20} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
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
              <option value="negotiation">Negotiation</option>
              <option value="converted">Converted</option>
              <option value="closed-won">Closed Won</option>
              <option value="lost">Lost</option>
              <option value="closed-lost">Closed Lost</option>
            </select>
          </div>

          {/* Date Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
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
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            style={{
              padding: '0.75rem 1rem',
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
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        /* Table View */
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            background: darkMode ? '#374151' : '#f9fafb'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1fr 1fr',
              gap: '1rem',
              alignItems: 'center'
            }}>
              {[
                { label: 'Contact', field: 'name' },
                { label: 'Company', field: 'company' },
                { label: 'Status', field: 'status' },
                { label: 'Priority', field: 'priority' },
                { label: 'Value', field: 'value' },
                { label: 'Created', field: 'date' },
                { label: 'Actions', field: null }
              ].map((header, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}>
                    {header.label}
                  </span>
                  {header.field && (
                    <button
                      onClick={() => handleSort(header.field)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      <ArrowUpDown size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table Body */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredLeads.map((lead, index) => {
              const statusColor = getStatusColor(lead.status);
              const priorityColor = getPriorityColor(lead.priority);
              
              return (
                <div key={lead._id || lead.id || index} style={{
                  padding: '1.5rem',
                  borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#374151' : '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1fr 1fr',
                    gap: '1rem',
                    alignItems: 'center'
                  }}>
                    {/* Contact */}
                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: darkMode ? 'white' : '#1f2937',
                        marginBottom: '0.25rem'
                      }}>
                        {lead.contactPerson || lead.name}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Mail size={14} />
                        {lead.email}
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: darkMode ? 'white' : '#1f2937',
                        marginBottom: '0.25rem'
                      }}>
                        {lead.companyName || lead.company}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}>
                        {lead.industry || 'N/A'}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
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

                    {/* Priority */}
                    <div>
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
                        {lead.priority || 'medium'}
                      </span>
                    </div>

                    {/* Value */}
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#22c55e'
                    }}>
                      ₹{(lead.estimatedValue || 0).toLocaleString()}
                    </div>

                    {/* Created Date */}
                    <div style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      {formatDate(lead.createdDate || lead.createdAt)}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleViewDetails(lead)}
                        style={{
                          padding: '0.5rem',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px'
                        }}
                        title="View Details"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: '2rem',
            top: '0',
            bottom: '0',
            width: '2px',
            background: darkMode ? '#374151' : '#e5e7eb'
          }}></div>
          
          {filteredLeads.map((lead, index) => {
            const statusColor = getStatusColor(lead.status);
            
            return (
              <div key={lead._id || lead.id || index} style={{
                position: 'relative',
                marginLeft: '4rem',
                marginBottom: '2rem'
              }}>
                {/* Timeline marker */}
                <div style={{
                  position: 'absolute',
                  left: '-3rem',
                  top: '1rem',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  background: statusColor.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `3px solid ${darkMode ? '#111827' : '#f9fafb'}`
                }}>
                  <Clock size={12} style={{ color: 'white' }} />
                </div>
                
                {/* Timeline content */}
                <div style={{
                  ...cardStyle,
                  padding: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: darkMode ? 'white' : '#1f2937',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {lead.companyName || lead.company}
                      </h3>
                      <p style={{
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        fontSize: '0.875rem',
                        margin: 0
                      }}>
                        {lead.contactPerson || lead.name}
                      </p>
                    </div>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
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
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <strong style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Contact:</strong>
                      <p style={{ margin: '0.25rem 0', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        {lead.contactPerson || lead.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Assigned to:</strong>
                      <p style={{ margin: '0.25rem 0', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        {typeof lead.assignedTo === 'object' ? lead.assignedTo?.name || 'Unassigned' : lead.assignedTo || 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Created:</strong>
                      <p style={{ margin: '0.25rem 0', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        {formatDate(lead.createdDate || lead.createdAt)}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Last Activity:</strong>
                      <p style={{ margin: '0.25rem 0', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        {formatDate(lead.lastActivity) || 'No activity yet'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    justifyContent: 'flex-end'
                  }}>
                    {lead.email && (
                      <button
                        onClick={() => window.open(`mailto:${lead.email}`)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: darkMode ? '#374151' : '#f3f4f6',
                          color: darkMode ? '#d1d5db' : '#374151',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        title="Send Email"
                      >
                        <Mail size={14} />
                      </button>
                    )}
                    {lead.phone && (
                      <button
                        onClick={() => window.open(`tel:${lead.phone}`)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: darkMode ? '#374151' : '#f3f4f6',
                          color: darkMode ? '#d1d5db' : '#374151',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        title="Make Call"
                      >
                        <Phone size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(lead)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: darkMode ? '#374151' : '#f3f4f6',
                        color: darkMode ? '#d1d5db' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div style={{
          ...cardStyle,
          padding: '3rem',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <Activity size={48} style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem' }} />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            No leads found
          </h3>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No lead history available yet'
            }
          </p>
        </div>
      )}

      {/* Lead Details Modal */}
      {showDetails && selectedLead && (
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
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
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
                Lead Details - {selectedLead.contactPerson || selectedLead.name}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
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
              {/* Lead Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
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
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Name</label>
                      <p style={{ fontWeight: '500', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>{selectedLead.contactPerson || selectedLead.name}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Email</label>
                      <p style={{ fontWeight: '500', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>{selectedLead.email}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Phone</label>
                      <p style={{ fontWeight: '500', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>{selectedLead.phone}</p>
                    </div>
                  </div>
                </div>

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
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Company</label>
                      <p style={{ fontWeight: '500', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>{selectedLead.companyName || selectedLead.company}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Industry</label>
                      <p style={{ fontWeight: '500', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>{selectedLead.industry || 'N/A'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>Estimated Value</label>
                      <p style={{ fontWeight: '500', color: '#22c55e', margin: 0 }}>₹{selectedLead.estimatedValue?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadHistory;