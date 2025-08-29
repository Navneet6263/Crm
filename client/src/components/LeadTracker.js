import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Target, Mail, Phone, Edit, Eye, CheckCircle, DollarSign, Clock, Activity, Search, Filter, Square, CheckSquare, Trash2, MoreHorizontal, FileSpreadsheet } from 'lucide-react';
import apiService from '../services/apiService';

import { exportLeadsToExcel } from '../utils/excelExport';

const LeadTracker = ({ crmData, updateCrmData, user, darkMode }) => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    notes: '',
    nextAction: ''
  });

  
  // New states for enhanced features
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list' for mobile
  const [wsConnection, setWsConnection] = useState(null);

  const leads = Array.isArray(crmData.leads) ? crmData.leads : (crmData.leads?.leads || []);
  const myLeads = leads; // Show all leads for now

  // Fuzzy match helper function
  const fuzzyMatch = useCallback((text, pattern) => {
    let patternIdx = 0;
    let textIdx = 0;
    
    while (textIdx < text.length && patternIdx < pattern.length) {
      if (text[textIdx] === pattern[patternIdx]) {
        patternIdx++;
      }
      textIdx++;
    }
    
    return patternIdx === pattern.length;
  }, []);

  // Enhanced filtered and searched leads with fuzzy matching
  const filteredLeads = useMemo(() => {
    const leadsArray = Array.isArray(myLeads) ? myLeads : [];
    let filtered = leadsArray;
    
    // Enhanced search filter with fuzzy matching
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => {
        // Exact matches
        const exactMatch = 
          lead.companyName?.toLowerCase().includes(term) ||
          lead.contactPerson?.toLowerCase().includes(term) ||
          lead.email?.toLowerCase().includes(term) ||
          lead.phone?.includes(searchTerm) ||
          lead.notes?.toLowerCase().includes(term);
        
        if (exactMatch) return true;
        
        // Fuzzy match for company name and contact person
        const fuzzyMatchCompany = lead.companyName && fuzzyMatch(lead.companyName.toLowerCase(), term);
        const fuzzyMatchContact = lead.contactPerson && fuzzyMatch(lead.contactPerson.toLowerCase(), term);
        
        return fuzzyMatchCompany || fuzzyMatchContact;
      });
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    
    return filtered;
  }, [myLeads, searchTerm, statusFilter, fuzzyMatch]);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced WebSocket for real-time updates with reconnection
  useEffect(() => {
    let ws;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectInterval = 3000;
    
    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:8080');
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          setWsConnection(ws);
          reconnectAttempts = 0;
          
          // Send user identification
          ws.send(JSON.stringify({
            type: 'USER_CONNECT',
            userId: user.id,
            userName: user.name,
            role: user.role
          }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            switch (data.type) {
              case 'LEAD_UPDATE':
                // Update specific lead in real-time
                if (data.leadData) {
                  const updatedLeads = crmData.leads.map(lead => 
                    (lead._id || lead.id) === data.leadId ? { ...lead, ...data.leadData } : lead
                  );
                  updateCrmData({ ...crmData, leads: updatedLeads });
                }
                break;
                
              case 'LEAD_CREATE':
                // Add new lead in real-time
                if (data.leadData) {
                  updateCrmData({ 
                    ...crmData, 
                    leads: [...crmData.leads, data.leadData] 
                  });
                }
                break;
                
              case 'LEAD_DELETE':
                // Remove lead in real-time
                const filteredLeads = crmData.leads.filter(lead => 
                  (lead._id || lead.id) !== data.leadId
                );
                updateCrmData({ ...crmData, leads: filteredLeads });
                break;
                
              case 'BULK_UPDATE':
                // Handle bulk updates
                apiService.getAllLeads().then(allLeads => {
                  updateCrmData({ ...crmData, leads: allLeads });
                }).catch(console.error);
                break;
                
              case 'NOTIFICATION':
                // Show real-time notifications
                if (data.message) {
                  // You can integrate with a toast notification system here
                  console.log('Notification:', data.message);
                }
                break;
              default:
                break;
            }
          } catch (error) {
            console.error('WebSocket message error:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setWsConnection(null);
          
          // Attempt reconnection
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
            setTimeout(connect, reconnectInterval);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          setTimeout(connect, reconnectInterval);
        }
      }
    };
    
    connect();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [user, updateCrmData, crmData]);

  const handleUpdateLead = (lead) => {
    setSelectedLead(lead);
    setUpdateData({
      status: lead.status || 'new',
      notes: lead.notes || '',
      nextAction: ''
    });

    setShowUpdateModal(true);
  };



  const saveUpdate = async () => {
    try {
      const updatedLead = {
        ...selectedLead,
        status: updateData.status,
        lastActivity: new Date().toISOString(),
        notes: updateData.notes
      };

      // Update via API
      await apiService.updateLead(selectedLead._id, updatedLead);
      
      // Send real-time update
      if (wsConnection) {
        wsConnection.send(JSON.stringify({
          type: 'LEAD_UPDATE',
          leadId: selectedLead._id,
          data: updatedLead
        }));
      }
      
      // Refresh leads data
      const allLeads = await apiService.getAllLeads();
      updateCrmData({ leads: allLeads });
      
      setShowUpdateModal(false);
      setSelectedLead(null);
      alert('Lead updated successfully!');
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Error updating lead. Please try again.');
    }
  };

  // Optimized bulk operations with useCallback
  const handleSelectLead = useCallback((leadId) => {
    console.log('Selecting lead:', leadId);
    console.log('Current selected leads:', selectedLeads);
    setSelectedLeads(prev => {
      const newSelection = prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId];
      console.log('New selection:', newSelection);
      return newSelection;
    });
  }, [selectedLeads]);

  const handleSelectAll = useCallback(() => {
    const allLeadIds = filteredLeads.map(lead => lead._id || lead.id);
    console.log('All lead IDs:', allLeadIds);
    setSelectedLeads(
      selectedLeads.length === filteredLeads.length 
        ? [] 
        : allLeadIds
    );
  }, [selectedLeads.length, filteredLeads]);

  const handleBulkUpdate = useCallback(async () => {
    if (!bulkStatus || selectedLeads.length === 0) return;
    
    try {
      // Use bulk API if available, otherwise fallback to individual updates
      if (apiService.bulkUpdateLeads) {
        await apiService.bulkUpdateLeads(selectedLeads, { status: bulkStatus });
      } else {
        await Promise.all(
          selectedLeads.map(leadId => 
            apiService.updateLead(leadId, { status: bulkStatus })
          )
        );
      }
      
      // Send WebSocket notification for bulk update
      if (wsConnection) {
        wsConnection.send(JSON.stringify({
          type: 'BULK_UPDATE',
          leadIds: selectedLeads,
          updateData: { status: bulkStatus },
          count: selectedLeads.length
        }));
      }
      
      const allLeads = await apiService.getAllLeads();
      updateCrmData({ leads: allLeads });
      
      setSelectedLeads([]);
      setShowBulkActions(false);
      setBulkStatus('');
      alert(`${selectedLeads.length} leads updated successfully!`);
    } catch (error) {
      console.error('Bulk update error:', error);
      alert('Error updating leads. Please try again.');
    }
  }, [bulkStatus, selectedLeads, wsConnection, updateCrmData]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedLeads.length === 0) return;
    
    if (window.confirm(`Delete ${selectedLeads.length} leads? This cannot be undone.`)) {
      try {
        // Use bulk API if available, otherwise fallback to individual deletes
        if (apiService.bulkDeleteLeads) {
          await apiService.bulkDeleteLeads(selectedLeads);
        } else {
          await Promise.all(
            selectedLeads.map(leadId => apiService.deleteLead(leadId))
          );
        }
        
        // Send WebSocket notification for bulk delete
        if (wsConnection) {
          wsConnection.send(JSON.stringify({
            type: 'BULK_DELETE',
            leadIds: selectedLeads,
            count: selectedLeads.length
          }));
        }
        
        const allLeads = await apiService.getAllLeads();
        updateCrmData({ leads: allLeads });
        
        setSelectedLeads([]);
        alert(`${selectedLeads.length} leads deleted successfully!`);
      } catch (error) {
        console.error('Bulk delete error:', error);
        alert('Error deleting leads. Please try again.');
      }
    }
  }, [selectedLeads, wsConnection, updateCrmData]);

  // Enhanced Export to Excel
  const handleExportToExcel = useCallback(() => {
    try {
      const result = exportLeadsToExcel(filteredLeads, {
        includeTimestamp: true
      });
      
      if (result.success) {
        // Show success notification
        const message = `Successfully exported ${result.recordCount} leads to ${result.filename}`;
        
        // You can replace this with a toast notification
        if (window.confirm(`${message}\n\nWould you like to export with additional filters?`)) {
          // Future: Open advanced export modal
          console.log('Advanced export requested');
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  }, [filteredLeads]);

  const getStatusColor = (status) => {
    const colors = {
      'new': { bg: darkMode ? '#1e3a8a' : '#dbeafe', text: darkMode ? '#60a5fa' : '#1d4ed8', border: '#3b82f6' },
      'contacted': { bg: darkMode ? '#7c2d12' : '#fed7aa', text: darkMode ? '#fb923c' : '#ea580c', border: '#f97316' },
      'qualified': { bg: darkMode ? '#065f46' : '#dcfce7', text: darkMode ? '#34d399' : '#059669', border: '#10b981' },
      'converted': { bg: darkMode ? '#14532d' : '#bbf7d0', text: darkMode ? '#4ade80' : '#16a34a', border: '#22c55e' },
      'lost': { bg: darkMode ? '#7f1d1d' : '#fee2e2', text: darkMode ? '#f87171' : '#dc2626', border: '#ef4444' },
      'proposal': { bg: darkMode ? '#581c87' : '#f3e8ff', text: darkMode ? '#c084fc' : '#9333ea', border: '#a855f7' },
      'negotiation': { bg: darkMode ? '#78350f' : '#fef3c7', text: darkMode ? '#fbbf24' : '#d97706', border: '#f59e0b' }
    };
    return colors[status] || colors['new'];
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
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    transition: 'all 0.3s ease'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '1rem', 
          marginBottom: '1rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Target style={{ color: '#3b82f6' }} size={isMobile ? 24 : 32} />
            <div>
              <h1 style={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Lead Tracker
              </h1>
              <p style={{ 
                color: darkMode ? '#9ca3af' : '#6b7280', 
                fontSize: isMobile ? '0.875rem' : '1.125rem',
                margin: '0.25rem 0 0 0'
              }}>
                Track and update lead status and activities
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportToExcel}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: '#10b981',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.target.style.background = '#059669';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.target.style.background = '#10b981';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
              title={`Export ${filteredLeads.length} leads to Excel`}
            >
              <FileSpreadsheet size={16} />
              {!isMobile && `Export (${filteredLeads.length})`}
            </button>
            
            {selectedLeads.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#f59e0b',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                <MoreHorizontal size={16} />
                {!isMobile && `Bulk (${selectedLeads.length})`}
              </button>
            )}
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }} 
            />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#1f2937',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ position: 'relative', minWidth: isMobile ? '100%' : '200px' }}>
            <Filter 
              size={20} 
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }} 
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
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
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
        
        {/* Bulk Actions Panel */}
        {showBulkActions && selectedLeads.length > 0 && (
          <div style={{
            ...cardStyle,
            padding: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ 
              color: darkMode ? '#d1d5db' : '#374151',
              fontWeight: '500'
            }}>
              {selectedLeads.length} leads selected
            </span>
            
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              style={{
                padding: '0.5rem',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '6px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#1f2937',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Select Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
            
            <button
              onClick={handleBulkUpdate}
              disabled={!bulkStatus}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: bulkStatus ? '#3b82f6' : '#9ca3af',
                color: 'white',
                cursor: bulkStatus ? 'pointer' : 'not-allowed',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Update Status
            </button>
            
            <button
              onClick={handleBulkDelete}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: '#ef4444',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
        
        {/* Select All Checkbox */}
        {filteredLeads.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <button
              onClick={handleSelectAll}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: darkMode ? '#d1d5db' : '#374151',
                fontSize: '0.875rem'
              }}
            >
              {selectedLeads.length === filteredLeads.length ? 
                <CheckSquare size={16} /> : 
                <Square size={16} />
              }
              Select All ({filteredLeads.length})
            </button>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: isMobile ? '1rem' : '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Total Leads', value: filteredLeads.length, icon: Target, color: '#3b82f6' },
          { label: 'Active', value: filteredLeads.filter(l => ['new', 'contacted', 'qualified'].includes(l.status)).length, icon: Activity, color: '#10b981' },
          { label: 'Converted', value: filteredLeads.filter(l => l.status === 'converted').length, icon: CheckCircle, color: '#22c55e' },
          { label: 'Pipeline Value', value: `₹${(filteredLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0) / 100000).toFixed(1)}L`, icon: DollarSign, color: '#f59e0b' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} style={{ ...cardStyle, padding: isMobile ? '1rem' : '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    {stat.label}
                  </p>
                  <p style={{
                    fontSize: isMobile ? '1.25rem' : '1.5rem',
                    fontWeight: '700',
                    color: darkMode ? 'white' : '#1f2937'
                  }}>
                    {stat.value}
                  </p>
                </div>
                <Icon style={{ color: stat.color }} size={isMobile ? 20 : 28} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile View Toggle */}
      {isMobile && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: 'none',
              background: viewMode === 'grid' ? '#3b82f6' : (darkMode ? '#374151' : '#f3f4f6'),
              color: viewMode === 'grid' ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: 'none',
              background: viewMode === 'list' ? '#3b82f6' : (darkMode ? '#374151' : '#f3f4f6'),
              color: viewMode === 'list' ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            List
          </button>
        </div>
      )}

      {/* Leads Grid/List - Enhanced Mobile Layout */}
      <div style={{
        display: isMobile && viewMode === 'list' ? 'flex' : 'grid',
        flexDirection: isMobile && viewMode === 'list' ? 'column' : undefined,
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: isMobile ? '0.75rem' : '1.5rem'
      }} className={isMobile ? 'mobile-grid-1' : ''}>
        {filteredLeads.map(lead => {
          const leadId = lead._id || lead.id;
          const statusColor = getStatusColor(lead.status);
          return (
            <div
              key={leadId}
              style={{
                ...cardStyle,
                padding: isMobile ? (viewMode === 'list' ? '0.75rem' : '1rem') : '1.5rem',
                position: 'relative',
                border: selectedLeads.includes(leadId) 
                  ? '2px solid #3b82f6' 
                  : `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                minHeight: isMobile ? (viewMode === 'list' ? '80px' : 'auto') : '280px',
                display: isMobile && viewMode === 'list' ? 'flex' : 'block',
                alignItems: isMobile && viewMode === 'list' ? 'center' : undefined,
                gap: isMobile && viewMode === 'list' ? '1rem' : undefined
              }}
              className={isMobile ? 'mobile-card mobile-p-2' : ''}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {/* Selection Checkbox */}
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                left: '0.5rem',
                zIndex: 10
              }}>
                <button
                  onClick={() => handleSelectLead(leadId)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: selectedLeads.includes(leadId) ? '#3b82f6' : darkMode ? '#9ca3af' : '#6b7280'
                  }}
                >
                  {selectedLeads.includes(leadId) ? 
                    <CheckSquare size={16} /> : 
                    <Square size={16} />
                  }
                </button>
              </div>
              
              {/* Lead Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                marginTop: '1rem'
              }}>
                <div>
                  <h3 style={{
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {lead.companyName}
                  </h3>
                  <p style={{
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    margin: 0
                  }}>
                    {lead.contactPerson}
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

              {/* Lead Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '0.5rem' : '1rem',
                marginBottom: '1rem'
              }} className={isMobile ? 'mobile-grid-1 mobile-gap-1' : ''}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                  <span style={{
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    color: darkMode ? '#d1d5db' : '#374151',
                    wordBreak: 'break-all'
                  }} className={isMobile ? 'mobile-text-xs mobile-text-ellipsis' : ''}>
                    {lead.email}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                  <span style={{
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}>
                    {lead.phone}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={16} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                  <span style={{
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    color: darkMode ? '#d1d5db' : '#374151',
                    fontWeight: '600'
                  }}>
                    ₹{lead.estimatedValue ? Number(lead.estimatedValue).toLocaleString() : '0'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                  <span style={{
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}>
                    {new Date(lead.createdDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}>
                    Progress
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted'].indexOf(lead.status) + 1}/6
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: darkMode ? '#374151' : '#e5e7eb',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(((['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted'].indexOf(lead.status) + 1) / 6) * 100)}%`,
                    height: '100%',
                    background: statusColor.border,
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: isMobile ? '0.25rem' : '0.5rem',
                justifyContent: 'flex-end',
                flexWrap: 'wrap'
              }}>
                {!isMobile && (
                  <>
                    <button
                      style={{
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: darkMode ? '#374151' : '#f3f4f6',
                        color: darkMode ? '#d1d5db' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      title="Send Email"
                    >
                      <Mail size={16} />
                    </button>
                    <button
                      style={{
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: darkMode ? '#374151' : '#f3f4f6',
                        color: darkMode ? '#d1d5db' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      title="Make Call"
                    >
                      <Phone size={16} />
                    </button>
                    <button
                      style={{
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: darkMode ? '#374151' : '#f3f4f6',
                        color: darkMode ? '#d1d5db' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleUpdateLead(lead)}
                  style={{
                    padding: isMobile ? '0.5rem' : '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    fontWeight: '500'
                  }}
                  title="Update Status"
                >
                  <Edit size={14} />
                  {!isMobile && 'Update'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLeads.length === 0 && myLeads.length > 0 && (
        <div style={{
          ...cardStyle,
          padding: '3rem',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <Search size={48} style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem' }} />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            No leads found
          </h3>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {myLeads.length === 0 && (
        <div style={{
          ...cardStyle,
          padding: '3rem',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <Target size={48} style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem' }} />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            No leads assigned
          </h3>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            Contact your manager to get leads assigned
          </p>
        </div>
      )}

      {showUpdateModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: darkMode ? '#1f2937' : 'white',
            borderRadius: '16px',
            width: isMobile ? '95%' : '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
            maxHeight: isMobile ? '90vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible'
          }}>
            <div style={{
              padding: isMobile ? '1rem' : '1.5rem',
              borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: isMobile ? '1.125rem' : '1.25rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Update Lead: {selectedLead?.companyName}
              </h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Lead Status
                </label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
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
                  value={updateData.notes}
                  onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                  placeholder="Add notes about this update..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Next Action
                </label>
                <input
                  type="text"
                  value={updateData.nextAction}
                  onChange={(e) => setUpdateData({...updateData, nextAction: e.target.value})}
                  placeholder="What's the next step?"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>



              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: 'transparent',
                    color: darkMode ? '#d1d5db' : '#374151',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveUpdate}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  <CheckCircle size={16} />
                  Update Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadTracker;