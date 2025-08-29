const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const TokenBlacklist = require('../models/TokenBlacklist');
const { alertSuperAdmins } = require('../middleware/security');
const { sanitizeInput } = require('../utils/helpers');

// Deactivate user (Super Admin only)
const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deactivatedBy = req.user;
    
    // Check minimum super admin count
    if (req.body.targetRole === 'super-admin') {
      const superAdminCount = await User.countDocuments({ role: 'super-admin', isActive: true });
      if (superAdminCount <= 2) {
        return res.status(400).json({ message: 'Cannot deactivate - minimum 2 super admins required' });
      }
    }
    
    // Blacklist all user tokens
    await TokenBlacklist.create({
      userId,
      reason: 'USER_DEACTIVATED',
      deactivatedBy: deactivatedBy.id
    });
    
    // Deactivate user
    await User.findByIdAndUpdate(userId, {
      isActive: false,
      deactivatedBy: deactivatedBy.id,
      deactivatedAt: new Date()
    });
    
    // Create audit log
    await AuditLog.create({
      action: 'USER_DEACTIVATE',
      performedBy: deactivatedBy.id,
      targetUser: userId,
      ipAddress: req.ip,
      timestamp: new Date()
    });
    
    // Alert other super admins
    await alertSuperAdmins({
      type: 'USER_DEACTIVATED',
      message: `User deactivated by ${deactivatedBy.name}`,
      performedBy: deactivatedBy.name
    });
    
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Deactivation failed', error: error.message });
  }
};

// Reset password (Super Admin only for other super admins)
const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    const requestedBy = req.user;
    
    const targetUser = await User.findById(userId);
    
    // Super admin password reset restriction
    if (targetUser.role === 'super-admin' && requestedBy.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only super admins can reset super admin passwords' });
    }
    
    // Update password
    targetUser.password = newPassword;
    await targetUser.save();
    
    // Blacklist existing tokens
    await TokenBlacklist.create({
      userId,
      reason: 'PASSWORD_CHANGED',
      deactivatedBy: requestedBy.id
    });
    
    // Audit log
    await AuditLog.create({
      action: 'PASSWORD_CHANGE',
      performedBy: requestedBy.id,
      targetUser: userId,
      ipAddress: req.ip
    });
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
};

// Get audit logs (Super Admin only)
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    
    // Sanitize and validate inputs
    const sanitizedPage = Math.max(1, parseInt(page) || 1);
    const sanitizedLimit = Math.min(100, Math.max(1, parseInt(limit) || 50));
    
    const filter = {};
    if (action && typeof action === 'string') {
      filter.action = sanitizeInput(action);
    }
    if (userId && typeof userId === 'string') {
      filter.performedBy = sanitizeInput(userId);
    }
    
    const logs = await AuditLog.find(filter)
      .populate('performedBy', 'name email')
      .populate('targetUser', 'name email')
      .sort({ timestamp: -1 })
      .limit(sanitizedLimit)
      .skip((sanitizedPage - 1) * sanitizedLimit);
    
    const total = await AuditLog.countDocuments(filter);
    
    res.json({
      logs,
      totalPages: Math.ceil(total / sanitizedLimit),
      currentPage: sanitizedPage,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch audit logs', error: error.message });
  }
};

// Create new admin/super-admin (Super Admin only)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const createdBy = req.user;
    
    // Only super admin can create other admins
    if (createdBy.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only super admins can create admin users' });
    }
    
    const newUser = new User({
      name,
      email,
      password,
      role,
      createdBy: createdBy.id
    });
    
    await newUser.save();
    
    // Audit log
    await AuditLog.create({
      action: 'USER_CREATE',
      performedBy: createdBy.id,
      targetUser: newUser._id,
      details: { role },
      ipAddress: req.ip
    });
    
    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Admin creation failed', error: error.message });
  }
};

module.exports = {
  deactivateUser,
  resetUserPassword,
  getAuditLogs,
  createAdmin
};