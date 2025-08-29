// Helper functions
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const formatPhone = (phone) => {
  return phone.replace(/[^\d]/g, '');
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  // Remove potential log injection characters and XSS vectors
  return input.trim()
    .replace(/[\r\n\t]/g, '') // Remove line breaks and tabs
    .replace(/[<>"'&]/g, '') // Remove HTML/XSS characters
    .replace(/\$[a-zA-Z]/g, '') // Remove MongoDB operators
    .substring(0, 1000); // Limit length
};

const getPagination = (page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

const formatResponse = (data, message = 'Success', status = 200) => {
  return {
    success: status < 400,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  generateId,
  formatPhone,
  sanitizeInput,
  getPagination,
  buildSearchQuery,
  formatResponse
};