const express = require('express');
const router = express.Router();
const { 
  deactivateUser, 
  resetUserPassword, 
  getAuditLogs, 
  createAdmin 
} = require('../controllers/securityController');
const { requireSuperAdmin, auditLogger } = require('../middleware/security');
const { require2FA } = require('../middleware/twoFactor');
const { generate2FASecret, verify2FA } = require('../middleware/twoFactor');
const User = require('../models/User');

// Super admin only routes
router.use(requireSuperAdmin);
router.use(require2FA);

// User management
router.post('/users/:userId/deactivate', auditLogger('USER_DEACTIVATE'), deactivateUser);
router.post('/users/:userId/reset-password', auditLogger('PASSWORD_RESET'), resetUserPassword);
router.post('/create-admin', auditLogger('ADMIN_CREATE'), createAdmin);

// Audit logs
router.get('/audit-logs', getAuditLogs);

// 2FA setup for super admins
router.post('/setup-2fa', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { secret, qrCode, manualEntryKey } = await generate2FASecret(user._id, user.email);
    
    // Save secret temporarily (user needs to verify before enabling)
    user.twoFactorSecret = secret;
    await user.save();

    res.json({
      qrCode,
      manualEntryKey,
      message: 'Scan QR code with Google Authenticator and verify to enable 2FA'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to setup 2FA', error: error.message });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA setup not initiated' });
    }

    const isValid = verify2FA(token, user.twoFactorSecret);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid 2FA token' });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify 2FA', error: error.message });
  }
});

// Disable 2FA (requires current 2FA token)
router.post('/disable-2fa', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    const isValid = verify2FA(token, user.twoFactorSecret);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid 2FA token' });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disable 2FA', error: error.message });
  }
});

// Get all users (for management)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name email role createdAt lastLogin twoFactorEnabled')
      .sort({ createdAt: -1 });
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Revoke all sessions for a user
router.post('/users/:userId/revoke-sessions', auditLogger('SESSION_REVOKE'), async (req, res) => {
  try {
    const { userId } = req.params;
    const TokenBlacklist = require('../models/TokenBlacklist');
    
    // Blacklist all tokens for this user
    await TokenBlacklist.create({
      userId,
      reason: 'ALL_SESSIONS_REVOKED',
      deactivatedBy: req.user.id,
      deactivatedAt: new Date()
    });
    
    // Clear active sessions
    await User.findByIdAndUpdate(userId, {
      activeSessions: []
    });
    
    res.json({ message: 'All sessions revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to revoke sessions', error: error.message });
  }
});

module.exports = router;