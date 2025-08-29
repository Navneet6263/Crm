const { formatResponse } = require('../utils/helpers');

// IP whitelist for super admin access
const ALLOWED_IPS = [
  '192.168.1.0/24',    // Office network
  '10.0.0.0/8',        // Corporate VPN range
  '203.0.113.0/24'     // Public office IP range
];

const ipWhitelist = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  // Check if user is super admin
  if (req.user && req.user.role === 'super_admin') {
    const isAllowed = ALLOWED_IPS.some(range => {
      if (range.includes('/')) {
        return isIPInRange(clientIP, range);
      }
      return clientIP === range;
    });
    
    if (!isAllowed) {
      return res.status(403).json(
        formatResponse(null, 'Access denied: IP not whitelisted for super admin', 403)
      );
    }
  }
  
  next();
};

const isIPInRange = (ip, range) => {
  // Simple CIDR check implementation
  const [rangeIP, mask] = range.split('/');
  const ipNum = ipToNumber(ip);
  const rangeNum = ipToNumber(rangeIP);
  const maskNum = (0xffffffff << (32 - parseInt(mask))) >>> 0;
  
  return (ipNum & maskNum) === (rangeNum & maskNum);
};

const ipToNumber = (ip) => {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
};

module.exports = ipWhitelist;