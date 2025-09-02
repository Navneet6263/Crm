const logger = require('./logger');

class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const createError = (statusCode, message) => {
  return new AppError(statusCode, message);
};

const handleError = (res, error) => {
  if (error.isOperational) {
    logger.warn(`Operational error: ${error.message}`);
    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
  }

  logger.error(`System error: ${error.message}`, { stack: error.stack });
  
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : error.message
  });
};

module.exports = { AppError, createError, handleError };