const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { safeLog } = require('../utils/authHelpers');

const auth = async (req, res, next) => {
  try {
    safeLog('info', '🔐 Auth check for:', { method: req.method, path: req.path });
    safeLog('info', '📋 Headers:', {
      'Authorization': req.header('Authorization') ? 'Token present' : 'No token',
      'Cookie': req.cookies?.authToken ? 'Cookie present' : 'No cookie'
    });
    
    // Check for token in cookies first, then headers
    let token = req.cookies?.authToken || req.header('Authorization')?.replace('Bearer ', '');
    
    safeLog('info', '🎫 Token extracted:', { hasToken: !!token });
    
    if (!token) {
      safeLog('warn', '❌ No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }



    if (!process.env.JWT_SECRET) {
      safeLog('error', '❌ JWT_SECRET not configured');
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error' 
      });
    }
    
    safeLog('info', '🔍 Verifying token with JWT_SECRET...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    safeLog('info', '✅ Token decoded successfully:', { userId: decoded.id });
    
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('companyId', 'name plan usage status')
      .populate('tenantId', 'name plan usage status');
    safeLog('info', '👤 User found:', user ? { 
      email: user.email, 
      role: user.role, 
      companyId: user.companyId?._id || user.tenantId?._id 
    } : { found: false });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token.' 
      });
    }

    // Check if user is still active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated.' 
      });
    }

    // Ensure consistent user object structure
    req.user = {
      _id: user._id,
      id: user._id, // For backward compatibility
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      companyId: user.companyId,
      tenantId: user.tenantId || user.companyId,
      company: user.companyId || user.tenantId
    };
    safeLog('info', '✅ Token verified for user:', { email: user.email, role: user.role });
    next();
  } catch (error) {
    safeLog('error', '❌ Token verification failed:', { message: error.message });
    
    // Clear invalid cookie
    if (req.cookies?.authToken) {
      res.clearCookie('authToken');
    }
    
    res.status(401).json({ 
      success: false,
      message: 'Invalid token.' 
    });
  }
};

const adminAuth = (req, res, next) => {
  if (!req.user || !['admin', 'super-admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.authToken || req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      if (!process.env.JWT_SECRET) {
        return next();
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id)
        .select('-password')
        .populate('companyId', 'name plan usage status')
        .populate('tenantId', 'name plan usage status');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    safeLog('warn', 'Optional auth failed:', { message: error.message });
  }
  
  next();
};

module.exports = { auth, adminAuth, optionalAuth };