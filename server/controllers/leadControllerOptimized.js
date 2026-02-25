const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const User = require('../models/User');

const getCompanyId = (user) => user?.companyId?._id || user?.companyId || user?.tenantId?._id || user?.tenantId;


const attachUsersToLeads = async (leads) => {
  if (!Array.isArray(leads) || leads.length === 0) return leads;

  const ids = new Set();
  for (const lead of leads) {
    const createdBy = lead?.createdBy;
    const assignedTo = lead?.assignedTo;

    if (createdBy) {
      const id = typeof createdBy === 'string' ? createdBy : createdBy.toString?.();
      if (id && mongoose.Types.ObjectId.isValid(id)) ids.add(id);
    }
    if (assignedTo) {
      const id = typeof assignedTo === 'string' ? assignedTo : assignedTo.toString?.();
      if (id && mongoose.Types.ObjectId.isValid(id)) ids.add(id);
    }
  }

  if (ids.size === 0) return leads;

  const users = await User.find({ _id: { $in: Array.from(ids) } })
    .select('name email role')
    .lean();

  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  return leads.map(lead => {
    const createdBy = lead?.createdBy;
    const assignedTo = lead?.assignedTo;

    const createdId = typeof createdBy === 'string' ? createdBy : createdBy?.toString?.();
    const assignedId = typeof assignedTo === 'string' ? assignedTo : assignedTo?.toString?.();

    return {
      ...lead,
      createdBy: createdId && userMap.has(createdId) ? userMap.get(createdId) : createdBy,
      assignedTo: assignedId && userMap.has(assignedId) ? userMap.get(assignedId) : assignedTo
    };
  });
};


// Optimized getLeads - Fast API Response
const getLeadsOptimized = async (req, res) => {
  try {
    const { status, priority, assignedTo, search, page = 1, limit = 10000, product, includeTotal = 'true' } = req.query;
    const limitNum = Number(limit) > 0 ? Number(limit) : 10000;
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const userId = req.user._id || req.user.id;

    const companyId = getCompanyId(req.user);
    const hasCompanyId = companyId && mongoose.Types.ObjectId.isValid(companyId);

    let query = { isActive: true };

    if (hasCompanyId) query.companyId = companyId;

    const isMyLeadsRequest = req.query.myLeads === 'true' || req.originalUrl.includes('/my-leads');

    if (isMyLeadsRequest) {
      query.$or = [
        { createdBy: userId },
        { assignedTo: userId }
      ];
    } else if (req.user.role === 'super-admin') {
      delete query.companyId;
    } else if (!['admin', 'manager'].includes(req.user.role)) {
      query.$or = [
        { createdBy: userId },
        { assignedTo: userId }
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

    const shouldIncludeTotal = includeTotal === 'true';

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .select('contactPerson companyName email phone status priority estimatedValue assignedTo createdBy product createdAt assignedAt address leadSource industry requirements notes')
                .populate('product', 'name color icon')
        .sort({ createdAt: -1, _id: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .lean({ virtuals: true }),
      shouldIncludeTotal ? Lead.countDocuments(query) : Promise.resolve(undefined)
    ]);

    const enrichedLeads = await attachUsersToLeads(leads);

    const response = {
      leads: enrichedLeads,
      currentPage: pageNum
    };

    if (shouldIncludeTotal) {
      response.totalPages = Math.ceil(total / limitNum);
      response.total = total;
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(400).json({ message: error.message });
  }
};

// Optimized getMyLeads - Fast API Response
const getMyLeadsOptimized = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 10000, includeTotal = 'true' } = req.query;
    const limitNum = Number(limit) > 0 ? Number(limit) : 10000;
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const userId = req.user._id || req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const companyId = getCompanyId(req.user);
    const hasCompanyId = companyId && mongoose.Types.ObjectId.isValid(companyId);

    let query = {
      isActive: true,
      $or: [
        { createdBy: userObjectId },
        { assignedTo: userObjectId }
      ]
    };

    if (hasCompanyId) query.companyId = companyId;
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

    const shouldIncludeTotal = includeTotal === 'true';

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .select('contactPerson companyName email phone status priority estimatedValue assignedTo createdBy product createdAt assignedAt address leadSource industry requirements notes')
                .populate('product', 'name color icon')
        .sort({ createdAt: -1, _id: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .lean({ virtuals: true }),
      shouldIncludeTotal ? Lead.countDocuments(query) : Promise.resolve(undefined)
    ]);

    const enrichedLeads = await attachUsersToLeads(leads);

    const response = {
      leads: enrichedLeads,
      currentPage: pageNum
    };

    if (shouldIncludeTotal) {
      response.totalPages = Math.ceil(total / limitNum);
      response.total = total;
    }

    res.json(response);
  } catch (error) {
    console.error('Error in getMyLeads:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getLeadsOptimized, getMyLeadsOptimized };
