// Enhanced search utilities with fuzzy matching and advanced filtering

export const fuzzySearch = (items, searchTerm, fields = []) => {
  if (!searchTerm || !items.length) return items;
  
  const term = searchTerm.toLowerCase().trim();
  
  return items.filter(item => {
    // Search in specified fields or all string fields
    const searchFields = fields.length > 0 ? fields : Object.keys(item);
    
    return searchFields.some(field => {
      const value = item[field];
      if (!value) return false;
      
      const stringValue = String(value).toLowerCase();
      
      // Exact match
      if (stringValue.includes(term)) return true;
      
      // Fuzzy match - check if all characters of search term exist in order
      return fuzzyMatch(stringValue, term);
    });
  });
};

export const fuzzyMatch = (text, pattern) => {
  let patternIdx = 0;
  let textIdx = 0;
  
  while (textIdx < text.length && patternIdx < pattern.length) {
    if (text[textIdx] === pattern[patternIdx]) {
      patternIdx++;
    }
    textIdx++;
  }
  
  return patternIdx === pattern.length;
};

export const applyAdvancedFilters = (items, filters) => {
  let filtered = [...items];
  
  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(item => item.status === filters.status);
  }
  
  // Assigned to filter
  if (filters.assignedTo && filters.assignedTo !== 'all') {
    if (filters.assignedTo === 'unassigned') {
      filtered = filtered.filter(item => !item.assignedTo);
    } else if (filters.assignedTo === 'me') {
      // This would need user context passed in
      filtered = filtered.filter(item => item.assignedTo === filters.currentUser);
    }
  }
  
  // Date range filter
  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = new Date();
    let startDate, endDate;
    
    switch (filters.dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'custom':
        if (filters.customDateFrom) startDate = new Date(filters.customDateFrom);
        if (filters.customDateTo) endDate = new Date(filters.customDateTo);
        break;
    }
    
    if (startDate || endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdDate);
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
    }
  }
  
  // Value range filter
  if (filters.valueRange && filters.valueRange !== 'all') {
    if (filters.valueRange === 'custom') {
      const minValue = filters.customValueMin ? Number(filters.customValueMin) : 0;
      const maxValue = filters.customValueMax ? Number(filters.customValueMax) : Infinity;
      
      filtered = filtered.filter(item => {
        const value = Number(item.estimatedValue) || 0;
        return value >= minValue && value <= maxValue;
      });
    } else {
      const [min, max] = filters.valueRange.split('-').map(v => 
        v.includes('+') ? Infinity : Number(v)
      );
      
      filtered = filtered.filter(item => {
        const value = Number(item.estimatedValue) || 0;
        return value >= min && (max === Infinity || value <= max);
      });
    }
  }
  
  return filtered;
};

export const sortLeads = (leads, sortBy, sortOrder = 'asc') => {
  return [...leads].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    // Handle different data types
    if (sortBy === 'estimatedValue') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else if (sortBy === 'createdDate' || sortBy === 'lastActivity') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

export const getSearchSuggestions = (items, searchTerm, maxSuggestions = 5) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  const term = searchTerm.toLowerCase();
  const suggestions = new Set();
  
  items.forEach(item => {
    ['companyName', 'contactPerson', 'email'].forEach(field => {
      const value = item[field];
      if (value && String(value).toLowerCase().includes(term)) {
        suggestions.add(String(value));
      }
    });
  });
  
  return Array.from(suggestions).slice(0, maxSuggestions);
};

export default {
  fuzzySearch,
  fuzzyMatch,
  applyAdvancedFilters,
  sortLeads,
  getSearchSuggestions
};