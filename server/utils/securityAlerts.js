const { Resend } = require('resend');
const User = require('../models/User');
const { formatResponse, sanitizeInput } = require('./helpers');
const { securityLogger } = require('./logger');

// Resend email service
const resend = new Resend(process.env.RESEND_API_KEY);

// Known IPs/devices storage (use database in production)
const knownDevices = new Map();
const knownIPs = new Map();

// Check if IP is suspicious
const isSuspiciousIP = (userId, ip) => {
  const userIPs = knownIPs.get(userId) || [];
  return !userIPs.includes(ip);
};

// Check if device is suspicious
const isSuspiciousDevice = (userId, userAgent) => {
  const userDevices = knownDevices.get(userId) || [];
  return !userDevices.some(device => device.includes(userAgent.split(' ')[0]));
};

// Send security alert to all super admins
const sendSecurityAlert = async (alertData) => {
  try {
    const superAdmins = await User.find({ 
      role: 'super-admin', 
      isActive: true 
    }).select('email name');
    
    // Log the alert
    securityLogger.warn('Security Alert', {
      type: sanitizeInput(alertData.type),
      message: sanitizeInput(alertData.message),
      timestamp: new Date().toISOString()
    });
    
    console.log(`🚨 SECURITY ALERT: ${alertData.type}`);
    console.log(`📧 Notifying ${superAdmins.length} super admins`);
    
    // Send email alerts
    if (process.env.ALERT_EMAIL && superAdmins.length > 0) {
      await sendEmailAlert(superAdmins, alertData);
    }
    
  } catch (error) {
    console.error('Security alert failed:', error);
  }
};

// Send email alert
const sendEmailAlert = async (superAdmins, alertData) => {
  try {
    const emailPromises = superAdmins.map(admin => {
      return resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@greencrm.com',
        to: admin.email,
        subject: `🚨 CRM Security Alert: ${alertData.type}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
              <h2>🚨 Security Alert</h2>
            </div>
            <div style="padding: 20px; background: #f8f9fa;">
              <h3>Alert Type: ${alertData.type}</h3>
              <p><strong>Message:</strong> ${alertData.message}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              ${alertData.user ? `<p><strong>User:</strong> ${alertData.user}</p>` : ''}
              ${alertData.ipAddress ? `<p><strong>IP Address:</strong> ${alertData.ipAddress}</p>` : ''}
              ${alertData.recordCount ? `<p><strong>Record Count:</strong> ${alertData.recordCount}</p>` : ''}
            </div>
            <div style="padding: 20px; text-align: center; background: #e9ecef;">
              <p>This is an automated security alert from Green CRM.</p>
              <p>Please review and take appropriate action if necessary.</p>
            </div>
          </div>
        `
      });
    });
    
    await Promise.all(emailPromises);
    console.log('✅ Security alert emails sent successfully');
    
  } catch (error) {
    console.error('❌ Failed to send security alert emails:', error);
  }
};

// Monitor login attempts
const monitorLogin = async (req, user) => {
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];
  
  // Check for suspicious IP
  if (isSuspiciousIP(user.id, ip)) {
    await sendSecurityAlert('Suspicious Login - Unknown IP', {
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      location: 'Unknown' // Add IP geolocation if needed
    });
    
    // Add IP to known IPs
    const userIPs = knownIPs.get(user.id) || [];
    userIPs.push(ip);
    knownIPs.set(user.id, userIPs);
  }
  
  // Check for suspicious device
  if (isSuspiciousDevice(user.id, userAgent)) {
    await sendSecurityAlert('Suspicious Login - Unknown Device', {
      userId: user.id,
      email: user.email,
      ip,
      userAgent
    });
    
    // Add device to known devices
    const userDevices = knownDevices.get(user.id) || [];
    userDevices.push(userAgent);
    knownDevices.set(user.id, userDevices);
  }
};

// Monitor bulk operations
const monitorBulkOperation = async (operation, details) => {
  if (details.count > 10) { // Alert for bulk operations > 10 records
    await sendSecurityAlert(`Bulk ${operation}`, {
      operation,
      count: details.count,
      userId: details.userId,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  sendSecurityAlert,
  monitorLogin,
  monitorBulkOperation,
  isSuspiciousIP,
  isSuspiciousDevice
};