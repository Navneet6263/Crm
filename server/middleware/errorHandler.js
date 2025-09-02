const { formatResponse, sanitizeInput } = require('../utils/helpers');

// Global error handler
const errorHandler = (err, req, res, next) => {
  // Sanitize error message before logging
  const sanitizedMessage = typeof err.message === 'string' ? sanitizeInput(err.message) : 'Unknown error';
  console.error('Error:', sanitizedMessage);
  
  let error = { ...err };
  error.message = err.message;
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = err.errors && typeof err.errors === 'object' 
      ? Object.values(err.errors)
          .filter(val => val && val.message)
          .map(val => sanitizeInput(val.message))
          .join(', ')
      : 'Validation error';
    error = { message, statusCode: 400 };
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }
  
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }
  
  res.status(error.statusCode || 500).json(
    formatResponse(null, error.message || 'Server Error', error.statusCode || 500)
  );
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};