const AuditLog = require('../models/AuditLog');
const TokenBlacklist = require('../models/TokenBlacklist');
const User = require('../models/User');
const { securityLogger } = require('../utils/logger');
const { sanitizeInput } = require('../utils/helpers');
const { sendSecurityAlert } = require('../utils/securityAlerts');

// Audit logging middleware
const auditLogger = (action) => {
  return async (req, res, next) => {
    try {
      await AuditLog.create({
        action,
        performedBy: req.user?.id,
        userEmail: req.user?.email,
        userRole: req.user?.role,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      });
      
      // Log to security logger
      securityLogger.info('Audit event', {
        action: sanitizeInput(action),
        userId: req.user?.id,
        userEmail: sanitizeInput(req.user?.email),
        ipAddress: req.ip
      });
    } catch (error) {
      securityLogger.error('Audit log error', { error: error.message });
    }
    next();
  };
};

// Check if token is blacklisted
const checkTokenBlacklist = async (req, res, next) => {
  if (req.user) {
    const blacklisted = await TokenBlacklist.findOne({
      userId: req.user.id,
      deactivatedAt: { $lte: new Date() }
    });
    
    if (blacklisted) {
      return res.status(401).json({ message: 'Your account has been disabled' });
    }
  }
  next();
};

// Super admin only access
const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'super-admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};

// Bulk export monitoring
const monitorBulkExport = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData) && parsedData.length > 100) {
        // Alert super admins (async operation)
        alertSuperAdmins({
          type: 'BULK_EXPORT_ALERT',
          message: `⚠️ Bulk export (${parsedData.length} records) by ${sanitizeInput(req.user?.name)}`,
          user: sanitizeInput(req.user?.name),
          recordCount: parsedData.length,
          ipAddress: req.ip
        });
        
        // Create audit log (async operation)
        AuditLog.create({
          action: 'BULK_EXPORT',
          performedBy: req.user?.id,
          userEmail: req.user?.email,
          userRole: req.user?.role,
          ipAddress: req.ip,
          recordCount: parsedData.length,
          timestamp: new Date()
        }).catch(err => console.error('Audit log error:', err));
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Alert all super admins
const alertSuperAdmins = async (alertData) => {
  try {
    await sendSecurityAlert(alertData);
  } catch (error) {
    console.error('Alert error:', error);
  }
};

module.exports = {
  auditLogger,
  checkTokenBlacklist,
  requireSuperAdmin,
  monitorBulkExport,
  alertSuperAdmins
};