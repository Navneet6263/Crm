import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Target, Mail, Phone, Edit, Eye, CheckCircle, DollarSign, Clock, Activity, Search, Filter, Square, CheckSquare, Trash2, MoreHorizontal, FileSpreadsheet, Calendar, TrendingUp, Building, User } from 'lucide-react';
import apiService from '../services/apiService';

import { exportLeadsToExcel } from '../utils/excelExport';

const LeadTracker = ({ crmData, updateCrmData, user, darkMode }) => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [originalStatus, setOriginalStatus] = useState('');
  const [updateData, setUpdateData] = useState({
    status: '',
    notes: '',
    nextAction: ''
  });

  
  // New states for enhanced features
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list' for mobile
  const [wsConnection, setWsConnection] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

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
          (lead.notes && typeof lead.notes === 'string' ? lead.notes.toLowerCase().includes(term) : false);
        
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
    
    // Product filter
    if (productFilter !== 'all') {
      filtered = filtered.filter(lead => {
        const leadProductId = lead.product?._id || lead.product;
        return leadProductId === productFilter;
      });
    }
    
    return filtered;
  }, [myLeads, searchTerm, statusFilter, productFilter, fuzzyMatch]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
        const response = await fetch(`${apiUrl}/products`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          const productsList = Array.isArray(data) ? data : (data.products || data || []);
          setProducts(productsList);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    fetchProducts();
    setWsConnection(null);
  }, []);

  const handleUpdateLead = (lead) => {
    setSelectedLead(lead);
    setOriginalStatus(lead.status || 'new');
    setUpdateData({
      status: lead.status || 'new',
      notes: typeof lead.notes === 'string' ? lead.notes : '',
      nextAction: ''
    });

    setShowUpdateModal(true);
  };



  const saveUpdate = async () => {
    try {
      // Check if status changed and note is required
      if (updateData.status !== originalStatus) {
        if (!(updateData.notes || '').trim()) {
          alert('❌ Status changed! Please add notes explaining the reason.');
          return;
        }
      }
      
      const updatedLead = {
        status: updateData.status,
        notes: updateData.notes,
        lastActivity: new Date().toISOString()
      };

      console.log('Saving lead update:', selectedLead._id, updatedLead);
      
      // Update via API
      await apiService.updateLead(selectedLead._id, updatedLead);
      
      // Refresh leads data
      const allLeads = await apiService.getAllLeads();
      updateCrmData({ leads: allLeads });
      
      setShowUpdateModal(false);
      setSelectedLead(null);
      alert('Lead updated successfully!');
    } catch (error) {
      console.error('Error updating lead:', error);
      alert(`Error updating lead: ${error.message}`);
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
      if (filteredLeads.length === 0) {
        alert('No leads to export. Please check your filters.');
        return;
      }

      const result = exportLeadsToExcel(filteredLeads, {
        includeTimestamp: true
      });
      
      if (result.success) {
        // Show success notification
        const message = `Successfully exported ${result.recordCount} leads to ${result.filename}`;
        alert(message);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}. Please try again.`);
    }
  }, [filteredLeads]);

  const getStatusColor = (status) => {
    const colors = {
      'new': { bg: darkMode ? '#1e3a8a' : '#dbeafe', text: darkMode ? '#60a5fa' : '#1d4ed8', border: '#3b82f6' },
      'contacted': { bg: darkMode ? '#7c2d12' : '#fed7aa', text: darkMode ? '#fb923c' : '#ea580c', border: '#f97316' },
      'qualified': { bg: darkMode ? '#065f46' : '#dcfce7', text: darkMode ? '#34d399' : '#059669', border: '#10b981' },
      'converted': { bg: darkMode ? '#14532d' : '#bbf7d0', text: darkMode ? '#4ade80' : '#16a34a', border: '#22c55e' },
      'closed-won': { bg: darkMode ? '#14532d' : '#bbf7d0', text: darkMode ? '#4ade80' : '#16a34a', border: '#22c55e' },
      'closed-lost': { bg: darkMode ? '#7f1d1d' : '#fee2e2', text: darkMode ? '#f87171' : '#dc2626', border: '#ef4444' },
      'lost': { bg: darkMode ? '#7f1d1d' : '#fee2e2', text: darkMode ? '#f87171' : '#dc2626', border: '#ef4444' },
      'proposal': { bg: darkMode ? '#581c87' : '#f3e8ff', text: darkMode ? '#c084fc' : '#9333ea', border: '#a855f7' },
      'negotiation': { bg: darkMode ? '#78350f' : '#fef3c7', text: darkMode ? '#fbbf24' : '#d97706', border: '#f59e0b' }
    };
    return colors[status] || colors['new'];
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
  };

  const cardStyle = {
    backgroundColor: darkMode ? '#374151' : 'white',
    borderRadius: '16px',
    boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          ...cardStyle,
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Target size={32} color={darkMode ? '#60a5fa' : '#3b82f6'} />
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: darkMode ? 'white' : '#111827',
                  margin: 0
                }}>
                  Lead Tracker
                </h1>
                <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
                  Track and manage your leads with advanced features
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
              <button
                onClick={handleExportToExcel}
                disabled={filteredLeads.length === 0}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: filteredLeads.length === 0 ? '#9ca3af' : '#10b981',
                  color: 'white',
                  cursor: filteredLeads.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  opacity: filteredLeads.length === 0 ? 0.6 : 1
                }}
                title={filteredLeads.length === 0 ? 'No leads to export' : `Export ${filteredLeads.length} leads to Excel`}
              >
                <FileSpreadsheet size={16} />
                Export ({filteredLeads.length})
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
                  Bulk ({selectedLeads.length})
                </button>
              )}
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

            {/* Product Filter */}
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              style={{
                padding: '0.75rem',
                border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#1f2937',
                fontSize: '1rem',
                outline: 'none',
                minWidth: '180px',
                marginRight: '0.5rem'
              }}
            >
              <option value="all">All Products ({leads.length})</option>
              {products.map(product => {
                const count = leads.filter(l => {
                  const leadProductId = l.product?._id || l.product;
                  return leadProductId === product._id;
                }).length;
                return (
                  <option key={product._id} value={product._id}>
                    {product.icon} {product.name} ({count})
                  </option>
                );
              })}
            </select>
            
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
              <option value="negotiation">Negotiation</option>
              <option value="converted">Converted</option>
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
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
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
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
              value: filteredLeads.length,
              icon: Target, 
              color: '#3b82f6' 
            },
            { 
              label: 'High Priority', 
              value: filteredLeads.filter(l => l.priority === 'high' || l.priority === 'urgent').length,
              icon: TrendingUp, 
              color: '#ef4444' 
            },
            { 
              label: 'Active Opportunities', 
              value: filteredLeads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length,
              icon: Activity, 
              color: '#22c55e' 
            },
            { 
              label: 'Pipeline Value', 
              value: `₹${((filteredLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)) / 100000).toFixed(1)}L`,
              icon: DollarSign, 
              color: '#f59e0b' 
            },
            { 
              label: 'This Week', 
              value: filteredLeads.filter(l => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(l.createdDate || l.createdAt) > weekAgo;
              }).length,
              icon: Calendar, 
              color: '#8b5cf6' 
            },
            { 
              label: 'Converted', 
              value: filteredLeads.filter(l => l.status === 'converted' || l.status === 'closed-won').length,
              icon: CheckCircle, 
              color: '#10b981' 
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} style={{
                ...cardStyle,
                padding: '1.5rem'
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
            paginatedLeads.map((lead, index) => {
              const leadId = lead._id || lead.id;
              const statusColor = getStatusColor(lead.status);
              
              if (viewMode === 'grid') {
                return (
                  <div 
                    key={leadId}
                    style={{
                      ...cardStyle,
                      padding: '24px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      border: selectedLeads.includes(leadId) 
                        ? '2px solid #3b82f6' 
                        : (darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb')
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
                      background: lead.priority === 'high' || lead.priority === 'urgent' ? '#ef4444' : '#22c55e'
                    }} />
                    {/* Selection Checkbox */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
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
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
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
                          backgroundColor: lead.priority === 'high' || lead.priority === 'urgent' ? '#fee2e2' : '#f3f4f6',
                          color: lead.priority === 'high' || lead.priority === 'urgent' ? '#dc2626' : '#6b7280',
                          border: `1px solid ${lead.priority === 'high' || lead.priority === 'urgent' ? '#ef4444' : '#9ca3af'}`
                        }}>
                          {lead.priority?.toUpperCase() || 'MEDIUM'}
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

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const leadDetails = `Company: ${lead.companyName}\nContact: ${lead.contactPerson}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nStatus: ${lead.status}\nEstimated Value: ₹${lead.estimatedValue ? Number(lead.estimatedValue).toLocaleString() : '0'}\nCreated: ${lead.createdDate ? new Date(lead.createdDate).toLocaleDateString() : 'N/A'}\nNotes: ${lead.notes || 'No notes available'}`;
                            alert(leadDetails);
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
                            handleUpdateLead(lead);
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
                          handleUpdateLead(lead);
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
                        <option value="converted">Converted</option>
                        <option value="closed-won">Closed Won</option>
                        <option value="closed-lost">Closed Lost</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                  </div>
                );
              } else {
                // List View - Similar to MyLeads
                return (
                  <div 
                    key={leadId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '20px',
                      borderBottom: index < paginatedLeads.length - 1 ? `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}` : 'none',
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
                          backgroundColor: statusColor.bg,
                          color: statusColor.text
                        }}>
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
                        <span>Created: {new Date(lead.createdDate || lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ 
                      marginLeft: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const leadDetails = `Company: ${lead.companyName}\nContact: ${lead.contactPerson}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nStatus: ${lead.status}\nEstimated Value: ₹${lead.estimatedValue ? Number(lead.estimatedValue).toLocaleString() : '0'}\nCreated: ${lead.createdDate ? new Date(lead.createdDate).toLocaleDateString() : 'N/A'}\nNotes: ${lead.notes || 'No notes available'}`;
                          alert(leadDetails);
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
                      >
                        <Eye size={14} />
                        View
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateLead(lead);
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
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      
                      <select
                        value={lead.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleUpdateLead(lead);
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
                        <option value="converted">Converted</option>
                        <option value="closed-won">Closed Won</option>
                        <option value="closed-lost">Closed Lost</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                  </div>
                );
              }
            })
          )}
        </div>

        {/* Pagination */}
        {filteredLeads.length > 0 && totalPages > 1 && (
          <div style={{
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: currentPage === 1 ? (darkMode ? '#4b5563' : '#e5e7eb') : '#3b82f6',
                color: currentPage === 1 ? (darkMode ? '#9ca3af' : '#6b7280') : 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: currentPage === pageNum ? '#3b82f6' : (darkMode ? '#374151' : 'white'),
                      color: currentPage === pageNum ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: currentPage === pageNum ? '600' : '400',
                      minWidth: '40px'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                return <span key={pageNum} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: currentPage === totalPages ? (darkMode ? '#4b5563' : '#e5e7eb') : '#3b82f6',
                color: currentPage === totalPages ? (darkMode ? '#9ca3af' : '#6b7280') : 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Next
            </button>
            
            <span style={{
              marginLeft: '1rem',
              color: darkMode ? '#d1d5db' : '#6b7280',
              fontSize: '14px'
            }}>
              Page {currentPage} of {totalPages} ({filteredLeads.length} leads)
            </span>
          </div>
        )}

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
                  <option value="closed-won">Closed Won</option>
                  <option value="closed-lost">Closed Lost</option>
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
                  Notes {updateData.status !== originalStatus && <span style={{ color: '#ef4444' }}>* (Required)</span>}
                </label>
                <textarea
                  value={updateData.notes}
                  onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                  placeholder="Add notes about this update..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${updateData.status !== originalStatus && !(updateData.notes || '').trim() ? '#ef4444' : (darkMode ? '#374151' : '#e5e7eb')}`,
                    borderRadius: '8px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
                {updateData.status !== originalStatus && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: (updateData.notes || '').trim().split(/\s+/).length >= 10 ? '#22c55e' : '#ef4444',
                    marginTop: '0.25rem'
                  }}>
                    {(updateData.notes || '').trim() ? `${(updateData.notes || '').trim().split(/\s+/).length} words` : 'Status changed - notes are required'}
                  </div>
                )}
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
                  disabled={updateData.status !== originalStatus && !(updateData.notes || '').trim()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: (updateData.status !== originalStatus && !(updateData.notes || '').trim()) ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    cursor: (updateData.status !== originalStatus && !(updateData.notes || '').trim()) ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: isMobile ? '100%' : 'auto',
                    opacity: (updateData.status !== originalStatus && !(updateData.notes || '').trim()) ? 0.6 : 1
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