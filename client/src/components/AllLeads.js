import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Building, Calendar, Star, User, CheckCircle, Clock, Target, Trash2, Upload, Eye, FileText } from 'lucide-react';
import apiService from '../services/apiService';
import BulkUpload from './BulkUpload';

const AllLeads = ({ darkMode = false, crmData = {} }) => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);

  // Get current user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  // Fetch leads and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [leadsResponse, usersResponse] = await Promise.all([
          apiService.getLeads(),
          apiService.getUsers()
        ]);
        
        // Handle both array and object responses
        const leadsData = leadsResponse.leads || leadsResponse || [];
        setLeads(Array.isArray(leadsData) ? leadsData : []);
        setUsers(usersResponse || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to crmData if API fails
        setLeads(crmData.leads || []);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [crmData.leads]);

  // Filter leads based on search term
  const filteredLeads = leads.filter(lead => 
    (lead.contactPerson || lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.companyName || lead.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.phone || '').includes(searchTerm) ||
    (lead.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLeadSelect = (leadId) => {
    console.log('Selecting lead ID:', leadId);
    if (selectedLeadId === leadId) {
      setSelectedLeadId(null);
      setShowAssignDropdown(false);
    } else {
      setSelectedLeadId(leadId);
      setShowAssignDropdown(true);
    }
  };

  const assignLeadHandler = async (e) => {
    const assignedUserId = e.target.value;
    if (assignedUserId && selectedLeadId) {
      try {
        const assignedUser = users.find(u => u._id === assignedUserId);
        
        // Call API to assign lead
        await apiService.assignLead(selectedLeadId, assignedUserId);
        
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            (lead._id || lead.id) === selectedLeadId 
              ? { ...lead, assignedTo: assignedUser }
              : lead
          )
        );
        
        // Show success notification
        if (window.showToast) {
          window.showToast('success', `✅ Lead assigned to ${assignedUser?.name} successfully!`);
        } else {
          alert(`✅ Lead assigned to ${assignedUser?.name} successfully!`);
        }
      } catch (error) {
        console.error('Error assigning lead:', error);
        if (window.showToast) {
          window.showToast('error', '❌ Failed to assign lead. Please try again.');
        } else {
          alert('❌ Failed to assign lead. Please try again.');
        }
      }
      
      setShowAssignDropdown(false);
      setSelectedLeadId(null);
    }
  };

  const handleDeleteLead = async (leadId, leadName) => {
    if (window.confirm(`Are you sure you want to delete lead "${leadName}"? This action cannot be undone.`)) {
      try {
        await apiService.deleteLead(leadId);
        setLeads(prevLeads => prevLeads.filter(lead => (lead._id || lead.id) !== leadId));
        if (window.showToast) {
          window.showToast('success', '✅ Lead deleted successfully!');
        } else {
          alert('✅ Lead deleted successfully!');
        }
        
        // Clear selection if deleted lead was selected
        if (selectedLeadId === leadId) {
          setSelectedLeadId(null);
          setShowAssignDropdown(false);
        }
      } catch (error) {
        console.error('Error deleting lead:', error);
        if (window.showToast) {
          window.showToast('error', '❌ Failed to delete lead. Please try again.');
        } else {
          alert('❌ Failed to delete lead. Please try again.');
        }
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'qualified': { bg: '#dcfce7', text: '#16a34a' },
      'contacted': { bg: '#dbeafe', text: '#2563eb' }, 
      'proposal': { bg: '#fef3c7', text: '#d97706' },
      'new': { bg: '#f3f4f6', text: '#6b7280' }
    };
    return colors[status] || { bg: '#f3f4f6', text: '#6b7280' };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': { bg: '#fee2e2', text: '#dc2626' },
      'medium': { bg: '#fef3c7', text: '#d97706' },
      'low': { bg: '#f0f9ff', text: '#0284c7' }
    };
    return colors[priority] || { bg: '#f3f4f6', text: '#6b7280' };
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <Users size={32} color={darkMode ? '#60a5fa' : '#3b82f6'} />
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: darkMode ? 'white' : '#111827',
              margin: 0
            }}>
              All Leads
            </h1>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <p style={{
                fontSize: '18px',
                color: darkMode ? '#d1d5db' : '#6b7280',
                margin: 0
              }}>
                {currentUser && ['admin', 'super-admin'].includes(currentUser.role) 
                  ? 'Select a lead to assign to team members' 
                  : 'All leads in the system'}
              </p>
              
              {/* Bulk Upload Button */}
              <button
                onClick={() => setShowBulkUpload(true)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <Upload size={16} />
                Bulk Upload
              </button>
            </div>
            
            {/* Search Bar */}
            <div style={{ position: 'relative', width: '300px' }}>
              <input
                type="text"
                placeholder="Search leads..."
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
          </div>
          
          {/* Assign Dropdown - Only for admin/super-admin */}
          {showAssignDropdown && selectedLeadId && currentUser && ['admin', 'super-admin'].includes(currentUser.role) && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
              borderRadius: '12px',
              border: `2px solid ${darkMode ? '#60a5fa' : '#3b82f6'}`
            }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: darkMode ? '#d1d5db' : '#374151',
                marginBottom: '0.5rem'
              }}>
                Assign Lead #{selectedLeadId} to:
              </p>
              <select 
                onChange={assignLeadHandler}
                style={{
                  width: '200px',
                  padding: '0.5rem',
                  border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: darkMode ? '#1f2937' : 'white',
                  color: darkMode ? 'white' : '#374151'
                }}
              >
                <option value="">Select team member</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          )}
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
              {searchTerm ? 'Found Leads' : 'Total Leads'}
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
              {filteredLeads.filter(l => l.assignedTo).length}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Assigned</div>
          </div>
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
              {filteredLeads.filter(l => !l.assignedTo).length}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Unassigned</div>
          </div>
        </div>

        {/* Leads List */}
        <div style={{
          backgroundColor: darkMode ? '#374151' : 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {loading ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Loading leads...</h3>
            </div>
          ) : (
            filteredLeads.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No leads found</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {searchTerm ? `No results for "${searchTerm}"` : 'No leads available'}
              </p>
            </div>
          ) : filteredLeads.map((lead, index) => {
            const leadId = lead._id || lead.id;
            return (
            <div 
              key={leadId}
              onClick={() => currentUser && ['admin', 'super-admin'].includes(currentUser.role) ? handleLeadSelect(leadId) : null}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                borderBottom: index < filteredLeads.length - 1 ? `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}` : 'none',
                cursor: currentUser && ['admin', 'super-admin'].includes(currentUser.role) ? 'pointer' : 'default',
                transition: 'all 0.2s',
                backgroundColor: selectedLeadId === leadId 
                  ? (darkMode ? '#4b5563' : '#f0f9ff') 
                  : 'transparent',
                borderLeft: selectedLeadId === leadId 
                  ? `4px solid ${darkMode ? '#60a5fa' : '#3b82f6'}` 
                  : '4px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedLeadId !== leadId) {
                  e.currentTarget.style.backgroundColor = darkMode ? '#4b556320' : '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedLeadId !== leadId) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
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
                    backgroundColor: getStatusColor(lead.status).bg,
                    color: getStatusColor(lead.status).text
                  }}>
                    {lead.status.toUpperCase()}
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: getPriorityColor(lead.priority).bg,
                    color: getPriorityColor(lead.priority).text
                  }}>
                    {lead.priority.toUpperCase()}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`mailto:${lead.email}`, '_blank');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '4px',
                        color: darkMode ? '#60a5fa' : '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={`Send email to ${lead.email}`}
                    >
                      <Mail size={14} />
                      <span>{lead.email}</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${lead.phone}`, '_self');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '4px',
                        color: darkMode ? '#34d399' : '#22c55e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={`Call ${lead.phone}`}
                    >
                      <Phone size={14} />
                      <span>{lead.phone}</span>
                    </button>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '13px',
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  <span>Source: {lead.leadSource || lead.source}</span>
                  <span>Value: ₹{lead.estimatedValue ? Number(lead.estimatedValue).toLocaleString() : (lead.value || '0')}</span>
                  <span>Created: {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                  {lead.createdBy && (
                    <span>By: {typeof lead.createdBy === 'object' ? lead.createdBy.name : lead.createdBy}</span>
                  )}
                  {lead.notes && lead.notes.length > 0 && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      background: darkMode ? '#3b82f620' : '#dbeafe',
                      color: darkMode ? '#60a5fa' : '#3b82f6',
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}>
                      <FileText size={12} />
                      {lead.notes.length} {lead.notes.length === 1 ? 'note' : 'notes'}
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

              {/* Assignment Status & Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '16px'
              }}>
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
                {lead.assignedTo ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#22c55e',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <User size={16} />
                    <span>{typeof lead.assignedTo === 'object' ? lead.assignedTo.name : lead.assignedTo}</span>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: '14px'
                  }}>
                    <Clock size={16} />
                    <span>Unassigned</span>
                  </div>
                )}
                
                {/* Delete Button - Only show if user is admin/super-admin OR owner of the lead */}
                {currentUser && (
                  (['admin', 'super-admin'].includes(currentUser.role) || 
                   (lead.createdBy && (lead.createdBy._id || lead.createdBy) === currentUser.id))
                ) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLead(leadId, lead.contactPerson || lead.name);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      color: '#ef4444',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#7f1d1d20' : '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Delete Lead"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                {selectedLeadId === leadId && (
                  <CheckCircle size={20} color="#3b82f6" />
                )}
              </div>
            </div>
          );
        }))}
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
                  
                  {/* Notes History */}
                  {selectedLead.notes && selectedLead.notes.length > 0 && (
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151', display: 'block', marginBottom: '0.5rem' }}>
                        Activity Notes ({selectedLead.notes.length})
                      </label>
                      <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        padding: '0.5rem'
                      }}>
                        {selectedLead.notes.slice().reverse().map((note, index) => (
                          <div key={index} style={{
                            padding: '0.75rem',
                            marginBottom: '0.5rem',
                            background: darkMode ? '#4b5563' : '#f9fafb',
                            borderRadius: '6px',
                            borderLeft: '3px solid #3b82f6'
                          }}>
                            <div style={{
                              fontSize: '0.75rem',
                              color: darkMode ? '#9ca3af' : '#6b7280',
                              marginBottom: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span style={{ fontWeight: '600' }}>{note.createdBy?.name || 'User'}</span>
                              <span>•</span>
                              <span>{new Date(note.createdAt).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{
                              fontSize: '0.875rem',
                              color: darkMode ? '#d1d5db' : '#374151',
                              lineHeight: '1.5'
                            }}>
                              {note.content}
                            </div>
                          </div>
                        ))}
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
        
        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <BulkUpload
            darkMode={darkMode}
            onClose={() => setShowBulkUpload(false)}
            onUploadComplete={() => {
              setShowBulkUpload(false);
              // Refresh leads after upload
              const fetchLeads = async () => {
                try {
                  const leadsResponse = await apiService.getLeads();
                  const leadsData = leadsResponse.leads || leadsResponse || [];
                  setLeads(Array.isArray(leadsData) ? leadsData : []);
                } catch (error) {
                  console.error('Error refreshing leads:', error);
                }
              };
              fetchLeads();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AllLeads;