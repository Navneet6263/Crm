const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { formatResponse } = require('../utils/helpers');

// Generate 2FA secret for user
const generate2FASecret = async (userId, email) => {
  const secret = speakeasy.generateSecret({
    name: `CRM-${email}`,
    issuer: 'Green CRM'
  });
  
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
  return {
    secret: secret.base32,
    qrCode: qrCodeUrl,
    manualEntryKey: secret.base32
  };
};

// Verify 2FA token
const verify2FA = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

// Middleware to check 2FA for super admins
const require2FA = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    if (!req.user.twoFactorEnabled) {
      return res.status(403).json(
        formatResponse(null, '2FA setup required for super admin', 403)
      );
    }
    
    const token = req.headers['x-2fa-token'];
    if (!token) {
      return res.status(401).json(
        formatResponse(null, '2FA token required', 401)
      );
    }
    
    if (!verify2FA(token, req.user.twoFactorSecret)) {
      return res.status(401).json(
        formatResponse(null, 'Invalid 2FA token', 401)
      );
    }
  }
  
  next();
};

module.exports = {
  generate2FASecret,
  verify2FA,
  require2FA
};