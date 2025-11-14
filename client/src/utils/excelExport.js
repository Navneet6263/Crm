// Enhanced Excel Export Utility with Error Handling
export const exportToExcel = (data, filename = 'export', options = {}) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const {
      headers = [],
      includeTimestamp = true,
      customFormatter = null
    } = options;

    // Auto-generate headers if not provided
    const finalHeaders = headers.length > 0 ? headers : 
      data.length > 0 ? Object.keys(data[0]) : [];

    if (finalHeaders.length === 0) {
      throw new Error('No headers found for export');
    }

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
        
        return String(value || '');
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
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

// Lead-specific export formatter
export const exportLeadsToExcel = (leads, options = {}) => {
  if (!leads || leads.length === 0) {
    throw new Error('No leads data to export');
  }

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

  const customFormatter = (lead) => {
    // Safe date formatting function
    const formatDate = (dateValue) => {
      if (!dateValue) return 'Not available';
      try {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString('en-IN');
      } catch (error) {
        return 'Invalid date';
      }
    };

    return [
      lead.companyName || 'N/A',
      lead.contactPerson || 'N/A',
      lead.email || 'N/A',
      lead.phone || 'N/A',
      (lead.status || 'new').toUpperCase(),
      (lead.priority || 'medium').toUpperCase(),
      lead.estimatedValue ? `₹${Number(lead.estimatedValue).toLocaleString('en-IN')}` : '₹0',
      lead.industry || 'N/A',
      lead.leadSource || lead.source || 'N/A',
      lead.assignedTo || 'Unassigned',
      formatDate(lead.createdDate),
      formatDate(lead.lastActivity),
      (lead.notes && typeof lead.notes === 'string') ? lead.notes.replace(/[\r\n]+/g, ' ').substring(0, 200) : 'No notes'
    ];
  };

  return exportToExcel(leads, 'leads-export', {
    headers,
    customFormatter,
    ...options
  });
};

// Advanced export with multiple sheets (for future use)
export const exportMultiSheetExcel = (sheets, filename = 'multi-export') => {
  try {
    if (!sheets || sheets.length === 0) {
      throw new Error('No sheets to export');
    }

    // For now, combine all sheets into one CSV
    // In future, can be enhanced to create actual Excel files with multiple sheets
    
    sheets.forEach((sheet, index) => {
      if (!sheet.data || sheet.data.length === 0) {
        console.warn(`Sheet ${index} has no data, skipping...`);
        return;
      }
      
      const sheetFilename = `${filename}-sheet${index + 1}`;
      exportToExcel(sheet.data, sheetFilename, {
        headers: sheet.headers,
        includeTimestamp: false,
        customFormatter: sheet.formatter
      });
    });
    
    return { success: true, message: 'Multi-sheet export completed' };
  } catch (error) {
    console.error('Multi-sheet export error:', error);
    throw error;
  }
};

// Quick export function for common use cases
export const quickExport = (data, type = 'leads') => {
  switch (type) {
    case 'leads':
      return exportLeadsToExcel(data);
    default:
      return exportToExcel(data, type);
  }
};