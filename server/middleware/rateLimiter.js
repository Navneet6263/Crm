const rateLimit = require('express-rate-limit');
const { formatResponse } = require('../utils/helpers');

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per window
  message: formatResponse(null, 'Too many login attempts, try again later', 429),
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if available, otherwise fallback to req.ip
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    return ip + ':' + (req.body.email || req.body.phone || 'anonymous');
  }
});

// Password reset limiter
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset attempts per hour
  message: formatResponse(null, 'Too many password reset attempts', 429),
  trustProxy: true,
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    return ip + ':' + (req.body.email || req.body.phone || 'anonymous');
  }
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  message: formatResponse(null, 'Too many requests', 429),
  trustProxy: true,
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    return ip;
  }
});

// Super admin action limiter
const adminActionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 admin actions per window
  message: formatResponse(null, 'Too many admin actions, slow down', 429),
  trustProxy: true,
  skip: (req) => req.user?.role !== 'super_admin',
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    return ip + ':admin';
  }
});

module.exports = {
  loginLimiter,
  resetPasswordLimiter,
  apiLimiter,
  adminActionLimiter
};