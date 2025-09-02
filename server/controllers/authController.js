const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const { generateToken, getCompanyInfo, safeLog, ALLOWED_ROLES } = require('../utils/authHelpers');
const { getPagination } = require('../utils/helpers');

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
      // SECURITY: Restricted superadmin creation - only navneet@greencall.com allowed
      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      
      const emailParts = email.split('@');
      if (emailParts.length !== 2) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      
      const [emailPrefix, emailDomain] = emailParts;
      
      if (emailDomain === 'greencall.com') {
        if (emailPrefix === 'navneet') {
          assignedRole = 'super-admin';
        } else {
          assignedRole = 'sales'; // All other greencall.com emails get sales role
        }
      } else {
        assignedRole = 'sales'; // All other domains get sales role
      }
    }

    const userData = { name, email, password, role: assignedRole };
    if (tenantId) {
      userData.tenantId = tenantId;
      userData.companyId = tenantId; // For consistency
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
    
    safeLog('info', '🔐 Login attempt for:', { email });

    // SECURITY: Removed hardcoded superadmin creation to prevent unauthorized access
    // Only legitimate superadmin (navneet@greencall.com) should exist

    const user = await User.findOne({ email })
      .populate('companyId', 'name plan usage status')
      .populate('tenantId', 'name plan usage status');
    if (user && (await user.comparePassword(password))) {
      // Generate token with longer expiry if rememberMe is true
      const tokenExpiry = rememberMe ? '30d' : '7d';
      const token = generateToken(user._id, rememberMe);
      safeLog('info', '🎫 Login token generated for:', { email: user.email });
      
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
      
      // Get the company info (prefer companyId over tenantId)
      const companyInfo = getCompanyInfo(user);
      
      safeLog('info', '✅ Sending login response with token and company info:', { 
        companyName: companyInfo?.name, 
        planName: companyInfo?.plan?.name 
      });
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          tenantId: user.tenantId || user.companyId,
          company: companyInfo ? {
            _id: companyInfo._id,
            name: companyInfo.name,
            plan: companyInfo.plan,
            usage: companyInfo.usage,
            status: companyInfo.status
          } : null,
          lastLogin: user.lastLogin
        },
        token,
        message: 'Login successful'
      });
    } else {
      safeLog('warn', '❌ Invalid credentials for:', { email });
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    safeLog('error', '❌ Login error:', { message: error.message });
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

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('companyId', 'name plan usage status')
      .populate('tenantId', 'name plan usage status');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }

    // Check if user is still active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    // Get the company info (prefer companyId over tenantId)
    const companyInfo = getCompanyInfo(user);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        tenantId: user.tenantId || user.companyId,
        company: companyInfo ? {
          _id: companyInfo._id,
          name: companyInfo.name,
          plan: companyInfo.plan,
          usage: companyInfo.usage,
          status: companyInfo.status
        } : null,
        lastLogin: user.lastLogin
      },
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
    
    // Get pagination parameters
    const { page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = getPagination(page, limit);
    
    let query = {};
    
    // SuperAdmin can see all users, others see only their company users
    if (req.user.role === 'super-admin') {
      // No filter - see all users
    } else if (req.user.role === 'admin') {
      const userCompanyId = getCompanyInfo(req.user)?._id || req.user.tenantId;
      query.$or = [
        { tenantId: userCompanyId },
        { companyId: userCompanyId }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create team member (Admin and SuperAdmin)
const createTeamMember = async (req, res) => {
  try {
    // Only admin and super-admin can create team members
    if (!['admin', 'super-admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admin or super-admin can create team members' });
    }

    const { name, email, role } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email and role are required' });
    }

    let userCompanyId;
    let company;
    
    // SuperAdmin has unlimited access
    if (req.user.role === 'super-admin') {
      // Get or create default company for super-admin
      let defaultCompany = await Company.findOne({ name: 'GreenCall CRM' });
      if (!defaultCompany) {
        defaultCompany = await Company.create({
          name: 'GreenCall CRM',
          slug: 'greencall-crm',
          contactEmail: 'admin@greencall.com',
          adminCredentials: {
            email: 'admin@greencall.com',
            password: 'admin123'
          },
          plan: { name: 'enterprise' },
          status: 'active',
          createdBy: req.user._id
        });
      }
      userCompanyId = defaultCompany._id;
      company = defaultCompany;
    } else {
      // Admin - normal flow with restrictions
      userCompanyId = getCompanyInfo(req.user)?._id || req.user.companyId || req.user.tenantId;
      if (!userCompanyId) {
        return res.status(400).json({ message: 'User not associated with any company' });
      }

      company = await Company.findById(userCompanyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Get real-time user count and check limits for admin
      const currentUserCount = await User.countDocuments({
        $or: [{ companyId: userCompanyId }, { tenantId: userCompanyId }],
        isActive: true
      });

      const userLimit = company.plan.usersLimit;
      if (userLimit !== -1 && currentUserCount >= userLimit) {
        return res.status(400).json({
          success: false,
          message: `Your ${company.plan.name} plan allows only ${userLimit} users. Please upgrade your plan.`,
          currentUsers: currentUserCount,
          maxUsers: userLimit,
          planName: company.plan.name
        });
      }
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate role based on user type
    if (req.user.role === 'admin') {
      // Admin cannot create super-admin or admin
      if (!ALLOWED_ROLES.ADMIN_CAN_CREATE.includes(role)) {
        return res.status(400).json({ 
          message: `Invalid role. Allowed roles: ${ALLOWED_ROLES.ADMIN_CAN_CREATE.join(', ')}` 
        });
      }
    }
    // SuperAdmin can create any role (no restrictions)

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    // Create user with admin's company info
    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role,
      tenantId: userCompanyId,
      companyId: userCompanyId,
      isActive: true
    });

    // Update company usage (skip for super-admin unlimited access)
    if (req.user.role !== 'super-admin') {
      await Company.findByIdAndUpdate(userCompanyId, {
        $inc: { 'usage.currentUsers': 1 }
      });
    }

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Team member created successfully. Temporary password sent via secure channel.'
    });
    
    // TODO: Send temporary password via secure email instead of response
    safeLog('info', 'Team member created, temp password generated:', { email: user.email });

  } catch (error) {
    safeLog('error', 'Create team member error:', { message: error.message });
    res.status(500).json({ message: error.message });
  }
};

// Toggle user status (SuperAdmin only)
const toggleUserStatus = async (req, res) => {
  try {
    console.log('Toggle user status request:', {
      userId: req.params.userId,
      requestedBy: req.user.email,
      role: req.user.role
    });
    
    // Only super-admin can toggle user status
    if (req.user.role !== 'super-admin') {
      console.log('Access denied - not super admin');
      return res.status(403).json({ message: 'Only super-admin can toggle user status' });
    }

    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user:', user.email, 'Current status:', user.isActive);

    // Toggle status
    const oldStatus = user.isActive;
    user.isActive = !user.isActive;
    await user.save();

    console.log('Status toggled:', oldStatus, '->', user.isActive);

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create employee (SuperAdmin only)
const createEmployee = async (req, res) => {
  try {
    // Only super-admin can create employees
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only super-admin can create employees' });
    }

    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Get or create default company for all roles (including super-admin)
    let defaultCompany = await Company.findOne({ name: 'GreenCall CRM' });
    if (!defaultCompany) {
      defaultCompany = await Company.create({
        name: 'GreenCall CRM',
        slug: 'greencall-crm',
        contactEmail: 'admin@greencall.com',
        adminCredentials: {
          email: 'admin@greencall.com',
          password: 'admin123'
        },
        plan: { 
          name: 'enterprise',
          usersLimit: -1,
          leadsLimit: -1,
          customersLimit: -1,
          storageLimit: 100,
          emailLimit: -1,
          smsLimit: 10000
        },
        status: 'active',
        createdBy: req.user._id
      });
    }

    // Associate all users (including super-admin) with default company
    const userData = { 
      name, 
      email, 
      password, 
      role, 
      isActive: true,
      tenantId: defaultCompany._id,
      companyId: defaultCompany._id
    };

    const user = await User.create(userData);

    // Update current SuperAdmin user to have companyId if they don't have one
    if (req.user.role === 'super-admin' && !req.user.companyId) {
      await User.findByIdAndUpdate(req.user._id, {
        companyId: defaultCompany._id,
        tenantId: defaultCompany._id
      });
      console.log('✅ Updated SuperAdmin user with default company ID');
    }

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        companyId: user.companyId
      }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, getAllUsers, checkAuth, logout, createTeamMember, toggleUserStatus, createEmployee };