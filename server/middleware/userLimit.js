const User = require('../models/User');
const Company = require('../models/Company');

const checkUserLimit = async (req, res, next) => {
  try {
    const { companyName } = req.body;
    
    if (!companyName) {
      return res.status(400).json({ error: 'Company name required' });
    }

    const company = await Company.findOne({ name: companyName });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get real-time user count
    const realUserCount = await User.countDocuments({ 
      companyName: companyName,
      isActive: true 
    });

    // Update company usage with real count
    await Company.updateOne(
      { name: companyName },
      { currentUsers: realUserCount }
    );

    // Check limit from company plan object
    const userLimit = company.plan?.usersLimit || company.plan?.name === 'enterprise' ? -1 : 5;
    
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