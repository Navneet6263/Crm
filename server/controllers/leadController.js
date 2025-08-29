const Lead = require('../models/Lead');
const User = require('../models/User');

const createLead = async (req, res) => {
  try {
    console.log('Creating lead with data:', req.body);
    console.log('User:', {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      tenantId: req.user.tenantId
    });
    
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
    
    const leadData = {
      ...req.body,
      createdBy: req.user._id,
      assignedTo: req.body.assignedTo && req.body.assignedTo.trim() ? req.body.assignedTo : req.user._id  // Auto-assign to creator (including super admin)
    };
    
    console.log('📝 Lead data to be saved:', {
      createdBy: leadData.createdBy,
      assignedTo: leadData.assignedTo,
      contactPerson: leadData.contactPerson
    });
    
    // Set tenantId if user has one
    if (req.user.tenantId) {
      leadData.tenantId = req.user.tenantId;
    }
    
    const lead = await Lead.create(leadData);
    
    await lead.populate('createdBy assignedTo', 'name email');
    console.log('Lead created successfully:', lead);
    res.status(201).json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    
    // If MongoDB is not connected, return mock success
    if (error.message.includes('buffering timed out') || error.message.includes('ECONNREFUSED')) {
      const mockLead = {
        _id: Date.now().toString(),
        ...req.body,
        createdBy: req.user._id,
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
    
    const { status, priority, assignedTo, search, page = 1, limit = 50 } = req.query;
    
    let query = { isActive: true };
    
    // Role-based filtering
    if (req.user.role === 'super-admin' || req.user.role === 'admin') {
      // Admin and super-admin can see all leads
      console.log('🔑 Admin/Super-admin access - showing all leads');
      console.log('🔑 User role:', req.user.role);
    } else {
      // Normal users (including sales) can only see leads created by them or assigned to them
      console.log('🔒 Normal user access - filtering leads');
      query.$or = [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ];
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
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
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lead.countDocuments(query);
    
    console.log('📊 Found leads:', leads.length);
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
      .populate('notes.createdBy activities.createdBy', 'name');
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy assignedTo', 'name email role');
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Log assignment activity
    if (req.body.assignedTo) {
      lead.activities.push({
        type: 'status_change',
        description: `Lead assigned to ${lead.assignedTo?.name || 'user'}`,
        createdBy: req.user._id
      });
      await lead.save();
    }
    
    res.json(lead);
  } catch (error) {
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

    lead.notes.push({
      content: req.body.content,
      createdBy: req.user._id
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
    
    console.log('Assigning lead:', { leadId, assignedTo, userRole: req.user.role });
    
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
      { assignedTo },
      { new: true, runValidators: true }
    ).populate('createdBy assignedTo', 'name email role');
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Add activity log
    lead.activities.push({
      type: 'status_change',
      description: `Lead assigned to ${lead.assignedTo?.name || 'user'} by ${req.user.name}`,
      createdBy: req.user._id
    });
    await lead.save();
    
    console.log('Lead assigned successfully:', lead._id);
    res.json({ message: 'Lead assigned successfully', lead });
  } catch (error) {
    console.error('Error assigning lead:', error);
    res.status(400).json({ message: error.message });
  }
};

const getMyLeads = async (req, res) => {
  try {
    console.log('\n🔍 === MY LEADS REQUEST ===');
    console.log('👤 User ID:', req.user._id);
    console.log('👤 User Email:', req.user.email);
    console.log('👤 User Role:', req.user.role);
    
    const { status, priority, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    // All users (including super admin) get leads created by them or assigned to them
    query.$or = [
      { createdBy: req.user._id },  // Leads created by this user
      { assignedTo: req.user._id }  // Leads assigned to this user
    ];
    
    console.log('🔍 Query:', JSON.stringify(query, null, 2));
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$text = { $search: search };
    }

    const leads = await Lead.find(query)
      .populate('createdBy assignedTo', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lead.countDocuments(query);
    
    console.log('📊 Found leads count:', leads.length);
    console.log('📊 Total leads:', total);
    if (leads.length > 0) {
      console.log('📊 First lead createdBy:', leads[0].createdBy);
    }
    console.log('=== END MY LEADS ===\n');

    res.json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
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
  assignLead,
  getMyLeads
};