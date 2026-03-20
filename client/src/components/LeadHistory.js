import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  User,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  ArrowUpDown,
  Activity,
  Package,
  RotateCcw
} from 'lucide-react';
import { showToast } from './ToastNotification';

const LeadHistory = ({ crmData, darkMode = false }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [createdByFilter, setCreatedByFilter] = useState('all');
  const [assignedToFilter, setAssignedToFilter] = useState('all');
  const [workflowStageFilter, setWorkflowStageFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'timeline'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    const allLeads = Array.isArray(crmData.leads) ? crmData.leads : (crmData.leads?.leads || []);
    setLeads(allLeads);
    setFilteredLeads(allLeads);
  }, [crmData]);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
        const response = await fetch(`${apiUrl}/products`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) return;

        const data = await response.json();
        const productList = Array.isArray(data) ? data : (data.products || data || []);

        if (isMounted) {
          setProducts(Array.isArray(productList) ? productList : []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizeText = (value) => String(value || '').trim().toLowerCase();

  const titleize = (value) => {
    if (!value) return 'N/A';
    return String(value)
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const productLookup = products.reduce((accumulator, product) => {
    const productId = product?._id || product?.id;
    if (productId) {
      accumulator[productId] = product;
    }
    if (product?.name) {
      accumulator[normalizeText(product.name)] = product;
    }
    return accumulator;
  }, {});

  const getLeadDate = (lead) => lead.createdDate || lead.createdAt || null;

  const getProductValue = (lead) => {
    const product = lead?.product;
    if (!product) return '';
    if (typeof product === 'object') {
      return product._id || product.id || product.name || '';
    }
    return String(product);
  };

  const getProductLabel = (lead) => {
    const product = lead?.product;
    if (!product) return 'Not set';
    if (typeof product === 'object') {
      if (product.name) return product.name;
      const productId = product._id || product.id;
      return productLookup[productId]?.name || 'Not set';
    }
    return productLookup[product]?.name || productLookup[normalizeText(product)]?.name || String(product);
  };

  const getSourceValue = (lead) => lead.customLeadSource || lead.leadSource || lead.source || '';
  const getSourceLabel = (lead) => titleize(getSourceValue(lead));

  const getCreatedByValue = (lead) => {
    if (!lead?.createdBy) return '';
    if (typeof lead.createdBy === 'object') {
      return lead.createdBy._id || lead.createdBy.id || lead.createdBy.email || lead.createdBy.name || '';
    }
    return String(lead.createdBy);
  };

  const getCreatedByLabel = (lead) => {
    if (!lead?.createdBy) return 'Unknown';
    if (typeof lead.createdBy === 'object') {
      return lead.createdBy.name || lead.createdBy.email || 'Unknown';
    }
    return String(lead.createdBy);
  };

  const getAssignedToValue = (lead) => {
    if (!lead?.assignedTo) return '';
    if (typeof lead.assignedTo === 'object') {
      return lead.assignedTo._id || lead.assignedTo.id || lead.assignedTo.email || lead.assignedTo.name || '';
    }
    return String(lead.assignedTo);
  };

  const getAssignedToLabel = (lead) => {
    if (!lead?.assignedTo) return 'Unassigned';
    if (typeof lead.assignedTo === 'object') {
      return lead.assignedTo.name || lead.assignedTo.email || 'Unassigned';
    }
    return String(lead.assignedTo);
  };

  const getWorkflowStageValue = (lead) => lead.workflowStage || '';
  const getWorkflowStageLabel = (lead) => titleize(getWorkflowStageValue(lead));

  const getLastActivityDate = (lead) => {
    if (lead?.lastActivity) return lead.lastActivity;
    if (Array.isArray(lead?.activities) && lead.activities.length > 0) {
      const datedActivities = lead.activities
        .map((activity) => activity?.createdAt || activity?.timestamp)
        .filter(Boolean)
        .map((value) => new Date(value))
        .filter((date) => !Number.isNaN(date.getTime()))
        .sort((first, second) => second.getTime() - first.getTime());

      if (datedActivities.length > 0) {
        return datedActivities[0];
      }
    }
    return null;
  };

  const productOptions = Array.from(
    new Map(
      leads
        .map((lead) => [getProductValue(lead), getProductLabel(lead)])
        .filter(([value]) => value)
    ),
    ([value, label]) => ({ value, label })
  ).sort((first, second) => first.label.localeCompare(second.label));

  const sourceOptions = Array.from(
    new Map(
      leads
        .map((lead) => [normalizeText(getSourceValue(lead)), getSourceLabel(lead)])
        .filter(([value]) => value)
    ),
    ([value, label]) => ({ value, label })
  ).sort((first, second) => first.label.localeCompare(second.label));

  const creatorOptions = Array.from(
    new Map(
      leads
        .map((lead) => [getCreatedByValue(lead), getCreatedByLabel(lead)])
        .filter(([value]) => value)
    ),
    ([value, label]) => ({ value, label })
  ).sort((first, second) => first.label.localeCompare(second.label));

  const assigneeOptions = Array.from(
    new Map(
      leads
        .map((lead) => [getAssignedToValue(lead), getAssignedToLabel(lead)])
        .filter(([value]) => value)
    ),
    ([value, label]) => ({ value, label })
  ).sort((first, second) => first.label.localeCompare(second.label));

  const workflowOptions = Array.from(
    new Map(
      leads
        .map((lead) => [normalizeText(getWorkflowStageValue(lead)), getWorkflowStageLabel(lead)])
        .filter(([value]) => value)
    ),
    ([value, label]) => ({ value, label })
  ).sort((first, second) => first.label.localeCompare(second.label));

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => {
        const searchableValues = [
          lead.contactPerson,
          lead.name,
          lead.companyName,
          lead.company,
          lead.email,
          lead.phone,
          lead.industry,
          lead.requirements,
          getProductLabel(lead),
          getSourceLabel(lead),
          getCreatedByLabel(lead),
          getAssignedToLabel(lead),
          lead.status,
          lead.priority,
          lead.workflowStage
        ].filter(Boolean);

        return searchableValues.some(value => String(value).toLowerCase().includes(normalizedSearch));
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Product filter
    if (productFilter !== 'all') {
      filtered = filtered.filter(lead => getProductValue(lead) === productFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(lead => (lead.priority || 'medium') === priorityFilter);
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => normalizeText(getSourceValue(lead)) === sourceFilter);
    }

    // Created by filter
    if (createdByFilter !== 'all') {
      filtered = filtered.filter(lead => getCreatedByValue(lead) === createdByFilter);
    }

    // Assigned to filter
    if (assignedToFilter !== 'all') {
      if (assignedToFilter === 'unassigned') {
        filtered = filtered.filter(lead => !getAssignedToValue(lead));
      } else {
        filtered = filtered.filter(lead => getAssignedToValue(lead) === assignedToFilter);
      }
    }

    // Workflow stage filter
    if (workflowStageFilter !== 'all') {
      filtered = filtered.filter(lead => normalizeText(getWorkflowStageValue(lead)) === workflowStageFilter);
    }

    // Date filter
    if (dateFilter !== 'all' || dateFromFilter || dateToFilter) {
      const now = new Date();
      let presetFromDate = null;
      let presetToDate = null;
      
      switch (dateFilter) {
        case 'today':
          presetFromDate = new Date();
          presetFromDate.setHours(0, 0, 0, 0);
          presetToDate = new Date();
          presetToDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          presetFromDate = new Date();
          presetFromDate.setDate(now.getDate() - 7);
          presetFromDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          presetFromDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          break;
      }

      const customFromDate = dateFromFilter ? new Date(dateFromFilter) : null;
      const customToDate = dateToFilter ? new Date(dateToFilter) : null;

      if (customFromDate) customFromDate.setHours(0, 0, 0, 0);
      if (customToDate) customToDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(lead => {
        const leadDate = new Date(getLeadDate(lead));
        if (Number.isNaN(leadDate.getTime())) return false;
        if (presetFromDate && leadDate < presetFromDate) return false;
        if (presetToDate && leadDate > presetToDate) return false;
        if (customFromDate && leadDate < customFromDate) return false;
        if (customToDate && leadDate > customToDate) return false;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(getLeadDate(a));
          bValue = new Date(getLeadDate(b));
          break;
        case 'name':
          aValue = (a.contactPerson || '').toLowerCase();
          bValue = (b.contactPerson || '').toLowerCase();
          break;
        case 'company':
          aValue = (a.companyName || '').toLowerCase();
          bValue = (b.companyName || '').toLowerCase();
          break;
        case 'product':
          aValue = getProductLabel(a).toLowerCase();
          bValue = getProductLabel(b).toLowerCase();
          break;
        case 'assignedTo':
          aValue = getAssignedToLabel(a).toLowerCase();
          bValue = getAssignedToLabel(b).toLowerCase();
          break;
        case 'createdBy':
          aValue = getCreatedByLabel(a).toLowerCase();
          bValue = getCreatedByLabel(b).toLowerCase();
          break;
        case 'value':
          aValue = a.estimatedValue || 0;
          bValue = b.estimatedValue || 0;
          break;
        default:
          aValue = new Date(getLeadDate(a));
          bValue = new Date(getLeadDate(b));
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredLeads(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [
    leads,
    products,
    searchTerm,
    statusFilter,
    productFilter,
    priorityFilter,
    sourceFilter,
    createdByFilter,
    assignedToFilter,
    workflowStageFilter,
    dateFilter,
    dateFromFilter,
    dateToFilter,
    sortBy,
    sortOrder
  ]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

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

  const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setProductFilter('all');
    setPriorityFilter('all');
    setSourceFilter('all');
    setCreatedByFilter('all');
    setAssignedToFilter('all');
    setWorkflowStageFilter('all');
    setDateFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
  };

  const getExportRows = () => filteredLeads.map(lead => ({
    contactPerson: lead.contactPerson || lead.name || '',
    companyName: lead.companyName || lead.company || '',
    product: getProductLabel(lead),
    source: getSourceLabel(lead),
    status: titleize(lead.status || 'new'),
    priority: titleize(lead.priority || 'medium'),
    workflowStage: getWorkflowStageLabel(lead),
    createdBy: getCreatedByLabel(lead),
    assignedTo: getAssignedToLabel(lead),
    email: lead.email || '',
    phone: lead.phone || '',
    estimatedValue: formatCurrency(lead.estimatedValue || 0),
    industry: lead.industry || 'N/A',
    createdDate: formatDate(getLeadDate(lead)),
    lastActivity: formatDate(getLastActivityDate(lead)),
    requirements: lead.requirements || '',
    notesCount: Array.isArray(lead.notes) ? lead.notes.length : (lead.notes ? 1 : 0),
    activitiesCount: Array.isArray(lead.activities) ? lead.activities.length : 0
  }));

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    try {
      const exportRows = getExportRows();
      if (exportRows.length === 0) {
        showToast('error', 'No lead history data to export');
        return;
      }

      const headers = [
        'Contact Person',
        'Company',
        'Product',
        'Lead Source',
        'Status',
        'Priority',
        'Workflow Stage',
        'Created By',
        'Assigned To',
        'Email',
        'Phone',
        'Estimated Value',
        'Industry',
        'Created Date',
        'Last Activity',
        'Requirements',
        'Notes Count',
        'Activities Count'
      ];
      const csvRows = [
        headers,
        ...exportRows.map(row => [
          row.contactPerson,
          row.companyName,
          row.product,
          row.source,
          row.status,
          row.priority,
          row.workflowStage,
          row.createdBy,
          row.assignedTo,
          row.email,
          row.phone,
          row.estimatedValue,
          row.industry,
          row.createdDate,
          row.lastActivity,
          row.requirements,
          row.notesCount,
          row.activitiesCount
        ])
      ];

      const csvContent = '\uFEFF' + csvRows
        .map(row => row.map(field => `"${String(field ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

      downloadBlob(
        new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
        `lead_history_${new Date().toISOString().split('T')[0]}.csv`
      );
      showToast('success', `${exportRows.length} leads exported in CSV`);
    } catch (error) {
      console.error('Export failed:', error);
      showToast('error', 'Failed to export lead history');
    }
  };

  const handleExcelExport = () => {
    try {
      const exportRows = getExportRows();
      if (exportRows.length === 0) {
        showToast('error', 'No lead history data to export');
        return;
      }

      let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="UTF-8"></head>
        <body>
        <table border="1">
          <tr style="background-color: #2563eb; color: white; font-weight: bold;">
            <th>Contact Person</th>
            <th>Company</th>
            <th>Product</th>
            <th>Lead Source</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Workflow Stage</th>
            <th>Created By</th>
            <th>Assigned To</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Estimated Value</th>
            <th>Industry</th>
            <th>Created Date</th>
            <th>Last Activity</th>
            <th>Requirements</th>
            <th>Notes Count</th>
            <th>Activities Count</th>
          </tr>
      `;

      exportRows.forEach(row => {
        html += `
          <tr>
            <td>${escapeHtml(row.contactPerson)}</td>
            <td>${escapeHtml(row.companyName)}</td>
            <td>${escapeHtml(row.product)}</td>
            <td>${escapeHtml(row.source)}</td>
            <td>${escapeHtml(row.status)}</td>
            <td>${escapeHtml(row.priority)}</td>
            <td>${escapeHtml(row.workflowStage)}</td>
            <td>${escapeHtml(row.createdBy)}</td>
            <td>${escapeHtml(row.assignedTo)}</td>
            <td>${escapeHtml(row.email)}</td>
            <td>${escapeHtml(row.phone)}</td>
            <td>${escapeHtml(row.estimatedValue)}</td>
            <td>${escapeHtml(row.industry)}</td>
            <td>${escapeHtml(row.createdDate)}</td>
            <td>${escapeHtml(row.lastActivity)}</td>
            <td>${escapeHtml(row.requirements)}</td>
            <td>${escapeHtml(row.notesCount)}</td>
            <td>${escapeHtml(row.activitiesCount)}</td>
          </tr>
        `;
      });

      html += '</table></body></html>';

      downloadBlob(
        new Blob([html], { type: 'application/vnd.ms-excel' }),
        `lead_history_${new Date().toISOString().split('T')[0]}.xls`
      );
      showToast('success', `${exportRows.length} leads exported in Excel`);
    } catch (error) {
      console.error('Excel export failed:', error);
      showToast('error', 'Failed to export Excel sheet');
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}>
          <div style={{ position: 'relative', gridColumn: 'span 2', minWidth: '250px' }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search name, company, email, product..."
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
              outline: 'none'
            }}
          >
            <option value="all">All Products</option>
            {productOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

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

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
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
            <option value="all">All Sources</option>
            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={createdByFilter}
            onChange={(e) => setCreatedByFilter(e.target.value)}
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
            <option value="all">All Creators</option>
            {creatorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={assignedToFilter}
            onChange={(e) => setAssignedToFilter(e.target.value)}
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
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {assigneeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={workflowStageFilter}
            onChange={(e) => setWorkflowStageFilter(e.target.value)}
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
            <option value="all">All Workflow</option>
            {workflowOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

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
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
          </select>

          <input
            type="date"
            value={dateFromFilter}
            onChange={(e) => setDateFromFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              background: darkMode ? '#374151' : 'white',
              color: darkMode ? 'white' : '#1f2937',
              fontSize: '1rem',
              outline: 'none'
            }}
          />

          <input
            type="date"
            value={dateToFilter}
            onChange={(e) => setDateToFilter(e.target.value)}
            style={{
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
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{ color: darkMode ? '#d1d5db' : '#6b7280', fontSize: '0.9rem', fontWeight: '600' }}>
            Showing {filteredLeads.length} of {leads.length} leads
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={resetAllFilters}
              style={{
                padding: '0.75rem 1rem',
                background: darkMode ? '#374151' : '#f3f4f6',
                color: darkMode ? 'white' : '#1f2937',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              <RotateCcw size={16} />
              Reset
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
                fontWeight: '600'
              }}
            >
              <Download size={16} />
              CSV
            </button>

            <button
              onClick={handleExcelExport}
              style={{
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              <Download size={16} />
              Excel
            </button>
          </div>
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
          <div>
            {paginatedLeads.map((lead, index) => {
              const statusColor = getStatusColor(lead.status);
              const priorityColor = getPriorityColor(lead.priority);
              
              return (
                <div key={lead._id || lead.id || index} style={{
                  padding: '1.5rem',
                  borderBottom: index < paginatedLeads.length - 1 ? `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` : 'none',
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
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
                        <Package size={14} />
                        {getProductLabel(lead)}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        marginTop: '0.2rem'
                      }}>
                        {getSourceLabel(lead)} {lead.industry ? `• ${lead.industry}` : ''}
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
                      <div>{formatDate(getLeadDate(lead))}</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        By: {getCreatedByLabel(lead)}
                      </div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>
                        To: {getAssignedToLabel(lead)}
                      </div>
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
          
          {/* Pagination */}
          {filteredLeads.length > 0 && totalPages > 1 && (
            <div style={{
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
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
          
          {paginatedLeads.map((lead, index) => {
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
                      <strong style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Product:</strong>
                      <p style={{ margin: '0.25rem 0', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        {getProductLabel(lead)}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Created by:</strong>
                      <p style={{ margin: '0.25rem 0', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        {getCreatedByLabel(lead)}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Assigned to:</strong>
                      <p style={{ margin: '0.25rem 0', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        {getAssignedToLabel(lead)}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Workflow:</strong>
                      <p style={{ margin: '0.25rem 0', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        {getWorkflowStageLabel(lead)}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Created:</strong>
                      <p style={{ margin: '0.25rem 0', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        {formatDate(getLeadDate(lead))}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Last Activity:</strong>
                      <p style={{ margin: '0.25rem 0', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        {formatDate(getLastActivityDate(lead)) || 'No activity yet'}
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
            {searchTerm || statusFilter !== 'all' || productFilter !== 'all' || priorityFilter !== 'all' || sourceFilter !== 'all' || createdByFilter !== 'all' || assignedToFilter !== 'all' || workflowStageFilter !== 'all' || dateFilter !== 'all' || dateFromFilter || dateToFilter
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
