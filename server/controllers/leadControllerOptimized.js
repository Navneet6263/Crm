const Lead = require('../models/Lead');

// Optimized getLeads - Fast API Response
const getLeadsOptimized = async (req, res) => {
  try {
    const { status, priority, assignedTo, search, page = 1, limit = 10000, product } = req.query;
    let query = { isActive: true };
    
    if (req.user.companyId) query.companyId = req.user.companyId;
    
    const isMyLeadsRequest = req.query.myLeads === 'true' || req.originalUrl.includes('/my-leads');
    
    if (isMyLeadsRequest) {
      query.$or = [
        { createdBy: req.user._id || req.user.id },
        { assignedTo: req.user._id || req.user.id }
      ];
    } else if (req.user.role === 'super-admin') {
      delete query.companyId;
    } else if (!['admin', 'manager'].includes(req.user.role)) {
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
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { contactPerson: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .select('contactPerson companyName email phone status priority estimatedValue assignedTo createdBy product createdAt assignedAt address')
        .populate('createdBy assignedTo', 'name email')
        .populate('product', 'name color icon')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean(),
      Lead.countDocuments(query)
    ]);

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

// Optimized getMyLeads - Fast API Response
const getMyLeadsOptimized = async (req, res) => {
  const mongoose = require('mongoose');
  try {
    const { status, priority, search, page = 1, limit = 10000 } = req.query;
    const userObjectId = new mongoose.Types.ObjectId(req.user._id);
    
    let query = {
      isActive: true,
      $or: [
        { createdBy: userObjectId },
        { assignedTo: userObjectId }
      ]
    };
    
    if (req.user.companyId) query.companyId = req.user.companyId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { contactPerson: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .select('contactPerson companyName email phone status priority estimatedValue assignedTo createdBy product createdAt assignedAt address')
        .populate('createdBy assignedTo', 'name email')
        .populate('product', 'name color icon')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean(),
      Lead.countDocuments(query)
    ]);

    res.json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error in getMyLeads:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getLeadsOptimized, getMyLeadsOptimized };
