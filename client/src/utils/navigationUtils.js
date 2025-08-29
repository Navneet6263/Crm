// Navigation utilities for CRM components
export const navigateToDetails = (type, id) => {
  const baseUrl = window.location.origin;
  const detailUrl = `${baseUrl}/details/${type}/${id}`;
  return detailUrl;
};

export const openInNewTab = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const createEmailLink = (email, subject = '', body = '') => {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  
  const queryString = params.toString();
  return `mailto:${email}${queryString ? '?' + queryString : ''}`;
};

export const createPhoneLink = (phone) => {
  // Clean phone number for tel: link
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  return `tel:${cleanPhone}`;
};

export const formatCurrency = (amount, currency = '₹') => {
  return `${currency}${Number(amount).toLocaleString('en-IN')}`;
};

export const getStatusBadgeClass = (status) => {
  const statusMap = {
    'new': 'status-new',
    'contacted': 'status-contacted', 
    'qualified': 'status-qualified',
    'converted': 'status-converted',
    'active': 'status-active',
    'lost': 'status-lost'
  };
  return statusMap[status?.toLowerCase()] || 'status-default';
};

export const getPriorityBadgeClass = (priority) => {
  const priorityMap = {
    'urgent': 'priority-urgent',
    'high': 'priority-high',
    'medium': 'priority-medium', 
    'low': 'priority-low'
  };
  return priorityMap[priority?.toLowerCase()] || 'priority-default';
};