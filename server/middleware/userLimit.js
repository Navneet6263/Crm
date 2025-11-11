const User = require('../models/User');
const Company = require('../models/Company');

const checkUserLimit = async (req, res, next) => {
  try {
    const { companyName, company: companyField } = req.body;
    const actualCompanyName = companyName || companyField;
    
    if (!actualCompanyName) {
      return res.status(400).json({ error: 'Company name required' });
    }

    const company = await Company.findOne({ name: actualCompanyName });
    if (!company) {
      // If company doesn't exist, create it automatically for new registrations
      console.log('🏢 Company not found, creating new company:', actualCompanyName);
      
      const newCompany = await Company.create({
        name: actualCompanyName,
        slug: actualCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        contactEmail: req.body.email,
        contactPhone: req.body.phone,
        adminCredentials: {
          email: req.body.email,
          password: req.body.password || 'temp123',
          isGenerated: false
        },
        plan: { name: 'basic' },
        status: 'trial',
        createdBy: null // Will be updated after user creation
      });
      
      req.company = newCompany;
      req.currentUserCount = 0;
      return next();
    }

    // Get real-time user count
    const realUserCount = await User.countDocuments({ 
      $or: [
        { companyId: company._id },
        { tenantId: company._id }
      ],
      isActive: true 
    });

    // Update company usage with real count
    await Company.updateOne(
      { _id: company._id },
      { 'usage.currentUsers': realUserCount }
    );

    // Check limit from company plan object
    const userLimit = company.plan?.usersLimit || (company.plan?.name === 'enterprise' ? -1 : 5);
    
    // -1 means unlimited
    if (userLimit !== -1 && realUserCount >= userLimit) {
      return res.status(403).json({ 
        error: 'User limit exceeded',
        currentUsers: realUserCount,
        limit: userLimit
      });
    }

    req.company = company;
    req.currentUserCount = realUserCount;
    next();
  } catch (error) {
    res.status(500).json({ error: 'User limit check failed' });
  }
};

module.exports = { checkUserLimit };