const Company = require('../models/Company');
const User = require('../models/User');
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

    const { name, contactEmail, contactPhone, plan } = req.body;

    // Validate required fields
    if (!name || !contactEmail) {
      return res.status(400).json({ message: 'Company name and contact email are required' });
    }

    // Generate unique slug
    const slug = generateSlug(name);
    
    // Check if company with same name or slug exists
    const existingCompany = await Company.findOne({
      $or: [{ name }, { slug }]
    });
    
    if (existingCompany) {
      return res.status(409).json({ message: 'Company with this name already exists' });
    }

    // Set default plan if not provided
    const companyPlan = plan || {
      name: 'basic',
      leadsLimit: 1000,
      usersLimit: 5
    };

    // Create company
    const company = await Company.create({
      name,
      slug,
      contactEmail,
      contactPhone,
      plan: companyPlan,
      status: 'active',
      createdBy: req.user.id
    });

    // Generate temporary password
    const tempPassword = generateStrongPassword(12);

    // Create admin user
    const admin = await User.create({
      tenantId: company._id,
      name: 'Admin',
      email: contactEmail,
      password: tempPassword, // Will be hashed by pre-save middleware
      role: 'admin',
      isActive: true
    });

    // Return success response
    res.status(201).json({
      success: true,
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug
      },
      admin: {
        email: admin.email,
        tempPassword: tempPassword
      },
      loginUrl: `/app/${company.slug}/login`
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

module.exports = {
  createCompany,
  getAllCompanies,
  updateCompanyStatus,
  suspendCompany,
  activateCompany
};