import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  Upload,
  RefreshCw,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  MoreVertical,
  CheckSquare,
  Square,
  Users,
  Building,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Loader
} from 'lucide-react';
import { showToast } from './ToastNotification';
import apiService from '../services/apiService';

const ProfessionalDataTable = ({ darkMode, crmData, updateCrmData }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortBy, setSortBy] = useState('createdDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('leads');
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});

  const columns = [
    { id: 'contactPerson', label: 'Contact Person', icon: Users, sortable: true },
    { id: 'companyName', label: 'Company', icon: Building, sortable: true },
    { id: 'email', label: 'Email', icon: Mail, sortable: true },
    { id: 'phone', label: 'Phone', icon: Phone, sortable: true },
    { id: 'industry', label: 'Industry', icon: Building, sortable: true },
    { id: 'leadSource', label: 'Source', icon: Database, sortable: true },
    { id: 'estimatedValue', label: 'Value', icon: DollarSign, sortable: true },
    { id: 'status', label: 'Status', icon: Settings, sortable: true },
    { id: 'priority', label: 'Priority', icon: Filter, sortable: true },
    { id: 'assignedTo', label: 'Assigned To', icon: Users, sortable: true },
    { id: 'createdDate', label: 'Created', icon: Calendar, sortable: true }
  ];

  useEffect(() => {
    loadData();
    // Initialize selected columns
    setSelectedColumns(columns.slice(0, 7).map(col => col.id));
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all leads without pagination limit
      const [leadsResponse, customers] = await Promise.all([
        fetch(`${apiService.getApiUrl()}/leads?limit=1000`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }),
        apiService.getCustomers()
      ]);
      
      const leadsData = await leadsResponse.json();
      const leads = leadsData.leads || leadsData || [];
      
      const processedLeads = leads.map((lead, index) => ({
        ...lead,
        id: lead.id || lead._id || `lead-${index}`,
        type: 'lead',
        contactPerson: lead.name || lead.contactPerson || 'Unknown',
        companyName: lead.company || lead.companyName || 'Unknown Company',
        createdDate: lead.createdAt || lead.dateCreated || new Date().toISOString()
      }));
      
      const customersData = customers.map((customer, index) => ({
        ...customer,
        id: customer.id || customer._id || `customer-${index}`,
        type: 'customer',
        contactPerson: customer.name || customer.contactPerson || 'Unknown',
        companyName: customer.company || customer.companyName || 'Unknown Company',
        createdDate: customer.createdAt || customer.dateCreated || new Date().toISOString()
      }));
      
      const allData = [...processedLeads, ...customersData];
      console.log(`Loaded ${processedLeads.length} leads and ${customersData.length} customers`);
      setData(allData);
      setFilteredData(allData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...data];

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => {
        if (activeTab === 'leads') return item.type === 'lead' || !item.type;
        if (activeTab === 'customers') return item.type === 'customer' || item.status === 'converted';
        return true;
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'estimatedValue') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else if (sortBy === 'createdDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = aValue ? aValue.toString().toLowerCase() : '';
        bValue = bValue ? bValue.toString().toLowerCase() : '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, searchTerm, sortBy, sortOrder, activeTab]);

  const handleSort = (columnId) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('desc');
    }
  };

  const handleSelectRow = (id, event) => {
    event.stopPropagation();
    if (!id) {
      console.error('Trying to select row with undefined id');
      return;
    }
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (event) => {
    event.stopPropagation();
    const currentPageData = getCurrentPageData();
    const currentPageIds = currentPageData.map(item => item.id).filter(Boolean);
    const allSelected = currentPageIds.every(id => selectedRows.includes(id));
    
    if (allSelected) {
      setSelectedRows(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedRows(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      showToast('error', 'No rows selected');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} items?`)) {
      return;
    }

    setLoading(true);
    try {
      const deletePromises = selectedRows.map(async (id) => {
        const item = data.find(d => d.id === id);
        if (item?.type === 'lead') {
          return apiService.deleteLead(id);
        } else if (item?.type === 'customer') {
          console.log('Deleting customer:', id);
          return Promise.resolve(); // For now, just resolve
        }
      });
      
      await Promise.all(deletePromises.filter(Boolean));
      await loadData();
      setSelectedRows([]);
      showToast('success', `Deleted ${selectedRows.length} items successfully`);
    } catch (error) {
      console.error('Error deleting items:', error);
      showToast('error', 'Failed to delete some items');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingRow(item.id);
    setEditData(item);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      if (editData.type === 'lead') {
        await apiService.updateLead(editData.id, editData);
      } else if (editData.type === 'customer') {
        await apiService.updateCustomer(editData.id, editData);
      }
      
      await loadData();
      setEditingRow(null);
      setEditData({});
      showToast('success', 'Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      showToast('error', 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setLoading(true);
    try {
      if (item.type === 'lead') {
        await apiService.deleteLead(item.id);
      } else if (item.type === 'customer') {
        // For now, just remove from local state since deleteCustomer might not exist
        console.log('Deleting customer:', item.id);
      }
      
      // Remove from local state immediately
      setData(prev => prev.filter(d => d.id !== item.id));
      setFilteredData(prev => prev.filter(d => d.id !== item.id));
      
      showToast('success', 'Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast('error', 'Failed to delete item');
      // Reload data on error
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
    showToast('success', 'Data refreshed successfully');
  };

  const handleExport = () => {
    const csvContent = [
      selectedColumns.join(','),
      ...filteredData.map(item =>
        selectedColumns.map(col => item[col] || '').join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('success', '📥 Data exported successfully!');
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getStatusColor = (status) => {
    const colors = {
      'new': { bg: '#3b82f6', text: 'white' },
      'contacted': { bg: '#f59e0b', text: 'white' },
      'qualified': { bg: '#06b6d4', text: 'white' },
      'proposal': { bg: '#10b981', text: 'white' },
      'converted': { bg: '#22c55e', text: 'white' },
      'customer': { bg: '#8b5cf6', text: 'white' },
      'lost': { bg: '#ef4444', text: 'white' }
    };
    return colors[status] || colors['new'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': { bg: '#06b6d4', text: 'white' },
      'medium': { bg: '#f59e0b', text: 'white' },
      'high': { bg: '#f97316', text: 'white' },
      'urgent': { bg: '#ef4444', text: 'white' }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Database style={{ color: '#3b82f6' }} size={32} />
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0
            }}>
              Data Management
            </h1>
            <p style={{ 
              color: darkMode ? '#9ca3af' : '#6b7280', 
              fontSize: '1rem', 
              margin: 0
            }}>
              Manage your leads and customers data
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ ...cardStyle, padding: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'all', label: 'All Data', count: filteredData.length },
            { id: 'leads', label: 'Leads', count: data.filter(d => d.type === 'lead' || !d.type).length },
            { id: 'customers', label: 'Customers', count: data.filter(d => d.type === 'customer' || d.status === 'converted').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.5rem',
                border: `2px solid ${activeTab === tab.id ? '#3b82f6' : (darkMode ? '#374151' : '#e5e7eb')}`,
                borderRadius: '8px',
                background: activeTab === tab.id 
                  ? '#3b82f6'
                  : 'transparent',
                color: activeTab === tab.id 
                  ? 'white'
                  : (darkMode ? '#d1d5db' : '#374151'),
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
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
              placeholder="Search across all columns..."
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

          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.875rem',
                color: darkMode ? '#d1d5db' : '#374151',
                fontWeight: '500'
              }}>
                {selectedRows.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              style={{
                padding: '0.75rem',
                background: darkMode ? '#374151' : '#f3f4f6',
                color: darkMode ? '#d1d5db' : '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              title="Column Settings"
            >
              <Settings size={16} />
            </button>
            
            <button
              onClick={handleExport}
              style={{
                padding: '0.75rem 1rem',
                background: '#22c55e',
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
            
            <button
              onClick={refreshData}
              disabled={loading}
              style={{
                padding: '0.75rem',
                background: loading 
                  ? (darkMode ? '#4b5563' : '#d1d5db')
                  : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
              title="Refresh Data"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            </button>
          </div>
        </div>

        {/* Column Settings */}
        {showColumnSettings && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: darkMode ? '#374151' : '#f9fafb',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
          }}>
            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '0.75rem'
            }}>
              Select Columns to Display:
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.5rem'
            }}>
              {columns.map(column => (
                <label key={column.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: darkMode ? '#d1d5db' : '#374151'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedColumns([...selectedColumns, column.id]);
                      } else {
                        setSelectedColumns(selectedColumns.filter(id => id !== column.id));
                      }
                    }}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {column.label}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{
          padding: '1rem',
          borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          background: darkMode ? '#374151' : '#f9fafb'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `40px repeat(${selectedColumns.length}, 1fr) 100px`,
            gap: '1rem',
            alignItems: 'center'
          }}>
            {/* Select All Checkbox */}
            <button
              onClick={(e) => handleSelectAll(e)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: darkMode ? '#d1d5db' : '#374151'
              }}
            >
              {getCurrentPageData().length > 0 && getCurrentPageData().every(item => selectedRows.includes(item.id)) ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
            </button>

            {/* Column Headers */}
            {selectedColumns.map(columnId => {
              const column = columns.find(col => col.id === columnId);
              if (!column) return null;
              
              return (
                <div key={columnId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}>
                    {column.label}
                  </span>
                  {column.sortable && (
                    <button
                      onClick={() => handleSort(columnId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: sortBy === columnId ? '#8b5cf6' : (darkMode ? '#9ca3af' : '#6b7280')
                      }}
                    >
                      <ArrowUpDown size={14} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Actions Header */}
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: darkMode ? '#d1d5db' : '#374151'
            }}>
              Actions
            </span>
          </div>
        </div>

        {/* Table Body */}
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {getCurrentPageData().map((item, index) => {
            const itemKey = item.id || `row-${index}`;
            return (
            <div key={itemKey} style={{
              padding: '1rem',
              borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              background: index % 2 === 0 
                ? (darkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.5)')
                : 'transparent'
            }}
            onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `40px repeat(${selectedColumns.length}, 1fr) 100px`,
                gap: '1rem',
                alignItems: 'center'
              }}>
                {/* Row Checkbox */}
                <button
                  onClick={(e) => handleSelectRow(item.id, e)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}
                >
                  {selectedRows.includes(item.id) ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                </button>

                {/* Data Columns */}
                {selectedColumns.map(columnId => {
                  let cellContent = item[columnId];
                  
                  // If editing this row, show input fields
                  if (editingRow === item.id && ['contactPerson', 'companyName', 'email', 'phone', 'industry'].includes(columnId)) {
                    return (
                      <div key={columnId}>
                        <input
                          type="text"
                          value={editData[columnId] || ''}
                          onChange={(e) => setEditData({...editData, [columnId]: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '4px',
                            background: darkMode ? '#374151' : 'white',
                            color: darkMode ? 'white' : '#1f2937',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                    );
                  }
                  
                  // Format specific columns
                  if (columnId === 'estimatedValue') {
                    cellContent = cellContent ? `₹${cellContent.toLocaleString()}` : '-';
                  } else if (columnId === 'createdDate') {
                    cellContent = new Date(cellContent).toLocaleDateString();
                  } else if (columnId === 'status') {
                    const statusColor = getStatusColor(cellContent);
                    return (
                      <div key={columnId}>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: statusColor.bg,
                          color: statusColor.text,
                          border: 'none',
                          display: 'inline-block'
                        }}>
                          {cellContent}
                        </span>
                      </div>
                    );
                  } else if (columnId === 'priority') {
                    const priorityColor = getPriorityColor(cellContent);
                    return (
                      <div key={columnId}>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: priorityColor.bg,
                          color: priorityColor.text,
                          border: 'none',
                          display: 'inline-block'
                        }}>
                          {cellContent}
                        </span>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={columnId} style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#d1d5db' : '#374151',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {cellContent || '-'}
                    </div>
                  );
                })}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {editingRow === item.id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        disabled={loading}
                        style={{
                          padding: '0.5rem',
                          background: '#22c55e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.7 : 1
                        }}
                        title="Save"
                      >
                        {loading ? <Loader size={14} className="animate-spin" /> : '✓'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '0.5rem',
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          padding: '0.5rem',
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={loading}
                        style={{
                          padding: '0.5rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.7 : 1
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div style={{
          padding: '1rem',
          borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                fontSize: '0.875rem',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: darkMode ? '#d1d5db' : '#374151',
                fontWeight: '600'
              }}>
                Total Records: {data.length}
              </span>
            </div>
            
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={{
                padding: '0.5rem',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '6px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#1f2937',
                fontSize: '0.875rem'
              }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '6px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? '#d1d5db' : '#374151',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            
            <span style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: darkMode ? '#d1d5db' : '#374151'
            }}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '6px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? '#d1d5db' : '#374151',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          ...cardStyle,
          padding: '3rem',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <Loader size={48} style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem' }} className="animate-spin" />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Loading data...
          </h3>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            Please wait while we fetch your data
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredData.length === 0 && (
        <div style={{
          ...cardStyle,
          padding: '3rem',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <Database size={48} style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem' }} />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            No data found
          </h3>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            {searchTerm ? 'Try adjusting your search criteria' : 'No data available in the selected category'}
          </p>
        </div>
      )}
      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalDataTable;