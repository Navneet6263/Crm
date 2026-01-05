const Lead = require('../models/Lead');
const User = require('../models/User');
const Company = require('../models/Company');
const Product = require('../models/Product');
const { getCompanyInfo } = require('../utils/authHelpers');

const createLead = async (req, res) => {
  try {
    console.log('🔄 === LEAD CREATION START ===');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User info:', {
      id: req.user._id || req.user.id,
      email: req.user.email,
      role: req.user.role,
      companyId: req.user.companyId
    });
    
    // Validate user object
    if (!req.user || (!req.user._id && !req.user.id)) {
      console.log('❌ Invalid user object');
      return res.status(401).json({ message: 'Invalid user authentication' });
    }
    
    // Set default companyId if missing
    if (!req.body.companyId && req.user.role === 'super-admin') {
      req.body.companyId = '507f1f77bcf86cd799439011'; // Default ObjectId
    }
    
    console.log('Creating lead with companyId:', req.body.companyId);
    
    // Check for duplicate email or phone
    const existingLead = await Lead.findOne({
      $or: [
        { email: req.body.email },
        { phone: req.body.phone }
      ],
      isActive: true
    });
    
    if (existingLead) {
      const duplicateField = existingLead.email === req.body.email ? 'Email' : 'Phone';
      return res.status(400).json({ 
        message: `${duplicateField} already exists! This contact is already registered.` 
      });
    }
    
    // Validate phone number (should be 10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(req.body.phone.replace(/[^\d]/g, ''))) {
      return res.status(400).json({ 
        message: 'Please enter a valid 10-digit phone number' 
      });
    }
    
    // Validate product selection
    if (!req.body.product) {
      return res.status(400).json({ 
        message: 'Product selection is required' 
      });
    }
    
    // Verify product exists
    const product = await Product.findById(req.body.product);
    if (!product) {
      return res.status(400).json({ 
        message: 'Selected product not found' 
      });
    }
    
    let companyId;
    
    // For SuperAdmin, use the selected companyId from request
    if (req.user.role === 'super-admin') {
      companyId = req.body.companyId;
      
      // Handle fallback company ID
      if (companyId === 'default-greencall') {
        // Try to find or create GreenCall CRM company
        let defaultCompany = await Company.findOne({ name: 'GreenCall CRM' });
        if (!defaultCompany) {
          defaultCompany = await Company.create({
            name: 'GreenCall CRM',
            slug: 'greencall-crm',
            contactEmail: 'support@greencallcrm.com',
            plan: { 
              name: 'enterprise',
              leadsLimit: -1,
              usersLimit: -1,
              customersLimit: -1,
              storageLimit: 100,
              emailLimit: -1,
              smsLimit: 10000,
              features: ['full_crm'],
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
        }
        companyId = defaultCompany._id;
      }
      
      console.log('🏢 SuperAdmin selected companyId:', companyId);
    } else {
      // For other users, get company info from user
      console.log('🏢 Getting company info for user:', req.user.email);
      const companyInfo = getCompanyInfo(req.user);
      companyId = companyInfo?._id || companyInfo || req.user.companyId?._id || req.user.companyId || req.user.tenantId?._id || req.user.tenantId;
      
      console.log('🏢 User companyId:', companyId);
    }
    
    if (!companyId) {
      // For SuperAdmin, create default company if none exists
      if (req.user.role === 'super-admin') {
        let defaultCompany = await Company.findOne({ name: 'GreenCall CRM' });
        if (!defaultCompany) {
          defaultCompany = await Company.create({
            name: 'GreenCall CRM',
            slug: 'greencall-crm',
            contactEmail: 'support@greencallcrm.com',
            plan: { 
              name: 'enterprise',
              leadsLimit: -1,
              usersLimit: -1,
              customersLimit: -1,
              storageLimit: 100,
              emailLimit: -1,
              smsLimit: 10000,
              features: ['full_crm'],
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
        }
        companyId = defaultCompany._id;
      } else {
        return res.status(400).json({ 
          message: 'User must be associated with a company to create leads' 
        });
      }
    }
    
    // Ensure companyId is always set
    if (!companyId) {
      console.log('⚠️ No companyId found, creating default...');
      let defaultCompany = await Company.findOne({ name: 'GreenCall CRM' });
      if (!defaultCompany) {
        defaultCompany = await Company.create({
          name: 'GreenCall CRM',
          slug: 'greencall-crm',
          contactEmail: 'support@greencallcrm.com',
          plan: { 
            name: 'enterprise',
            leadsLimit: -1,
            usersLimit: -1,
            customersLimit: -1,
            storageLimit: 100,
            emailLimit: -1,
            smsLimit: 10000,
            features: ['full_crm'],
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
      }
      companyId = defaultCompany._id;
    }
    
    console.log('✅ Final companyId for lead:', companyId);
    
    // Get user ID - handle both _id and id properties
    const userId = req.user._id || req.user.id;
    
    console.log('👤 Setting createdBy to userId:', userId);
    
    const leadData = {
      ...req.body,
      createdBy: userId,
      companyId: companyId,
      tenantId: companyId
    };
    
    // Handle assignedTo field - only set if it's a valid non-empty string
    if (req.body.assignedTo && req.body.assignedTo.trim()) {
      leadData.assignedTo = req.body.assignedTo;
    }
    // Don't set assignedTo if it's empty - let it remain undefined
    
    console.log('📝 Lead data to be saved:', {
      createdBy: leadData.createdBy,
      assignedTo: leadData.assignedTo,
      contactPerson: leadData.contactPerson,
      companyId: leadData.companyId,
      userRole: req.user.role
    });
    
    // For SuperAdmin, ensure the lead is properly tagged for visibility
    if (req.user.role === 'super-admin') {
      leadData.createdBySuperAdmin = true;
    }
    
    console.log('📝 Final lead data before save:', {
      createdBy: leadData.createdBy,
      assignedTo: leadData.assignedTo,
      companyId: leadData.companyId,
      contactPerson: leadData.contactPerson
    });
    
    const lead = await Lead.create(leadData);
    
    // Populate the lead with user and product details
    await lead.populate('createdBy assignedTo', 'name email');
    await lead.populate('product', 'name color icon');
    
    console.log('✅ Lead created successfully:', {
      leadId: lead._id,
      contactPerson: lead.contactPerson,
      createdBy: lead.createdBy,
      assignedTo: lead.assignedTo,
      product: lead.product,
      productColor: lead.product?.color
    });
    
    // Create notification for managers/admins
    try {
      const { createLeadCreationNotification } = require('./notificationController');
      await createLeadCreationNotification(lead._id, userId);
    } catch (notifError) {
      console.error('❌ Failed to create notification:', notifError);
    }
    
    res.status(201).json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    
    // If MongoDB is not connected, return mock success
    if (error.message.includes('buffering timed out') || error.message.includes('ECONNREFUSED')) {
      const userId = req.user._id || req.user.id;
      const mockLead = {
        _id: Date.now().toString(),
        ...req.body,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log('MongoDB not available, returning mock lead:', mockLead);
      return res.status(201).json(mockLead);
    }
    
    res.status(400).json({ message: error.message });
  }
};

const getLeads = async (req, res) => {
  try {
    console.log('\n🔍 === GET ALL LEADS REQUEST ===');
    console.log('👤 User:', {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    });
    
    const { status, priority, assignedTo, search, page = 1, limit = 10000, product } = req.query;
    
    let query = { isActive: true };
    
    // Check if this is a "My Leads" request based on query parameters or route
    const isMyLeadsRequest = req.query.myLeads === 'true' || req.originalUrl.includes('/my-leads');
    
    // Role-based filtering
    if (isMyLeadsRequest) {
      // For "My Leads" section, ALL users (including admin/super-admin) see only their own leads
      console.log('🔒 My Leads request - showing only user\'s own leads for role:', req.user.role);
      query.$or = [
        { createdBy: req.user._id || req.user.id },
        { assignedTo: req.user._id || req.user.id }
      ];
    } else if (req.user.role === 'super-admin') {
      // Super-admin can see all leads from all companies (for All Leads section)
      console.log('🔑 Super-admin access - showing all leads from all companies');
    } else if (req.user.role === 'admin' || req.user.role === 'manager') {
      // Admin and Manager can see all leads (for All Leads section)
      console.log('🔑 Admin/Manager access - showing all leads');
    } else {
      // Normal users can only see leads created by them or assigned to them
      console.log('🔒 Normal user access - filtering leads');
      query.$or = [
        { createdBy: req.user._id || req.user.id },
        { assignedTo: req.user._id || req.user.id }
      ];
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (product) query.product = product;
    if (assignedTo && ['super-admin', 'admin', 'manager'].includes(req.user.role)) {
      query.assignedTo = assignedTo;
    }
    if (search) {
      const searchQuery = {
        $or: [
          { contactPerson: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
      
      if (query.$and) {
        query.$and.push(searchQuery);
      } else {
        query.$and = [searchQuery];
      }
    }
    
    console.log('🔍 Final Query:', JSON.stringify(query, null, 2));

    const leads = await Lead.find(query)
      .populate('createdBy assignedTo', 'name email role')
      .populate('product', 'name color icon')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lead.countDocuments(query);
    
    console.log('📊 Found leads:', leads.length);
    console.log('🎨 Sample product data in leads:', leads.slice(0, 2).map(l => ({
      leadId: l._id,
      productData: l.product,
      productColor: l.product?.color,
      productName: l.product?.name
    })));
    console.log('=== END GET ALL LEADS ===\n');

    res.json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(400).json({ message: error.message });
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('createdBy assignedTo', 'name email')
      .populate('product', 'name color icon')
      .populate('notes.createdBy activities.createdBy', 'name');
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Update lastViewedAt if user is the assigned user
    const userId = req.user._id || req.user.id;
    if (lead.assignedTo && lead.assignedTo._id.toString() === userId.toString()) {
      lead.lastViewedAt = new Date();
      await lead.save();
    }
    
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateLead = async (req, res) => {
  try {
    console.log('🔄 Updating lead:', req.params.id, 'with data:', req.body);
    
    // Clean the request body to prevent validation errors
    const updateData = { ...req.body };
    
    // Handle notes field - if it's a string, don't update it directly
    if (typeof updateData.notes === 'string') {
      console.log('⚠️ Notes field is string, removing from update data');
      delete updateData.notes;
    }
    
    // Handle assignedTo field - only set if it's a valid non-empty string
    if (updateData.assignedTo === '') {
      delete updateData.assignedTo;
    }
    
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy assignedTo', 'name email role');
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Log assignment activity
    if (req.body.assignedTo && req.body.assignedTo !== '') {
      lead.activities.push({
        type: 'status_change',
        description: `Lead assigned to ${lead.assignedTo?.name || 'user'}`,
        createdBy: req.user._id || req.user.id
      });
      await lead.save();
    }
    
    console.log('✅ Lead updated successfully');
    res.json(lead);
  } catch (error) {
    console.error('❌ Error updating lead:', error);
    res.status(400).json({ message: error.message });
  }
};

const deleteLead = async (req, res) => {
  try {
    console.log('Deleting lead with ID:', req.params.id);
    console.log('User role:', req.user.role, 'User ID:', req.user._id);
    
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Check permissions
    const isAdminOrSuperAdmin = ['admin', 'super-admin'].includes(req.user.role);
    const isOwner = lead.createdBy.toString() === req.user._id.toString();
    
    if (!isAdminOrSuperAdmin && !isOwner) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete leads created by you.' 
      });
    }
    
    await Lead.findByIdAndDelete(req.params.id);
    
    console.log('Lead deleted successfully:', lead._id);
    res.json({ message: 'Lead deleted successfully', deletedId: lead._id });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(400).json({ message: error.message });
  }
};

const addNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const userId = req.user._id || req.user.id;
    lead.notes.push({
      content: req.body.content,
      createdBy: userId
    });

    await lead.save();
    await lead.populate('notes.createdBy', 'name');
    
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const assignLead = async (req, res) => {
  try {
    const { leadId, assignedTo } = req.body;
    
    console.log('🔄 Assigning lead:', { leadId, assignedTo, userRole: req.user.role, assignedBy: req.user.name });
    
    // Only admin, manager, and super-admin can assign leads
    if (!['admin', 'manager', 'super-admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to assign leads' });
    }
    
    // Verify the user being assigned to exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({ message: 'Assigned user not found' });
    }
    
    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { 
        assignedTo,
        status: 'assigned', // Update status to assigned
        assignedAt: new Date(),
        assignedBy: req.user._id || req.user.id
      },
      { new: true, runValidators: true }
    ).populate('createdBy assignedTo assignedBy', 'name email role');
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Add activity log
    lead.activities.push({
      type: 'assignment',
      description: `Lead assigned to ${assignedUser.name} (${assignedUser.role}) by ${req.user.name}`,
      createdBy: req.user._id || req.user.id,
      timestamp: new Date()
    });
    await lead.save();
    
    // Create notification for assigned user
    const { createLeadAssignmentNotification } = require('./notificationController');
    await createLeadAssignmentNotification(leadId, assignedTo, req.user._id || req.user.id);
    
    // Send email to assigned user
    try {
      const { sendLeadAssignmentEmail } = require('../services/emailService');
      await sendLeadAssignmentEmail(assignedUser, lead, req.user);
      console.log('📧 Assignment email sent to:', assignedUser.email);
    } catch (emailError) {
      console.error('❌ Failed to send assignment email:', emailError);
      // Don't fail the assignment if email fails
    }
    
    console.log('✅ Lead assigned successfully:', {
      leadId: lead._id,
      assignedTo: assignedUser.name,
      assignedBy: req.user.name,
      status: lead.status
    });
    
    res.json({ 
      success: true,
      message: `Lead assigned successfully to ${assignedUser.name} (${assignedUser.role})`, 
      lead,
      assignment: {
        assignedTo: assignedUser.name,
        assignedToRole: assignedUser.role,
        assignedBy: req.user.name,
        assignedAt: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Error assigning lead:', error);
    res.status(400).json({ message: error.message });
  }
};

const getMyLeads = async (req, res) => {
  const mongoose = require('mongoose');
  try {
    console.log('\n🔍 === MY LEADS REQUEST ===');
    console.log('👤 User ID:', req.user._id);
    console.log('👤 User Email:', req.user.email);
    console.log('👤 User Role:', req.user.role);
    
    const { status, priority, search, page = 1, limit = 10000 } = req.query;
    
    let query = { isActive: true };
    
    // All users (including super admin) get leads created by them or assigned to them
    const userId = req.user._id || req.user.id;
    console.log('🔑 Using userId for query:', userId, 'Type:', typeof userId);
    
    // Convert to ObjectId if it's a string
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    console.log('🔑 Converted to ObjectId:', userObjectId);
    
    // First, let's check all leads this user created
    const createdLeads = await Lead.find({ createdBy: userObjectId, isActive: true }).select('_id contactPerson createdBy');
    console.log('📊 Leads created by this user:', createdLeads.length);
    if (createdLeads.length > 0) {
      console.log('📊 Sample created lead:', {
        id: createdLeads[0]._id,
        contactPerson: createdLeads[0].contactPerson,
        createdBy: createdLeads[0].createdBy
      });
    }
    
    // Check leads assigned to this user
    const assignedLeads = await Lead.find({ assignedTo: userObjectId, isActive: true }).select('_id contactPerson assignedTo');
    console.log('📊 Leads assigned to this user:', assignedLeads.length);
    
    query.$or = [
      { createdBy: userObjectId },  // Leads created by this user
      { assignedTo: userObjectId }  // Leads assigned to this user
    ];
    
    console.log('🔍 Query:', JSON.stringify(query, null, 2));
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      const searchQuery = {
        $or: [
          { contactPerson: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
      
      if (query.$and) {
        query.$and.push(searchQuery);
      } else {
        query.$and = [searchQuery];
      }
    }

    const leads = await Lead.find(query)
      .populate('createdBy assignedTo', 'name email role')
      .populate('product', 'name color icon')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lead.countDocuments(query);
    
    console.log('📊 Found leads count:', leads.length);
    console.log('📊 Total leads:', total);
    if (leads.length > 0) {
      console.log('📊 First lead details:', {
        id: leads[0]._id,
        contactPerson: leads[0].contactPerson,
        createdBy: leads[0].createdBy,
        assignedTo: leads[0].assignedTo
      });
    }
    console.log('=== END MY LEADS ===\n');

    res.json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('❌ Error in getMyLeads:', error);
    res.status(400).json({ message: error.message });
  }
};

const getLeadsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10000 } = req.query;
    
    let query = { isActive: true, product: productId };
    
    // Role-based filtering
    if (req.user.role === 'super-admin') {
      // Super-admin can see all leads
    } else if (req.user.role === 'admin' || req.user.role === 'manager') {
      // Admin and Manager can see all leads
    } else {
      // Normal users can only see leads created by them or assigned to them
      query.$or = [
        { createdBy: req.user._id || req.user.id },
        { assignedTo: req.user._id || req.user.id }
      ];
    }
    
    const leads = await Lead.find(query)
      .populate('createdBy assignedTo', 'name email role')
      .populate('product', 'name color icon')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lead.countDocuments(query);
    
    res.json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching leads by product:', error);
    res.status(400).json({ message: error.message });
  }
};

const getProductLeadStats = async (req, res) => {
  try {
    let matchQuery = { isActive: true };
    
    // Role-based filtering
    if (req.user.role === 'super-admin') {
      // Super-admin can see all leads
    } else if (req.user.role === 'admin' || req.user.role === 'manager') {
      // Admin and Manager can see all leads
    } else {
      // Normal users can only see leads created by them or assigned to them
      matchQuery.$or = [
        { createdBy: req.user._id || req.user.id },
        { assignedTo: req.user._id || req.user.id }
      ];
    }
    
    const stats = await Lead.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$product',
          productName: { $first: '$productInfo.name' },
          productColor: { $first: '$productInfo.color' },
          productIcon: { $first: '$productInfo.icon' },
          totalLeads: { $sum: 1 },
          newLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', 'new'] }, 1, 0]
            }
          },
          qualifiedLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0]
            }
          },
          closedWonLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', 'closed-won'] }, 1, 0]
            }
          },
          totalValue: { $sum: '$estimatedValue' },
          avgValue: { $avg: '$estimatedValue' }
        }
      },
      { $sort: { totalLeads: -1 } }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching product lead stats:', error);
    res.status(400).json({ message: error.message });
  }
};

const getUserProductHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const history = await Lead.aggregate([
      {
        $match: {
          createdBy: userId,
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$product',
          productName: { $first: '$productInfo.name' },
          productColor: { $first: '$productInfo.color' },
          productIcon: { $first: '$productInfo.icon' },
          count: { $sum: 1 },
          lastUsed: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1, lastUsed: -1 } }
    ]);
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching user product history:', error);
    res.status(400).json({ message: error.message });
  }
};

const acceptGroupLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const userId = req.user._id || req.user.id;
    
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Check if lead is in pending-acceptance status
    if (lead.status !== 'pending-acceptance') {
      return res.status(400).json({ message: 'Lead is not available for acceptance' });
    }
    
    // Assign lead to current user and change status
    lead.assignedTo = userId;
    lead.assignedToGroup = null;
    lead.status = 'contacted';
    lead.assignedAt = new Date();
    
    await lead.save();
    await lead.populate('assignedTo', 'name email role');
    
    res.json({ success: true, message: 'Lead accepted successfully', lead });
  } catch (error) {
    console.error('Error accepting lead:', error);
    res.status(400).json({ message: error.message });
  }
};

const declineGroupLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Just return success - lead remains in group pool
    res.json({ success: true, message: 'Lead declined' });
  } catch (error) {
    console.error('Error declining lead:', error);
    res.status(400).json({ message: error.message });
  }
};

const getPendingGroupLeads = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Determine which group leads to show based on user role
    let groupFilter = 'sales'; // Default to sales
    if (userRole === 'sales' || userRole === 'sales-rep' || userRole === 'senior-manager' || userRole === 'sales-manager') {
      groupFilter = 'sales';
    } else if (userRole === 'marketing') {
      groupFilter = 'marketing';
    } else if (userRole === 'support') {
      groupFilter = 'support';
    }
    
    const query = {
      isActive: true,
      status: 'pending-acceptance',
      assignedToGroup: groupFilter
    };
    
    const leads = await Lead.find(query)
      .populate('createdBy', 'name email')
      .populate('product', 'name color icon')
      .sort({ createdAt: -1 });
    
    res.json({ leads });
  } catch (error) {
    console.error('Error fetching pending group leads:', error);
    res.status(500).json({ message: error.message });
  }
};

const getSalesTeamStats = async (req, res) => {
  try {
    // Get all sales users
    const salesUsers = await User.find({
      role: { $in: ['sales', 'sales-rep', 'sales-manager', 'senior-manager'] },
      isActive: true
    }).select('name email role');
    
    // Get stats for each user
    const stats = await Promise.all(salesUsers.map(async (user) => {
      // Count accepted leads (assigned to this user)
      const acceptedCount = await Lead.countDocuments({
        assignedTo: user._id,
        isActive: true
      });
      
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        acceptedLeads: acceptedCount
      };
    }));
    
    // Get pending group leads count
    const pendingCount = await Lead.countDocuments({
      status: 'pending-acceptance',
      assignedToGroup: 'sales',
      isActive: true
    });
    
    res.json({ stats, pendingLeads: pendingCount });
  } catch (error) {
    console.error('Error fetching sales team stats:', error);
    res.status(500).json({ message: error.message });
  }
};

const logActivity = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const userId = req.user._id || req.user.id;
    lead.activities.push({
      type: req.body.type || 'note',
      description: req.body.description,
      createdBy: userId
    });

    await lead.save();
    await lead.populate('activities.createdBy', 'name');
    
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addNote,
  logActivity,
  assignLead,
  getMyLeads,
  getLeadsByProduct,
  getProductLeadStats,
  getUserProductHistory,
  acceptGroupLead,
  declineGroupLead,
  getPendingGroupLeads,
  getSalesTeamStats
};