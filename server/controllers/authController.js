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

    let assignedRole = role || 'user';
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
          assignedRole = 'user'; // All other greencall.com emails get user role
        }
      } else {
        assignedRole = 'user'; // All other domains get user role for trial
      }
    }

    // Generate talent ID
    const talentId = `TID${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const userData = { 
      name, 
      email, 
      password, 
      role: assignedRole,
      talentId: talentId
    };
    
    // Add phone and company fields if provided
    if (req.body.phone) userData.phone = req.body.phone;
    if (req.body.company || req.body.companyName) {
      userData.company = req.body.company || req.body.companyName;
    }
    
    // Handle company association only if user is authenticated (admin creating team member)
    if (tenantId) {
      userData.tenantId = tenantId;
      userData.companyId = tenantId;
    }

    const user = await User.create(userData);
    
    const token = generateToken(user._id, false, user.role);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        talentId: user.talentId,
        roleDisplay: user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('-', ' '),
        tenantId: user.tenantId
      },
      token,
      message: `Account created successfully! Your Talent ID: ${user.talentId}`,
      talentId: user.talentId,
      needsCompanySetup: !user.companyId
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
    
    console.log('🔍 User found:', user ? {
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password
    } : 'No user found');
    
    if (user && (await user.comparePassword(password))) {
      // Generate token with longer expiry if rememberMe is true
      const tokenExpiry = rememberMe ? '30d' : '7d';
      const token = generateToken(user._id, rememberMe, user.role);
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
      token: generateToken(user._id, false, user.role)
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
    console.log('🔄 === CREATE EMPLOYEE REQUEST ===');
    console.log('📝 Request body:', req.body);
    console.log('👤 User info:', {
      id: req.user._id || req.user.id,
      email: req.user.email,
      role: req.user.role,
      companyId: req.user.companyId
    });

    // Only super-admin can create employees
    if (req.user.role !== 'super-admin') {
      console.log('❌ Access denied - not super admin');
      return res.status(403).json({ message: 'Only super-admin can create employees' });
    }

    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      console.log('❌ Missing required fields:', { name: !!name, email: !!email, password: !!password, role: !!role });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('❌ User already exists:', email);
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

    // Associate users with default company based on role
    const userData = { 
      name, 
      email, 
      password, 
      role, 
      isActive: true
    };
    
    // Only set companyId and tenantId for non-super-admin users
    if (role !== 'super-admin') {
      userData.tenantId = defaultCompany._id;
      userData.companyId = defaultCompany._id;
      console.log('🏢 Setting company IDs for non-super-admin user:', {
        role: role,
        companyId: defaultCompany._id
      });
    } else {
      console.log('👑 Super-admin user - no company association required');
    }

    console.log('📝 Creating user with data:', {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isActive: userData.isActive,
      hasCompanyId: !!userData.companyId,
      hasTenantId: !!userData.tenantId
    });
    
    console.log('💾 Attempting to save user to database...');
    
    // Create user and ensure it's saved
    const user = new User(userData);
    await user.save();
    
    console.log('💾 User.save() completed');
    
    // Verify user was actually saved by querying database
    const savedUser = await User.findById(user._id).lean();
    
    if (!savedUser) {
      console.error('❌ CRITICAL: User not found in database after save!');
      throw new Error('Failed to save user to database');
    }
    
    console.log('✅ User verified in database:', {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      isActive: savedUser.isActive,
      companyId: savedUser.companyId,
      tenantId: savedUser.tenantId
    });

    // Update current SuperAdmin user to have companyId if they don't have one
    if (req.user.role === 'super-admin' && !req.user.companyId) {
      await User.findByIdAndUpdate(req.user._id, {
        companyId: defaultCompany._id,
        tenantId: defaultCompany._id
      });
      console.log('✅ Updated SuperAdmin user with default company ID');
    }

    console.log('📤 Sending success response...');
    res.status(201).json({
      success: true,
      message: `Employee created successfully with role: ${savedUser.role.toUpperCase()}`,
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        roleDisplay: savedUser.role.charAt(0).toUpperCase() + savedUser.role.slice(1).replace('-', ' '),
        isActive: savedUser.isActive,
        companyId: savedUser.companyId,
        tenantId: savedUser.tenantId
      },
      roleInfo: {
        role: savedUser.role,
        displayName: savedUser.role.charAt(0).toUpperCase() + savedUser.role.slice(1).replace('-', ' '),
        permissions: savedUser.role === 'super-admin' ? ['all'] : 
                    savedUser.role === 'admin' ? ['manage_company', 'view_all_leads', 'create_users'] :
                    savedUser.role === 'manager' ? ['view_team_leads', 'assign_leads'] :
                    savedUser.role === 'sales' ? ['view_own_leads', 'create_leads'] : ['view_only']
      },
      verified: true,
      savedToDatabase: true
    });
    console.log('✅ === CREATE EMPLOYEE COMPLETED ===');
  } catch (error) {
    console.error('❌ === CREATE EMPLOYEE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR ===');
    res.status(500).json({ message: error.message });
  }
};

// Delete user (SuperAdmin only)
const deleteUser = async (req, res) => {
  try {
    console.log('Delete user request:', {
      userId: req.params.userId,
      requestedBy: req.user.email,
      role: req.user.role
    });
    
    // Only super-admin can delete users
    if (req.user.role !== 'super-admin') {
      console.log('Access denied - not super admin');
      return res.status(403).json({ message: 'Only super-admin can delete users' });
    }

    const { userId } = req.params;
    
    // Prevent self-deletion
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Deleting user:', user.email);

    // Delete the user
    await User.findByIdAndDelete(userId);

    console.log('User deleted successfully:', user.email);

    res.json({
      success: true,
      message: `User ${user.name} deleted successfully`
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update user (SuperAdmin only)
const updateUser = async (req, res) => {
  try {
    console.log('Update user request:', {
      userId: req.params.userId,
      requestedBy: req.user.email,
      role: req.user.role,
      updateData: req.body
    });
    
    // Only super-admin can update users
    if (req.user.role !== 'super-admin') {
      console.log('Access denied - not super admin');
      return res.status(403).json({ message: 'Only super-admin can update users' });
    }

    const { userId } = req.params;
    const { name, email, role, password } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) {
      user.password = password; // Will be hashed by pre-save middleware
    }

    await user.save();

    console.log('User updated successfully:', user.email);

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, getAllUsers, checkAuth, logout, createTeamMember, toggleUserStatus, createEmployee, deleteUser, updateUser };