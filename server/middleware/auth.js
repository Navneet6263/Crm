const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth check for:', req.method, req.path);
    console.log('📋 Headers:', {
      'Authorization': req.header('Authorization') ? 'Token present' : 'No token',
      'Cookie': req.cookies?.authToken ? 'Cookie present' : 'No cookie'
    });
    
    // Check for token in cookies first, then headers
    let token = req.cookies?.authToken || req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🎫 Token extracted:', token ? `${token.substring(0, 20)}...` : 'No token found');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    // Handle super admin token (for backward compatibility)
    if (token.includes('super-admin-token')) {
      let superAdmin = await User.findOne({ email: 'superadmin@greencrm.com' });
      if (!superAdmin) {
        superAdmin = await User.create({
          name: 'Super Admin',
          email: 'superadmin@greencrm.com',
          password: 'super123',
          role: 'super-admin'
        });
      }
      req.user = superAdmin;
      return next();
    }

    console.log('🔍 Verifying token with JWT_SECRET...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log('✅ Token decoded successfully:', { userId: decoded.id });
    
    const user = await User.findById(decoded.id).select('-password');
    console.log('👤 User found:', user ? `${user.email} (role: ${user.role}, tenantId: ${user.tenantId})` : 'No user found');
    
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

    req.user = user;
    console.log('✅ Token verified for user:', user.email, 'Role:', user.role);
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
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
  if (!['admin', 'super-admin'].includes(req.user.role)) {
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log('Optional auth failed:', error.message);
  }
  
  next();
};

module.exports = { auth, adminAuth, optionalAuth };