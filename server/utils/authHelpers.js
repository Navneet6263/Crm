const jwt = require('jsonwebtoken');
const { sanitizeInput } = require('./helpers');

// Centralized token generation
const generateToken = (userId, rememberMe = false, userRole = null) => {
  if (!userId) {
    throw new Error('User ID is required for token generation');
  }
  
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  const tokenExpiry = rememberMe ? '30d' : '7d';
  const payload = { id: userId };
  
  // Include role in token if provided
  if (userRole) {
    payload.role = userRole;
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: tokenExpiry });
};

// Get company info helper (DRY principle)
const getCompanyInfo = (user) => {
  if (!user) {
    return null;
  }
  return user.companyId || user.tenantId;
};

// Safe logging helper to prevent log injection
const safeLog = (level, message, data = {}) => {
  // Validate log level
  if (!['log', 'info', 'warn', 'error', 'debug'].includes(level)) {
    level = 'log';
  }
  
  const sanitizedData = {};
  Object.keys(data).forEach(key => {
    sanitizedData[key] = typeof data[key] === 'string' ? sanitizeInput(data[key]) : data[key];
  });
  
  console[level](`${sanitizeInput(message)}`, sanitizedData);
};

// Role validation whitelist
const ALLOWED_ROLES = {
  ADMIN_CAN_CREATE: ['manager', 'sales', 'support', 'user'],
  ALL_ROLES: ['super-admin', 'admin', 'manager', 'sales', 'support', 'user']
};

module.exports = {
  generateToken,
  getCompanyInfo,
  safeLog,
  ALLOWED_ROLES
};