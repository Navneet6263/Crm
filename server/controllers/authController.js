const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  console.log('🎫 Generated token for user:', id, 'Token preview:', `${token.substring(0, 20)}...`);
  return token;
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let assignedRole = role || 'sales';
    let tenantId = null;
    
    // If user is authenticated (admin creating team member)
    if (req.user) {
      // Only admin and super-admin can create users
      if (!['admin', 'super-admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized to create users' });
      }
      
      // Admin can only create users in their company
      if (req.user.role === 'admin') {
        tenantId = req.user.tenantId;
        // Admin cannot create super-admin or admin roles
        if (['super-admin', 'admin'].includes(assignedRole)) {
          assignedRole = 'manager';
        }
      }
      
      // Super-admin can create users for any company or no company
      if (req.user.role === 'super-admin' && req.body.tenantId) {
        tenantId = req.body.tenantId;
      }
    } else {
      // Public registration - auto-assign role based on email domain
      const emailDomain = email.split('@')[1];
      
      if (emailDomain === 'greencall.com') {
        const emailPrefix = email.split('@')[0];
        if (emailPrefix === 'navneet') {
          assignedRole = 'super-admin';
        } else if (emailPrefix === 'admin') {
          assignedRole = 'admin';
        } else if (emailPrefix === 'manager') {
          assignedRole = 'manager';
        } else if (emailPrefix === 'support') {
          assignedRole = 'support';
        } else {
          assignedRole = 'sales';
        }
      } else if (emailDomain === 'greencrm.com') {
        const emailPrefix = email.split('@')[0];
        if (emailPrefix === 'superadmin') {
          assignedRole = 'super-admin';
        } else if (emailPrefix === 'admin') {
          assignedRole = 'admin';
        } else if (emailPrefix === 'manager') {
          assignedRole = 'manager';
        } else if (emailPrefix === 'support') {
          assignedRole = 'support';
        } else {
          assignedRole = 'sales';
        }
      }
    }

    const userData = { name, email, password, role: assignedRole };
    if (tenantId) {
      userData.tenantId = tenantId;
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      },
      token,
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    console.log('🔐 Login attempt for:', email);

    // Check for super admin hardcoded credentials
    if (email === 'superadmin@greencrm.com' && password === 'super123') {
      let superAdmin = await User.findOne({ email: 'superadmin@greencrm.com' });
      if (!superAdmin) {
        console.log('🔧 Creating super admin user...');
        superAdmin = await User.create({
          name: 'Super Admin',
          email: 'superadmin@greencrm.com',
          password: 'super123',
          role: 'super-admin',
          isActive: true
        });
      }
      
      const token = jwt.sign({ id: superAdmin._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '30d' });
      console.log('✅ Super admin login successful');
      
      return res.json({
        success: true,
        user: {
          _id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          role: superAdmin.role,
          lastLogin: new Date()
        },
        token,
        message: 'Super admin login successful'
      });
    }

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      // Generate token with longer expiry if rememberMe is true
      const tokenExpiry = rememberMe ? '30d' : '7d';
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: tokenExpiry });
      console.log('🎫 Login token generated for:', user.email, 'Token preview:', `${token.substring(0, 20)}...`);
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      // Set secure cookie for persistent login
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days or 7 days
      };
      
      res.cookie('authToken', token, cookieOptions);
      
      console.log('✅ Sending login response with token');
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        },
        token,
        message: 'Login successful'
      });
    } else {
      console.log('❌ Invalid credentials for:', email);
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Auto-login check function
const checkAuth = async (req, res) => {
  try {
    // Check for token in cookies or headers
    let token = req.cookies?.authToken || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }

    res.json({
      success: true,
      user,
      token
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

// Logout function
const logout = async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie('authToken');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Only admin and super-admin can get all users
    if (!['admin', 'super-admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    let query = { isActive: true };
    if (req.user.role === 'admin') {
      query.tenantId = req.user.tenantId;
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create team member (Admin only)
const createTeamMember = async (req, res) => {
  try {
    // Only admin can create team members
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create team members' });
    }

    const { name, email, role } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email and role are required' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate role - admin cannot create super-admin or admin
    const allowedRoles = ['manager', 'sales', 'support'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Allowed roles: manager, sales, support' 
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    // Create user with admin's tenantId
    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role,
      tenantId: req.user.tenantId,
      isActive: true
    });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      tempPassword,
      message: 'Team member created successfully. Please share the temporary password.'
    });

  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, getAllUsers, checkAuth, logout, createTeamMember };