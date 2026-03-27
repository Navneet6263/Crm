const Customer = require('../models/Customer');
const Company = require('../models/Company');

const getUserId = (user) => user?._id || user?.id || null;

const getStoredCompanyId = (user) => user?.companyId?._id || user?.companyId || user?.tenantId?._id || user?.tenantId || null;
const getCompanyId = (user, fallback = null) => {
  if (user?.role === 'super-admin') {
    return fallback || getStoredCompanyId(user) || null;
  }
  return getStoredCompanyId(user) || fallback || null;
};
const hasElevatedCustomerAccess = (role) => ['super-admin', 'admin', 'manager', 'senior-manager'].includes(role);
const buildCompanyScope = (companyId) => (
  companyId
    ? { $or: [{ companyId }, { tenantId: companyId }] }
    : { _id: null }
);
const buildOwnershipScope = (userId) => (
  userId
    ? { $or: [{ createdBy: userId }, { assignedTo: userId }] }
    : { _id: null }
);
const buildScopedQuery = (conditions) => {
  const validConditions = conditions.filter(Boolean);
  if (validConditions.length === 0) return {};
  return validConditions.length === 1 ? validConditions[0] : { $and: validConditions };
};

const normalizePhone = (phone) => String(phone || '').replace(/[^\d]/g, '');

const applyNextFollowUp = (customer) => {
  if (!customer || !Array.isArray(customer.followUps)) {
    return;
  }

  const pendingFollowUps = customer.followUps
    .filter((followUp) => followUp?.status === 'pending' && followUp?.dueDate)
    .sort((first, second) => new Date(first.dueDate).getTime() - new Date(second.dueDate).getTime());

  customer.nextFollowUp = pendingFollowUps.length > 0 ? pendingFollowUps[0].dueDate : null;
};

const populateCustomer = (query) => query
  .populate('createdBy assignedTo', 'name email role')
  .populate('noteHistory.createdBy', 'name email')
  .populate('followUps.createdBy followUps.completedBy', 'name email');

const buildCustomerQuery = ({ req, status, customerType, assignedTo, search, followUpStatus, companyId }) => {
  const filters = [{ isActive: true }];

  if (req.user.role !== 'super-admin' || companyId) {
    filters.push(buildCompanyScope(companyId));
  }

  if (!hasElevatedCustomerAccess(req.user.role)) {
    filters.push(buildOwnershipScope(getUserId(req.user)));
  }

  if (status && status !== 'all') filters.push({ status });
  if (customerType && customerType !== 'all') filters.push({ customerType });
  if (assignedTo && assignedTo !== 'all') {
    filters.push(assignedTo === 'unassigned' ? { assignedTo: null } : { assignedTo });
  }
  if (followUpStatus && followUpStatus !== 'all') {
    filters.push({ 'followUps.status': followUpStatus });
  }
  if (search) {
    filters.push({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ]
    });
  }

  return buildScopedQuery(filters);
};

const findAccessibleCustomer = (req, customerId) => {
  const filters = [{ _id: customerId }, { isActive: true }];
  const companyId = getCompanyId(req.user);

  if (req.user.role !== 'super-admin') {
    filters.push(buildCompanyScope(companyId));
  }

  if (!hasElevatedCustomerAccess(req.user.role)) {
    filters.push(buildOwnershipScope(getUserId(req.user)));
  }

  return Customer.findOne(buildScopedQuery(filters));
};

const createCustomer = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const requestedCompanyId = req.body.companyId || req.body.tenantId || null;
    const companyId = getCompanyId(req.user, requestedCompanyId);

    if (!userId) {
      return res.status(401).json({ message: 'Invalid user authentication' });
    }

    if (!companyId) {
      return res.status(400).json({ message: 'Customer must be created under a company' });
    }

    const cleanedPhone = normalizePhone(req.body.phone);
    const email = String(req.body.email || '').trim().toLowerCase();

    const existingCustomer = await Customer.findOne({
      companyId,
      isActive: true,
      $or: [
        { email },
        { phone: cleanedPhone }
      ]
    });

    if (existingCustomer) {
      const duplicateField = existingCustomer.email === email ? 'Email' : 'Phone';
      return res.status(400).json({
        message: `${duplicateField} already exists for this company`
      });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit phone number'
      });
    }

    const company = await Company.findById(companyId);
    if (company && typeof company.canAddCustomer === 'function' && !company.canAddCustomer()) {
      return res.status(400).json({
        message: `Customer limit reached. Current plan allows ${company.plan.customersLimit} customers.`,
        currentCustomers: company.usage.currentCustomers,
        maxCustomers: company.plan.customersLimit
      });
    }

    const initialFollowUp = req.body.initialFollowUp;
    const followUps = [];
    if (initialFollowUp?.title?.trim() && initialFollowUp?.dueDate) {
      followUps.push({
        title: initialFollowUp.title.trim(),
        description: String(initialFollowUp.description || '').trim(),
        dueDate: new Date(initialFollowUp.dueDate),
        createdBy: userId
      });
    }

    const customer = await Customer.create({
      companyId,
      tenantId: companyId,
      name: String(req.body.name || '').trim(),
      companyName: String(req.body.companyName || '').trim(),
      email,
      phone: cleanedPhone,
      address: req.body.address || {},
      industry: String(req.body.industry || '').trim(),
      customerType: req.body.customerType || 'business',
      status: req.body.status || 'active',
      assignedTo: req.body.assignedTo || undefined,
      createdBy: userId,
      convertedFrom: req.body.convertedFrom || undefined,
      totalValue: Number(req.body.totalValue || 0),
      lastInteraction: new Date(),
      notes: String(req.body.notes || '').trim(),
      noteHistory: req.body.notes ? [{
        content: String(req.body.notes).trim(),
        createdBy: userId
      }] : [],
      followUps,
      tags: Array.isArray(req.body.tags) ? req.body.tags : []
    });

    applyNextFollowUp(customer);
    await customer.save();

    if (company) {
      await Company.findByIdAndUpdate(companyId, {
        $inc: { 'usage.currentCustomers': 1 }
      });
    }

    const populatedCustomer = await populateCustomer(Customer.findById(customer._id));
    res.status(201).json(populatedCustomer);
  } catch (error) {
    console.error('Customer creation error:', error);
    res.status(400).json({ message: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const {
      status,
      customerType,
      assignedTo,
      search,
      followUpStatus,
      page = 1,
      limit = 50,
      companyId: requestedCompanyId
    } = req.query;

    const companyId = getCompanyId(req.user, requestedCompanyId);
    const limitNum = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const pageNum = Math.max(Number(page) || 1, 1);

    const query = buildCustomerQuery({
      req,
      status,
      customerType,
      assignedTo,
      search,
      followUpStatus,
      companyId
    });

    const [customers, total] = await Promise.all([
      populateCustomer(
        Customer.find(query)
          .select('name email phone companyName address industry status customerType createdBy assignedTo createdAt updatedAt totalValue lastInteraction notes noteHistory followUps nextFollowUp')
          .sort({ updatedAt: -1, createdAt: -1 })
          .limit(limitNum)
          .skip((pageNum - 1) * limitNum)
      ).lean(),
      Customer.countDocuments(query)
    ]);

    res.json({
      customers,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(400).json({ message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await populateCustomer(
      findAccessibleCustomer(req, req.params.id)
    ).lean();

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer by id error:', error);
    res.status(400).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await findAccessibleCustomer(req, req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const cleanedPhone = normalizePhone(req.body.phone || customer.phone);
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit phone number'
      });
    }

    const duplicateCustomer = await Customer.findOne({
      _id: { $ne: customer._id },
      companyId: customer.companyId,
      isActive: true,
      $or: [
        { email: String(req.body.email || customer.email).trim().toLowerCase() },
        { phone: cleanedPhone }
      ]
    });

    if (duplicateCustomer) {
      return res.status(400).json({ message: 'Email or phone already exists for this company' });
    }

    customer.name = String(req.body.name ?? customer.name).trim();
    customer.companyName = String(req.body.companyName ?? customer.companyName).trim();
    customer.email = String(req.body.email ?? customer.email).trim().toLowerCase();
    customer.phone = cleanedPhone;
    customer.address = req.body.address || customer.address;
    customer.industry = String(req.body.industry ?? customer.industry ?? '').trim();
    customer.customerType = req.body.customerType || customer.customerType;
    customer.status = req.body.status || customer.status;
    customer.assignedTo = req.body.assignedTo === '' ? null : (req.body.assignedTo || customer.assignedTo);
    customer.totalValue = Number(req.body.totalValue ?? customer.totalValue ?? 0);
    customer.notes = typeof req.body.notes === 'string' ? req.body.notes.trim() : customer.notes;
    customer.tags = Array.isArray(req.body.tags) ? req.body.tags : customer.tags;
    customer.lastInteraction = new Date();

    const initialFollowUp = req.body.initialFollowUp;
    if (initialFollowUp?.title?.trim() && initialFollowUp?.dueDate) {
      customer.followUps.push({
        title: initialFollowUp.title.trim(),
        description: String(initialFollowUp.description || '').trim(),
        dueDate: new Date(initialFollowUp.dueDate),
        createdBy: getUserId(req.user)
      });
    }

    applyNextFollowUp(customer);
    await customer.save();

    const populatedCustomer = await populateCustomer(Customer.findById(customer._id));
    res.json(populatedCustomer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(400).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await findAccessibleCustomer(req, req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.isActive = false;
    await customer.save();

    if (customer.companyId) {
      await Company.findByIdAndUpdate(customer.companyId, {
        $inc: { 'usage.currentCustomers': -1 }
      });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(400).json({ message: error.message });
  }
};

const addNote = async (req, res) => {
  try {
    const customer = await findAccessibleCustomer(req, req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const content = String(req.body.content || '').trim();
    if (!content) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const userId = getUserId(req.user);

    customer.noteHistory.push({
      content,
      createdBy: userId
    });
    customer.notes = content;
    customer.lastInteraction = new Date();

    await customer.save();
    const populatedCustomer = await populateCustomer(Customer.findById(customer._id));
    res.json(populatedCustomer);
  } catch (error) {
    console.error('Add customer note error:', error);
    res.status(400).json({ message: error.message });
  }
};

const addFollowUp = async (req, res) => {
  try {
    const customer = await findAccessibleCustomer(req, req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const title = String(req.body.title || '').trim();
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;

    if (!title) {
      return res.status(400).json({ message: 'Follow-up title is required' });
    }
    if (!dueDate || Number.isNaN(dueDate.getTime())) {
      return res.status(400).json({ message: 'Valid follow-up due date is required' });
    }

    customer.followUps.push({
      title,
      description: String(req.body.description || '').trim(),
      dueDate,
      createdBy: getUserId(req.user)
    });
    customer.lastInteraction = new Date();
    applyNextFollowUp(customer);

    await customer.save();
    const populatedCustomer = await populateCustomer(Customer.findById(customer._id));
    res.json(populatedCustomer);
  } catch (error) {
    console.error('Add customer follow-up error:', error);
    res.status(400).json({ message: error.message });
  }
};

const updateFollowUpStatus = async (req, res) => {
  try {
    const customer = await findAccessibleCustomer(req, req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const followUp = customer.followUps.id(req.params.followUpId);
    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    const nextStatus = req.body.status;
    if (!['pending', 'completed', 'cancelled'].includes(nextStatus)) {
      return res.status(400).json({ message: 'Invalid follow-up status' });
    }

    followUp.status = nextStatus;
    if (nextStatus === 'completed') {
      followUp.completedAt = new Date();
      followUp.completedBy = getUserId(req.user);
    } else {
      followUp.completedAt = null;
      followUp.completedBy = null;
    }

    customer.lastInteraction = new Date();
    applyNextFollowUp(customer);

    await customer.save();
    const populatedCustomer = await populateCustomer(Customer.findById(customer._id));
    res.json(populatedCustomer);
  } catch (error) {
    console.error('Update customer follow-up error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addNote,
  addFollowUp,
  updateFollowUpStatus
};
