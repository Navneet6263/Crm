const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const { getCompanyInfo } = require('../utils/authHelpers');

// Middleware to handle token from body for bulk uploads
const handleBulkAuth = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  
  try {
    // Clear any large headers to prevent 431 error
    delete req.headers['user-agent'];
    delete req.headers['accept-encoding'];
    delete req.headers['accept-language'];
    
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ message: 'Token required in body' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.id).select('_id name email role companyId tenantId isActive');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    
    req.user = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      tenantId: user.tenantId
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

const bulkUploadLeads = async (req, res) => {
  try {
    console.log('🔄 === BULK UPLOAD LEADS START ===');
    console.log('📝 Request body:', req.body);
    console.log('👤 User info:', {
      id: req.user._id || req.user.id,
      email: req.user.email,
      role: req.user.role,
      companyId: req.user.companyId
    });

    const { data } = req.body;
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No data provided for bulk upload' });
    }

    const results = { success: 0, failed: 0, errors: [] };
    const userId = req.user._id || req.user.id;
    
    // Get company info with better error handling
    let companyId;
    if (req.user.role === 'super-admin') {
      companyId = req.body.companyId || '507f1f77bcf86cd799439011';
    } else {
      // Try multiple ways to get company ID
      companyId = req.user.companyId?._id || 
                  req.user.companyId || 
                  req.user.tenantId?._id || 
                  req.user.tenantId;
      
      if (!companyId) {
        console.error('❌ No company ID found for user:', {
          userId: req.user._id || req.user.id,
          email: req.user.email,
          role: req.user.role,
          companyId: req.user.companyId,
          tenantId: req.user.tenantId
        });
        return res.status(400).json({ 
          message: 'Company ID not found. Please contact administrator.' 
        });
      }
    }
    
    console.log('🏢 Using company ID:', companyId);

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        
        // Skip empty rows
        if (!row.contactPerson && !row.email && !row.phone) {
          continue;
        }

        // Check for duplicate email or phone
        const existingLead = await Lead.findOne({
          $or: [
            { email: row.email },
            { phone: row.phone }
          ],
          isActive: true
        });

        if (existingLead) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Email or phone already exists`);
          continue;
        }

        // Validate phone number
        const phoneRegex = /^[6-9]\d{9}$/;
        if (row.phone && !phoneRegex.test(row.phone.replace(/[^\d]/g, ''))) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Invalid phone number format`);
          continue;
        }

        const leadData = {
          contactPerson: row.contactPerson || '',
          companyName: row.companyName || '',
          email: row.email || '',
          phone: row.phone || '',
          industry: row.industry || '',
          leadSource: row.leadSource || 'bulk_upload',
          estimatedValue: parseInt(row.estimatedValue) || 0,
          priority: row.priority || 'medium',
          requirements: row.requirements || '',
          status: 'new',
          createdBy: userId,
          companyId: companyId,
          tenantId: companyId
        };

        await Lead.create(leadData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    console.log('✅ Bulk upload completed:', results);
    res.json(results);
  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    res.status(500).json({ message: 'Bulk upload failed', error: error.message });
  }
};

const bulkUploadCustomers = async (req, res) => {
  try {
    console.log('🔄 === BULK UPLOAD CUSTOMERS START ===');
    console.log('📝 Request body:', req.body);
    console.log('👤 User info:', {
      id: req.user._id || req.user.id,
      email: req.user.email,
      role: req.user.role,
      companyId: req.user.companyId
    });

    const { data } = req.body;
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No data provided for bulk upload' });
    }

    const results = { success: 0, failed: 0, errors: [] };
    const userId = req.user._id || req.user.id;
    
    // Get company info with better error handling
    let companyId;
    if (req.user.role === 'super-admin') {
      companyId = req.body.companyId || '507f1f77bcf86cd799439011';
    } else {
      // Try multiple ways to get company ID
      companyId = req.user.companyId?._id || 
                  req.user.companyId || 
                  req.user.tenantId?._id || 
                  req.user.tenantId;
      
      if (!companyId) {
        console.error('❌ No company ID found for user:', {
          userId: req.user._id || req.user.id,
          email: req.user.email,
          role: req.user.role,
          companyId: req.user.companyId,
          tenantId: req.user.tenantId
        });
        return res.status(400).json({ 
          message: 'Company ID not found. Please contact administrator.' 
        });
      }
    }
    
    console.log('🏢 Using company ID:', companyId);

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        
        // Skip empty rows
        if (!row.name && !row.email && !row.phone) {
          continue;
        }

        // Check for duplicate email or phone
        const existingCustomer = await Customer.findOne({
          $or: [
            { email: row.email },
            { phone: row.phone }
          ],
          isActive: true
        });

        if (existingCustomer) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Email or phone already exists`);
          continue;
        }

        // Validate phone number
        const phoneRegex = /^[6-9]\d{9}$/;
        if (row.phone && !phoneRegex.test(row.phone.replace(/[^\d]/g, ''))) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Invalid phone number format`);
          continue;
        }

        const customerData = {
          name: row.name || '',
          company: row.company || '',
          email: row.email || '',
          phone: row.phone || '',
          address: row.address || '',
          industry: row.industry || '',
          customerType: row.customerType || 'Standard',
          createdBy: userId,
          companyId: companyId,
          tenantId: companyId
        };

        await Customer.create(customerData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    console.log('✅ Bulk upload completed:', results);
    res.json(results);
  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    res.status(500).json({ message: 'Bulk upload failed', error: error.message });
  }
};

module.exports = {
  bulkUploadLeads,
  bulkUploadCustomers,
  handleBulkAuth
};