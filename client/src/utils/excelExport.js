// Enhanced Excel Export Utility
export const exportToExcel = (data, filename = 'export', options = {}) => {
  const {
    headers = [],
    includeTimestamp = true,
    customFormatter = null
  } = options;

  // Auto-generate headers if not provided
  const finalHeaders = headers.length > 0 ? headers : 
    data.length > 0 ? Object.keys(data[0]) : [];

  // Format data rows
  const rows = data.map(item => {
    if (customFormatter) {
      return customFormatter(item);
    }
    
    return finalHeaders.map(header => {
      const value = item[header];
      
      // Handle different data types
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'number') return value;
      if (value instanceof Date) return value.toLocaleDateString('en-IN');
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
      
      return String(value);
    });
  });

  // Create CSV content with UTF-8 BOM for Excel compatibility
  const csvContent = '\uFEFF' + [finalHeaders, ...rows]
    .map(row => row.map(cell => {
      const cellValue = String(cell || '');
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
        return `"${cellValue.replace(/"/g, '""')}"`;
      }
      return cellValue;
    }).join(','))
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const timestamp = includeTimestamp ? `-${new Date().toISOString().split('T')[0]}` : '';
  link.href = url;
  link.download = `${filename}${timestamp}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return {
    success: true,
    filename: `${filename}${timestamp}.csv`,
    recordCount: data.length
  };
};

// Lead-specific export formatter
export const exportLeadsToExcel = (leads, options = {}) => {
  const headers = [
    'Company Name',
    'Contact Person', 
    'Email',
    'Phone',
    'Status',
    'Priority',
    'Estimated Value (₹)',
    'Industry',
    'Lead Source',
    'Assigned To',
    'Created Date',
    'Last Activity',
    'Notes'
  ];

  const customFormatter = (lead) => [
    lead.companyName || '',
    lead.contactPerson || '',
    lead.email || '',
    lead.phone || '',
    (lead.status || '').toUpperCase(),
    (lead.priority || '').toUpperCase(),
    lead.estimatedValue ? `₹${Number(lead.estimatedValue).toLocaleString('en-IN')}` : '₹0',
    lead.industry || '',
    lead.leadSource || '',
    lead.assignedTo || '',
    lead.createdDate ? new Date(lead.createdDate).toLocaleDateString('en-IN') : '',
    lead.lastActivity ? new Date(lead.lastActivity).toLocaleDateString('en-IN') : '',
    lead.notes ? lead.notes.replace(/[\r\n]+/g, ' ').substring(0, 200) : ''
  ];

  return exportToExcel(leads, 'leads-export', {
    headers,
    customFormatter,
    ...options
  });
};

// Advanced export with multiple sheets (for future use)
export const exportMultiSheetExcel = (sheets, filename = 'multi-export') => {
  // For now, combine all sheets into one CSV
  // In future, can be enhanced to create actual Excel files with multiple sheets
  
  sheets.forEach((sheet, index) => {
    if (index > 0) {
      // Add separator between sheets
    }
    
    exportToExcel(sheet.data, '', {
      headers: sheet.headers,
      includeTimestamp: false,
      customFormatter: sheet.formatter
    });
    
    // This is a simplified version - would need proper multi-sheet Excel library
  });
  
  return { success: true, message: 'Multi-sheet export completed' };
};