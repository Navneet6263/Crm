const rateLimit = require('express-rate-limit');
const { formatResponse } = require('../utils/helpers');

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 5 attempts per window
  message: formatResponse(null, 'Too many login attempts, try again later', 429),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ':' + (req.body.email || req.body.phone)
});

// Password reset limiter
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset attempts per hour
  message: formatResponse(null, 'Too many password reset attempts', 429),
  keyGenerator: (req) => req.ip + ':' + (req.body.email || req.body.phone)
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 100 requests per window
  message: formatResponse(null, 'Too many requests', 429)
});

// Super admin action limiter
const adminActionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 admin actions per window
  message: formatResponse(null, 'Too many admin actions, slow down', 429),
  skip: (req) => req.user?.role !== 'super_admin'
});

module.exports = {
  loginLimiter,
  resetPasswordLimiter,
  apiLimiter,
  adminActionLimiter
};