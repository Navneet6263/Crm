const Company = require('../models/Company');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Helper function to generate strong password
const generateStrongPassword = (length = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
  let password = '';
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '@#$%&*'[Math.floor(Math.random() * 6)]; // Special char
  
  // Fill remaining length
  for (let i = 4; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Create Company + Admin (Only SUPER_ADMIN)
const createCompany = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }

    const { name, contactEmail, contactPhone, plan, adminName } = req.body;

    // Validate required fields
    if (!name || !contactEmail) {
      return res.status(400).json({ message: 'Company name and contact email are required' });
    }

    // Generate unique slug
    const slug = generateSlug(name);
    
    // Check if company with same name or slug exists
    const existingCompany = await Company.findOne({
      $or: [{ name }, { slug }, { contactEmail }]
    });
    
    if (existingCompany) {
      return res.status(409).json({ message: 'Company with this name or email already exists' });
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: contactEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Admin email already exists in system' });
    }

    // Set plan configuration
    const planName = plan?.name || 'basic';
    const PLAN_CONFIGS = {
      basic: {
        leadsLimit: 1000,
        usersLimit: 5,
        customersLimit: 500,
        storageLimit: 1,
        emailLimit: 1000,
        smsLimit: 100,
        features: ['basic_crm', 'lead_management', 'basic_reports']
      },
      professional: {
        leadsLimit: 5000,
        usersLimit: 25,
        customersLimit: 2500,
        storageLimit: 10,
        emailLimit: 10000,
        smsLimit: 1000,
        features: ['advanced_crm', 'ai_assistant', 'advanced_reports', 'automation']
      },
      enterprise: {
        leadsLimit: -1,
        usersLimit: -1,
        customersLimit: -1,
        storageLimit: 100,
        emailLimit: -1,
        smsLimit: 10000,
        features: ['full_crm', 'ai_assistant', 'custom_reports', 'advanced_automation', 'api_access']
      }
    };
    const selectedPlan = PLAN_CONFIGS[planName];

    if (!selectedPlan) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    // Generate admin credentials
    const adminEmail = contactEmail;
    const tempPassword = generateStrongPassword(12);

    // Create company with admin credentials
    const company = await Company.create({
      name,
      slug,
      contactEmail,
      contactPhone,
      adminCredentials: {
        email: adminEmail,
        password: tempPassword,
        isGenerated: true
      },
      plan: {
        name: planName,
        ...selectedPlan,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      usage: {
        currentLeads: 0,
        currentUsers: 1, // Admin user
        currentCustomers: 0,
        storageUsed: 0,
        emailsSent: 0,
        smsSent: 0,
        lastReset: new Date()
      },
      status: 'active',
      createdBy: req.user.id
    });

    // Create admin user
    const admin = await User.create({
      companyId: company._id,
      tenantId: company._id, // For consistency
      name: adminName || 'Company Admin',
      email: adminEmail,
      password: tempPassword,
      role: 'admin',
      isActive: true,
      createdBy: req.user.id
    });

    // Update company usage to include admin user
    await Company.findByIdAndUpdate(company._id, {
      'usage.currentUsers': 1
    });

    console.log('✅ Company created:', {
      companyId: company._id,
      adminEmail: adminEmail,
      plan: planName,
      limits: selectedPlan
    });

    // Return success response
    res.status(201).json({
      success: true,
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
        plan: company.plan,
        limits: company.getRemainingLimits()
      },
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        tempPassword: tempPassword
      },
      loginUrl: `/login`,
      message: 'Company created successfully! Admin can login with provided credentials.'
    });

  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ 
      message: 'Failed to create company',
      error: error.message 
    });
  }
};

// Get all companies (Super Admin only)
const getAllCompanies = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }

    const companies = await Company.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Get user counts for each company
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const userCount = await User.countDocuments({ tenantId: company._id });
        return {
          ...company.toObject(),
          userCount
        };
      })
    );

    res.json({
      success: true,
      companies: companiesWithStats
    });

  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch companies',
      error: error.message 
    });
  }
};

// Update company status
const updateCompanyStatus = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }

    const { companyId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Allowed: active, inactive, suspended' 
      });
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { status },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // If suspending, also deactivate all users in that company
    if (status === 'suspended') {
      await User.updateMany(
        { tenantId: companyId },
        { isActive: false }
      );
    } else if (status === 'active') {
      // If activating, reactivate all users
      await User.updateMany(
        { tenantId: companyId },
        { isActive: true }
      );
    }

    res.json({
      success: true,
      company,
      message: `Company ${status === 'suspended' ? 'suspended' : status === 'active' ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Update company status error:', error);
    res.status(500).json({ 
      message: 'Failed to update company status',
      error: error.message 
    });
  }
};

// Suspend company (shortcut)
const suspendCompany = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }

    const { companyId } = req.params;

    const company = await Company.findByIdAndUpdate(
      companyId,
      { status: 'suspended' },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Deactivate all users in the company
    await User.updateMany(
      { tenantId: companyId },
      { isActive: false }
    );

    res.json({
      success: true,
      company,
      message: 'Company suspended successfully. All users have been deactivated.'
    });

  } catch (error) {
    console.error('Suspend company error:', error);
    res.status(500).json({ 
      message: 'Failed to suspend company',
      error: error.message 
    });
  }
};

// Activate company (shortcut)
const activateCompany = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }

    const { companyId } = req.params;

    const company = await Company.findByIdAndUpdate(
      companyId,
      { status: 'active' },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Reactivate all users in the company
    await User.updateMany(
      { tenantId: companyId },
      { isActive: true }
    );

    res.json({
      success: true,
      company,
      message: 'Company activated successfully. All users have been reactivated.'
    });

  } catch (error) {
    console.error('Activate company error:', error);
    res.status(500).json({ 
      message: 'Failed to activate company',
      error: error.message 
    });
  }
};

// Delete company (Super Admin only)
const deleteCompany = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }

    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Delete all users in the company first
    await User.deleteMany({ 
      $or: [{ companyId }, { tenantId: companyId }]
    });

    // Delete all leads for the company
    await Lead.deleteMany({ companyId });

    // Delete all customers for the company
    await Customer.deleteMany({ companyId });

    // Finally delete the company
    await Company.findByIdAndDelete(companyId);

    res.json({
      success: true,
      message: 'Company and all associated data deleted successfully'
    });

  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ 
      message: 'Failed to delete company',
      error: error.message 
    });
  }
};

// Get company dashboard with usage stats
const getCompanyDashboard = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Check if user belongs to this company or is super admin
    const userCompanyId = req.user.companyId?._id || req.user.companyId || req.user.tenantId;
    if (req.user.role !== 'super-admin' && userCompanyId?.toString() !== companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const company = await Company.findById(companyId)
      .populate('createdBy', 'name email');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get real-time usage stats
    const [userCount, leadCount, customerCount] = await Promise.all([
      User.countDocuments({ companyId, isActive: true }),
      Lead.countDocuments({ companyId }),
      Customer.countDocuments({ companyId, isActive: true })
    ]);

    // Update usage in company
    await Company.findByIdAndUpdate(companyId, {
      'usage.currentUsers': userCount,
      'usage.currentLeads': leadCount,
      'usage.currentCustomers': customerCount
    });

    const limits = company.getRemainingLimits();
    
    res.json({
      success: true,
      company: {
        ...company.toObject(),
        usage: {
          ...company.usage,
          currentUsers: userCount,
          currentLeads: leadCount,
          currentCustomers: customerCount
        }
      },
      limits,
      canAddUser: company.canAddUser(),
      canAddLead: company.canAddLead(),
      canAddCustomer: company.canAddCustomer()
    });

  } catch (error) {
    console.error('Get company dashboard error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch company dashboard',
      error: error.message 
    });
  }
};

// Update company plan
const updateCompanyPlan = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }

    const { companyId } = req.params;
    const { planName } = req.body;

    console.log('📋 Updating company plan:', { companyId, planName, updatedBy: req.user.email });

    const PLAN_CONFIGS = {
      basic: { 
        leadsLimit: 1000, 
        usersLimit: 5, 
        customersLimit: 500, 
        storageLimit: 1, 
        emailLimit: 1000, 
        smsLimit: 100, 
        features: ['basic_crm', 'lead_management', 'basic_reports'] 
      },
      professional: { 
        leadsLimit: 5000, 
        usersLimit: 25, 
        customersLimit: 2500, 
        storageLimit: 10, 
        emailLimit: 10000, 
        smsLimit: 1000, 
        features: ['advanced_crm', 'ai_assistant', 'advanced_reports', 'automation'] 
      },
      enterprise: { 
        leadsLimit: -1, 
        usersLimit: -1, 
        customersLimit: -1, 
        storageLimit: 100, 
        emailLimit: -1, 
        smsLimit: 10000, 
        features: ['full_crm', 'ai_assistant', 'custom_reports', 'advanced_automation', 'api_access'] 
      }
    };
    
    const newPlan = PLAN_CONFIGS[planName];

    if (!newPlan) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    // Update company plan with all details
    const company = await Company.findByIdAndUpdate(
      companyId,
      {
        'plan.name': planName,
        'plan.leadsLimit': newPlan.leadsLimit,
        'plan.usersLimit': newPlan.usersLimit,
        'plan.customersLimit': newPlan.customersLimit,
        'plan.storageLimit': newPlan.storageLimit,
        'plan.emailLimit': newPlan.emailLimit,
        'plan.smsLimit': newPlan.smsLimit,
        'plan.features': newPlan.features,
        'plan.startDate': new Date(),
        'plan.endDate': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    console.log('✅ Company plan updated successfully:', {
      companyName: company.name,
      newPlan: planName,
      limits: {
        users: newPlan.usersLimit,
        leads: newPlan.leadsLimit,
        customers: newPlan.customersLimit
      }
    });

    // Get updated company with all details for response
    const updatedCompany = await Company.findById(companyId).populate('createdBy', 'name email');

    res.json({
      success: true,
      company: updatedCompany,
      planDetails: {
        name: planName,
        ...newPlan
      },
      message: `Plan successfully updated to ${planName.toUpperCase()}! All users will see the new plan limits immediately.`
    });

  } catch (error) {
    console.error('❌ Update company plan error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update company plan',
      error: error.message 
    });
  }
};

// Get company team members
const getCompanyTeam = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Check access
    if (req.user.role !== 'super-admin' && req.user.companyId?.toString() !== companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const teamMembers = await User.find({ companyId, isActive: true })
      .select('name email role createdAt lastLogin')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      team: teamMembers,
      totalMembers: teamMembers.length,
      limits: {
        current: teamMembers.length,
        max: company.plan.usersLimit,
        canAdd: company.canAddUser()
      }
    });

  } catch (error) {
    console.error('Get company team error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch company team',
      error: error.message 
    });
  }
};

// Add team member
const addTeamMember = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, email, role, phone } = req.body;
    
    // Check access (admin or super-admin)
    if (req.user.role !== 'super-admin' && 
        (req.user.companyId?.toString() !== companyId || !['admin', 'manager'].includes(req.user.role))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check user limit
    if (!company.canAddUser()) {
      return res.status(400).json({ 
        message: `User limit reached. Current plan allows ${company.plan.usersLimit} users.`,
        currentUsers: company.usage.currentUsers,
        maxUsers: company.plan.usersLimit
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Generate temporary password
    const tempPassword = generateStrongPassword(10);

    // Create user
    const newUser = await User.create({
      companyId,
      name,
      email,
      password: tempPassword,
      role: role || 'sales',
      phone,
      isActive: true,
      createdBy: req.user.id
    });

    // Update company usage
    await Company.findByIdAndUpdate(companyId, {
      $inc: { 'usage.currentUsers': 1 }
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        tempPassword
      },
      message: 'Team member added successfully'
    });

  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ 
      message: 'Failed to add team member',
      error: error.message 
    });
  }
};

// Remove team member
const removeTeamMember = async (req, res) => {
  try {
    const { companyId, userId } = req.params;
    
    // Check access
    if (req.user.role !== 'super-admin' && 
        (req.user.companyId?.toString() !== companyId || !['admin', 'manager'].includes(req.user.role))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findOne({ _id: userId, companyId });
    if (!user) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Cannot remove admin if it's the only admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ companyId, role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the only admin' });
      }
    }

    // Deactivate user
    await User.findByIdAndUpdate(userId, { 
      isActive: false,
      deactivatedBy: req.user.id,
      deactivatedAt: new Date()
    });

    // Update company usage
    await Company.findByIdAndUpdate(companyId, {
      $inc: { 'usage.currentUsers': -1 }
    });

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });

  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ 
      message: 'Failed to remove team member',
      error: error.message 
    });
  }
};

// Get plan configurations
const getPlanConfigs = async (req, res) => {
  try {
    const configs = {
      basic: {
        leadsLimit: 1000,
        usersLimit: 5,
        customersLimit: 500,
        storageLimit: 1,
        emailLimit: 1000,
        smsLimit: 100,
        features: ['basic_crm', 'lead_management', 'basic_reports'],
        price: 'Free'
      },
      professional: {
        leadsLimit: 5000,
        usersLimit: 25,
        customersLimit: 2500,
        storageLimit: 10,
        emailLimit: 10000,
        smsLimit: 1000,
        features: ['advanced_crm', 'ai_assistant', 'advanced_reports', 'automation'],
        price: '₹2999/month'
      },
      enterprise: {
        leadsLimit: -1,
        usersLimit: -1,
        customersLimit: -1,
        storageLimit: 100,
        emailLimit: -1,
        smsLimit: 10000,
        features: ['full_crm', 'ai_assistant', 'custom_reports', 'advanced_automation', 'api_access'],
        price: '₹9999/month'
      }
    };
    res.json({
      success: true,
      plans: configs
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch plan configurations',
      error: error.message 
    });
  }
};

// Get team members for current user's company
const getTeamMembers = async (req, res) => {
  try {
    console.log('👥 Getting team members - User:', req.user.email, 'Role:', req.user.role);
    
    // SuperAdmin has unlimited access - show all users or default company users
    if (req.user.role === 'super-admin') {
      console.log('🔑 SuperAdmin access - getting default company or all users');
      
      // Get or create default company for SuperAdmin
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
          plan: { name: 'enterprise', usersLimit: -1, leadsLimit: -1, customersLimit: -1 },
          status: 'active',
          createdBy: req.user._id
        });
      }
      
      // Get all users for SuperAdmin (or users from default company)
      const teamMembers = await User.find({ 
        isActive: true,
        role: { $ne: 'super-admin' } // Exclude other super-admins
      })
      .select('name email role createdAt lastLogin department companyId tenantId')
      .populate('companyId', 'name')
      .populate('tenantId', 'name')
      .sort({ createdAt: -1 });

      console.log('👥 SuperAdmin found team members:', teamMembers.length);

      return res.json({
        success: true,
        team: teamMembers,
        totalMembers: teamMembers.length,
        company: {
          id: defaultCompany._id,
          name: defaultCompany.name,
          plan: defaultCompany.plan
        },
        limits: {
          current: teamMembers.length,
          max: -1, // Unlimited for SuperAdmin
          canAdd: true
        },
        isSuperAdmin: true
      });
    }
    
    // Extract company ID from user object with better handling
    let userCompanyId;
    
    // Handle populated companyId (object with _id)
    if (req.user.companyId && typeof req.user.companyId === 'object' && req.user.companyId._id) {
      userCompanyId = req.user.companyId._id;
    }
    // Handle direct companyId (string/ObjectId)
    else if (req.user.companyId) {
      userCompanyId = req.user.companyId;
    }
    // Fallback to tenantId
    else if (req.user.tenantId) {
      userCompanyId = req.user.tenantId;
    }
    
    console.log('🏢 Extracted Company ID:', userCompanyId);
    console.log('📋 User Object Keys:', Object.keys(req.user));
    
    if (!userCompanyId) {
      console.log('❌ No company ID found for user');
      return res.status(400).json({ 
        success: false,
        message: 'User not associated with any company. Please contact your administrator.' 
      });
    }

    // Get company info for limits first
    const company = await Company.findById(userCompanyId);
    if (!company) {
      console.log('❌ Company not found with ID:', userCompanyId);
      return res.status(404).json({ 
        success: false,
        message: 'Company not found. Please contact your administrator.' 
      });
    }

    console.log('✅ Company found:', company.name, 'Plan:', company.plan.name, 'User Limit:', company.plan.usersLimit);

    // Convert to string for consistent comparison
    const companyIdStr = userCompanyId.toString();
    
    const teamMembers = await User.find({ 
      $or: [
        { companyId: companyIdStr }, 
        { tenantId: companyIdStr },
        { companyId: userCompanyId },
        { tenantId: userCompanyId }
      ],
      isActive: true 
    })
    .select('name email role createdAt lastLogin department')
    .sort({ createdAt: -1 });

    console.log('👥 Found team members:', teamMembers.length);

    // Update company usage with real count
    await Company.findByIdAndUpdate(userCompanyId, {
      'usage.currentUsers': teamMembers.length
    });

    // Check if user can add more team members
    const canAdd = company.plan.usersLimit === -1 || teamMembers.length < company.plan.usersLimit;

    res.json({
      success: true,
      team: teamMembers,
      totalMembers: teamMembers.length,
      company: {
        id: company._id,
        name: company.name,
        plan: company.plan
      },
      limits: {
        current: teamMembers.length,
        max: company.plan.usersLimit,
        canAdd: canAdd
      }
    });

  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch team members',
      error: error.message 
    });
  }
};

// Create team member for current user's company
const createTeamMember = async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    
    console.log('👤 Creating team member - User:', req.user.email, 'Role:', req.user.role);
    
    // Extract company ID with improved handling
    let userCompanyId;
    if (req.user.companyId && typeof req.user.companyId === 'object' && req.user.companyId._id) {
      userCompanyId = req.user.companyId._id;
    } else if (req.user.companyId) {
      userCompanyId = req.user.companyId;
    } else if (req.user.tenantId) {
      userCompanyId = req.user.tenantId;
    }
    
    console.log('🏢 Extracted Company ID:', userCompanyId);
    
    if (!userCompanyId) {
      console.log('❌ No company ID found for user');
      return res.status(400).json({ 
        success: false,
        message: 'User not associated with any company. Please contact your administrator.' 
      });
    }

    // Check if user has permission (admin or manager)
    if (!['admin', 'manager', 'super-admin'].includes(req.user.role)) {
      console.log('❌ Access denied for role:', req.user.role);
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin or Manager role required.' 
      });
    }

    const company = await Company.findById(userCompanyId);
    if (!company) {
      console.log('❌ Company not found with ID:', userCompanyId);
      return res.status(404).json({ 
        success: false,
        message: 'Company not found. Please contact your administrator.' 
      });
    }

    // Get real-time user count
    const currentUserCount = await User.countDocuments({ 
      $or: [{ companyId: userCompanyId }, { tenantId: userCompanyId }],
      isActive: true 
    });
    
    // Update company usage with real count
    await Company.findByIdAndUpdate(userCompanyId, {
      'usage.currentUsers': currentUserCount
    });
    
    // Refresh company data
    const updatedCompany = await Company.findById(userCompanyId);
    
    console.log('✅ Company found:', updatedCompany.name, 'Current users:', currentUserCount, 'Limit:', updatedCompany.plan.usersLimit);
    
    // Check user limit with updated data
    const userLimit = updatedCompany.plan.usersLimit;
    if (userLimit !== -1 && currentUserCount >= userLimit) {
      return res.status(400).json({ 
        success: false,
        message: `Your ${updatedCompany.plan.name} plan allows only ${userLimit} users. Please upgrade your plan.`,
        currentUsers: currentUserCount,
        maxUsers: userLimit,
        planName: updatedCompany.plan.name
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Generate temporary password
    const tempPassword = generateStrongPassword(10);

    // Create user
    const newUser = await User.create({
      companyId: userCompanyId,
      tenantId: userCompanyId, // For consistency
      name,
      email,
      password: tempPassword,
      role: role || 'sales',
      department,
      isActive: true,
      createdBy: req.user.id
    });

    console.log('✅ User created:', newUser.email);

    // Update company usage
    await Company.findByIdAndUpdate(userCompanyId, {
      $inc: { 'usage.currentUsers': 1 }
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        tempPassword
      },
      message: 'Team member added successfully'
    });

  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ 
      message: 'Failed to add team member',
      error: error.message 
    });
  }
};

// Update team member
const updateTeamMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, department } = req.body;
    
    console.log('✏️ Updating team member - User:', req.user.email, 'Target:', userId);
    
    // Extract company ID with improved handling
    let userCompanyId;
    if (req.user.companyId && typeof req.user.companyId === 'object' && req.user.companyId._id) {
      userCompanyId = req.user.companyId._id;
    } else if (req.user.companyId) {
      userCompanyId = req.user.companyId;
    } else if (req.user.tenantId) {
      userCompanyId = req.user.tenantId;
    }
    
    // Check access
    if (!['admin', 'manager', 'super-admin'].includes(req.user.role)) {
      console.log('❌ Access denied for role:', req.user.role);
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findOne({ 
      _id: userId, 
      $or: [{ companyId: userCompanyId }, { tenantId: userCompanyId }]
    });
    
    if (!user) {
      console.log('❌ Team member not found:', userId);
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, role, department },
      { new: true }
    ).select('name email role department');

    console.log('✅ Team member updated:', updatedUser.email);

    res.json({
      success: true,
      user: updatedUser,
      message: 'Team member updated successfully'
    });

  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ 
      message: 'Failed to update team member',
      error: error.message 
    });
  }
};

// Toggle team member status
const toggleTeamMemberStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔄 Toggling team member status - User:', req.user.email, 'Target:', userId);
    
    // Extract company ID with improved handling
    let userCompanyId;
    if (req.user.companyId && typeof req.user.companyId === 'object' && req.user.companyId._id) {
      userCompanyId = req.user.companyId._id;
    } else if (req.user.companyId) {
      userCompanyId = req.user.companyId;
    } else if (req.user.tenantId) {
      userCompanyId = req.user.tenantId;
    }
    
    // Check access
    if (!['admin', 'manager', 'super-admin'].includes(req.user.role)) {
      console.log('❌ Access denied for role:', req.user.role);
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findOne({ 
      _id: userId, 
      $or: [{ companyId: userCompanyId }, { tenantId: userCompanyId }]
    });
    
    if (!user) {
      console.log('❌ Team member not found:', userId);
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Cannot deactivate admin if it's the only admin
    if (user.role === 'admin' && user.isActive) {
      const adminCount = await User.countDocuments({ 
        $or: [{ companyId: userCompanyId }, { tenantId: userCompanyId }],
        role: 'admin', 
        isActive: true 
      });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot deactivate the only admin' });
      }
    }

    // Toggle status
    const newStatus = !user.isActive;
    await User.findByIdAndUpdate(userId, { 
      isActive: newStatus,
      deactivatedBy: newStatus ? null : req.user.id,
      deactivatedAt: newStatus ? null : new Date()
    });

    console.log(`✅ Team member ${newStatus ? 'activated' : 'deactivated'}:`, user.email);

    // Update company usage
    const increment = newStatus ? 1 : -1;
    await Company.findByIdAndUpdate(userCompanyId, {
      $inc: { 'usage.currentUsers': increment }
    });

    res.json({
      success: true,
      message: `Team member ${newStatus ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Toggle team member status error:', error);
    res.status(500).json({ 
      message: 'Failed to toggle team member status',
      error: error.message 
    });
  }
};

// Delete team member
const deleteTeamMember = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🗑️ Deleting team member - User:', req.user.email, 'Target:', userId);
    
    // Extract company ID with improved handling
    let userCompanyId;
    if (req.user.companyId && typeof req.user.companyId === 'object' && req.user.companyId._id) {
      userCompanyId = req.user.companyId._id;
    } else if (req.user.companyId) {
      userCompanyId = req.user.companyId;
    } else if (req.user.tenantId) {
      userCompanyId = req.user.tenantId;
    }
    
    // Check access
    if (!['admin', 'super-admin'].includes(req.user.role)) {
      console.log('❌ Access denied for role:', req.user.role);
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const user = await User.findOne({ 
      _id: userId, 
      $or: [{ companyId: userCompanyId }, { tenantId: userCompanyId }]
    });
    
    if (!user) {
      console.log('❌ Team member not found:', userId);
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Cannot delete admin if it's the only admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ 
        $or: [{ companyId: userCompanyId }, { tenantId: userCompanyId }],
        role: 'admin', 
        isActive: true 
      });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the only admin' });
      }
    }

    // Delete user
    await User.findByIdAndDelete(userId);
    console.log('✅ Team member deleted:', user.email);

    // Update company usage if user was active
    if (user.isActive) {
      await Company.findByIdAndUpdate(userCompanyId, {
        $inc: { 'usage.currentUsers': -1 }
      });
    }

    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });

  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ 
      message: 'Failed to delete team member',
      error: error.message 
    });
  }
};

// Get current user's company plan details
const getMyCompanyPlan = async (req, res) => {
  try {
    console.log('📋 Getting company plan for user:', req.user.email, 'Role:', req.user.role);
    
    // Extract company ID with improved handling
    let userCompanyId;
    if (req.user.companyId && typeof req.user.companyId === 'object' && req.user.companyId._id) {
      userCompanyId = req.user.companyId._id;
    } else if (req.user.companyId) {
      userCompanyId = req.user.companyId;
    } else if (req.user.tenantId) {
      userCompanyId = req.user.tenantId;
    }
    
    console.log('🏢 Extracted Company ID:', userCompanyId);
    
    if (!userCompanyId) {
      console.log('❌ No company ID found for user');
      return res.status(400).json({ 
        success: false,
        message: 'User not associated with any company. Please contact your administrator.' 
      });
    }

    // Get company with latest plan information
    const company = await Company.findById(userCompanyId)
      .populate('createdBy', 'name email')
      .select('name plan usage status createdAt');
      
    if (!company) {
      console.log('❌ Company not found with ID:', userCompanyId);
      return res.status(404).json({ 
        success: false,
        message: 'Company not found. Please contact your administrator.' 
      });
    }

    // Get real-time usage stats
    const [userCount, leadCount, customerCount] = await Promise.all([
      User.countDocuments({ 
        $or: [{ companyId: userCompanyId }, { tenantId: userCompanyId }],
        isActive: true 
      }),
      Lead.countDocuments({ companyId: userCompanyId }),
      Customer.countDocuments({ companyId: userCompanyId, isActive: true })
    ]);

    // Update company usage with real counts
    await Company.findByIdAndUpdate(userCompanyId, {
      'usage.currentUsers': userCount,
      'usage.currentLeads': leadCount,
      'usage.currentCustomers': customerCount
    });

    console.log('✅ Company plan retrieved:', {
      companyName: company.name,
      planName: company.plan.name,
      usage: { users: userCount, leads: leadCount, customers: customerCount },
      limits: {
        users: company.plan.usersLimit,
        leads: company.plan.leadsLimit,
        customers: company.plan.customersLimit
      }
    });

    // Calculate remaining limits
    const remainingLimits = {
      users: company.plan.usersLimit === -1 ? 'unlimited' : Math.max(0, company.plan.usersLimit - userCount),
      leads: company.plan.leadsLimit === -1 ? 'unlimited' : Math.max(0, company.plan.leadsLimit - leadCount),
      customers: company.plan.customersLimit === -1 ? 'unlimited' : Math.max(0, company.plan.customersLimit - customerCount),
      storage: Math.max(0, company.plan.storageLimit - (company.usage.storageUsed || 0))
    };

    res.json({
      success: true,
      company: {
        id: company._id,
        name: company.name,
        status: company.status,
        createdAt: company.createdAt
      },
      plan: {
        name: company.plan.name,
        limits: {
          users: company.plan.usersLimit,
          leads: company.plan.leadsLimit,
          customers: company.plan.customersLimit,
          storage: company.plan.storageLimit,
          email: company.plan.emailLimit,
          sms: company.plan.smsLimit
        },
        features: company.plan.features,
        startDate: company.plan.startDate,
        endDate: company.plan.endDate
      },
      usage: {
        users: userCount,
        leads: leadCount,
        customers: customerCount,
        storage: company.usage.storageUsed || 0,
        email: company.usage.emailsSent || 0,
        sms: company.usage.smsSent || 0
      },
      remaining: remainingLimits,
      canAdd: {
        user: company.plan.usersLimit === -1 || userCount < company.plan.usersLimit,
        lead: company.plan.leadsLimit === -1 || leadCount < company.plan.leadsLimit,
        customer: company.plan.customersLimit === -1 || customerCount < company.plan.customersLimit
      }
    });

  } catch (error) {
    console.error('❌ Get company plan error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch company plan details',
      error: error.message 
    });
  }
};

// Get companies for SuperAdmin dropdown
const getCompaniesForSuperAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }

    const companies = await Company.find({ status: 'active' })
      .select('_id name slug')
      .sort({ name: 1 });

    res.json({
      success: true,
      companies
    });

  } catch (error) {
    console.error('Get companies for SuperAdmin error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch companies',
      error: error.message 
    });
  }
};

// Create default company for SuperAdmin
const createDefaultCompany = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }

    // Check if default company already exists
    let defaultCompany = await Company.findOne({ name: 'GreenCall CRM' });
    
    if (defaultCompany) {
      return res.json({
        success: true,
        company: defaultCompany,
        message: 'Default company already exists'
      });
    }

    // Create default company
    defaultCompany = await Company.create({
      name: 'GreenCall CRM',
      slug: 'greencall-crm',
      contactEmail: 'support@greencallcrm.com',
      contactPhone: '+91-9876543210',
      plan: { 
        name: 'enterprise',
        leadsLimit: -1,
        usersLimit: -1,
        customersLimit: -1,
        storageLimit: 100,
        emailLimit: -1,
        smsLimit: 10000,
        features: ['full_crm', 'ai_assistant', 'custom_reports', 'advanced_automation', 'api_access'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      usage: {
        currentLeads: 0,
        currentUsers: 0,
        currentCustomers: 0,
        storageUsed: 0,
        emailsSent: 0,
        smsSent: 0,
        lastReset: new Date()
      },
      status: 'active',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      company: {
        _id: defaultCompany._id,
        name: defaultCompany.name,
        slug: defaultCompany.slug
      },
      message: 'Default company "GreenCall CRM" created successfully'
    });

  } catch (error) {
    console.error('Create default company error:', error);
    res.status(500).json({ 
      message: 'Failed to create default company',
      error: error.message 
    });
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  updateCompanyStatus,
  suspendCompany,
  activateCompany,
  deleteCompany,
  getCompanyDashboard,
  updateCompanyPlan,
  getCompanyTeam,
  addTeamMember,
  removeTeamMember,
  getPlanConfigs,
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  toggleTeamMemberStatus,
  deleteTeamMember,
  getMyCompanyPlan,
  getCompaniesForSuperAdmin,
  createDefaultCompany
};