// Validation utilities for employee management
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email?.trim());
};

export const validateName = (name) => {
  return name?.trim().length >= 2 && name?.trim().length <= 50;
};

export const validateRole = (role) => {
  const validRoles = ['admin', 'manager', 'sales', 'support', 'user'];
  return validRoles.includes(role);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const validateUserData = (userData) => {
  const errors = [];
  
  if (!validateName(userData.name)) {
    errors.push('Name must be between 2 and 50 characters');
  }
  
  if (!validateEmail(userData.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!validateRole(userData.role)) {
    errors.push('Please select a valid role');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeUserData = (userData) => {
  return {
    name: sanitizeInput(userData.name),
    email: sanitizeInput(userData.email?.toLowerCase()),
    role: userData.role,
    department: sanitizeInput(userData.department)
  };
};