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
  DollarSign
} from 'lucide-react';
import { showToast } from './ToastNotification';

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
    // Initialize with sample data
    const sampleData = [
      {
        id: 3,
        contactPerson: 'Amit Patel',
        companyName: 'Healthcare Solutions',
        email: 'amit@healthcare.com',
        phone: '+91 9876543212',
        industry: 'Healthcare',
        leadSource: 'Referral',
        estimatedValue: 750000,
        status: 'qualified',
        priority: 'high',
        assignedTo: 'Senior Sales Rep',
        createdDate: '2024-12-05T11:45:00Z',
        type: 'lead'
      },
      {
        id: 4,
        contactPerson: 'Sneha Gupta',
        companyName: 'Retail Chain Store',
        email: 'sneha@retailchain.com',
        phone: '+91 9876543213',
        industry: 'Retail',
        leadSource: 'Cold Call',
        estimatedValue: 150000,
        status: 'contacted',
        priority: 'low',
        assignedTo: 'Sales Rep',
        createdDate: '2024-12-01T14:20:00Z',
        type: 'lead'
      }
    ];

    // Combine with CRM data
    const leadsArray = Array.isArray(crmData.leads) ? crmData.leads : (crmData.leads?.leads || []);
    const allData = [...sampleData, ...leadsArray.map(lead => ({...lead, type: 'lead'}))];
    setData(allData);
    setFilteredData(allData);
    
    // Initialize selected columns
    setSelectedColumns(columns.slice(0, 7).map(col => col.id));
  }, [crmData]);

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

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentPageData = getCurrentPageData();
    const currentPageIds = currentPageData.map(item => item.id);
    
    if (selectedRows.length === currentPageIds.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentPageIds);
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      showToast('error', '❌ No rows selected');
      return;
    }

    const updatedData = data.filter(item => !selectedRows.includes(item.id));
    setData(updatedData);
    setSelectedRows([]);
    showToast('success', `🗑️ Deleted ${selectedRows.length} items`);
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
      'new': { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: 'white', shadow: '0 4px 15px rgba(102, 126, 234, 0.4)' },
      'contacted': { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: 'white', shadow: '0 4px 15px rgba(240, 147, 251, 0.4)' },
      'qualified': { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: 'white', shadow: '0 4px 15px rgba(79, 172, 254, 0.4)' },
      'proposal': { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: 'white', shadow: '0 4px 15px rgba(67, 233, 123, 0.4)' },
      'converted': { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: 'white', shadow: '0 4px 15px rgba(250, 112, 154, 0.4)' },
      'customer': { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', text: '#1f2937', shadow: '0 4px 15px rgba(168, 237, 234, 0.4)' },
      'lost': { bg: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', text: '#1f2937', shadow: '0 4px 15px rgba(210, 153, 194, 0.4)' }
    };
    return colors[status] || colors['new'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': { bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', text: 'white', shadow: '0 4px 15px rgba(137, 247, 254, 0.4)' },
      'medium': { bg: 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)', text: 'white', shadow: '0 4px 15px rgba(253, 187, 45, 0.4)' },
      'high': { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', text: 'white', shadow: '0 4px 15px rgba(255, 154, 158, 0.4)' },
      'urgent': { bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', text: 'white', shadow: '0 4px 15px rgba(255, 107, 107, 0.4)' }
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
      <div style={{ 
        marginBottom: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)'
          }}>
            <Database style={{ color: 'white' }} size={32} />
          </div>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: 'white',
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Data Table
            </h1>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '1.125rem', 
              margin: 0,
              fontWeight: '500'
            }}>
              Advanced data management with filtering, sorting, and bulk operations
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        ...cardStyle, 
        padding: '0.5rem', 
        marginBottom: '2rem', 
        overflow: 'hidden',
        background: darkMode 
          ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'all', label: 'All Data', count: data.length, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            { id: 'leads', label: 'Leads', count: data.filter(d => d.type === 'lead' || !d.type).length, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
            { id: 'customers', label: 'Customers', count: data.filter(d => d.type === 'customer' || d.status === 'converted').length, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                borderRadius: '12px',
                background: activeTab === tab.id 
                  ? tab.gradient
                  : 'transparent',
                color: activeTab === tab.id 
                  ? 'white'
                  : (darkMode ? '#9ca3af' : '#6b7280'),
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === tab.id 
                  ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                  : 'none',
                transform: activeTab === tab.id ? 'translateY(-2px)' : 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }
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
            
            <button
              style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              title="Refresh Data"
            >
              <RefreshCw size={16} />
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
              onClick={handleSelectAll}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: darkMode ? '#d1d5db' : '#374151'
              }}
            >
              {selectedRows.length === getCurrentPageData().length && getCurrentPageData().length > 0 ? (
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
          {getCurrentPageData().map((item, index) => (
            <div key={item.id} style={{
              padding: '1rem',
              borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              background: index % 2 === 0 
                ? (darkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.5)')
                : 'transparent',
              transition: 'all 0.3s ease',
              borderRadius: '8px',
              margin: '0.25rem 0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = darkMode 
                ? 'linear-gradient(135deg, rgba(55, 65, 81, 0.8) 0%, rgba(75, 85, 99, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.6) 100%)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = index % 2 === 0 
                ? (darkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.5)')
                : 'transparent';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: `40px repeat(${selectedColumns.length}, 1fr) 100px`,
                gap: '1rem',
                alignItems: 'center'
              }}>
                {/* Row Checkbox */}
                <button
                  onClick={() => handleSelectRow(item.id)}
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
                          boxShadow: statusColor.shadow,
                          border: 'none',
                          display: 'inline-block',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = statusColor.shadow.replace('0.4', '0.6');
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = statusColor.shadow;
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
                          boxShadow: priorityColor.shadow,
                          border: 'none',
                          display: 'inline-block',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = priorityColor.shadow.replace('0.4', '0.6');
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = priorityColor.shadow;
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
                  <button
                    style={{
                      padding: '0.5rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    title="View"
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    style={{
                      padding: '0.5rem',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    title="Edit"
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(240, 147, 251, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(240, 147, 251, 0.4)';
                    }}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    style={{
                      padding: '0.5rem',
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    title="Delete"
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)';
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
            <span style={{
              fontSize: '0.875rem',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </span>
            
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

      {/* Empty State */}
      {filteredData.length === 0 && (
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
    </div>
  );
};

export default ProfessionalDataTable;