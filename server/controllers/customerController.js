const Customer = require('../models/Customer');

const createCustomer = async (req, res) => {
  try {
    console.log('\n🔄 === CUSTOMER CREATION REQUEST ===');
    console.log('📝 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('👤 Authenticated User:', req.user);
    
    // Check for duplicate email or phone
    const existingCustomer = await Customer.findOne({
      $or: [
        { email: req.body.email },
        { phone: req.body.phone }
      ],
      isActive: true
    });
    
    if (existingCustomer) {
      const duplicateField = existingCustomer.email === req.body.email ? 'Email' : 'Phone';
      console.log('❌ Duplicate found:', duplicateField);
      return res.status(400).json({ 
        message: `${duplicateField} already exists! This contact is already registered.` 
      });
    }
    
    // Validate phone number (should be 10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(req.body.phone.replace(/[^\d]/g, ''))) {
      console.log('❌ Invalid phone number:', req.body.phone);
      return res.status(400).json({ 
        message: 'Please enter a valid 10-digit phone number' 
      });
    }
    
    // Get user ID - handle both _id and id properties
    const userId = req.user._id || req.user.id;
    console.log('👤 Using user ID:', userId);
    
    const customerData = {
      ...req.body,
      createdBy: userId
    };
    
    // Set tenantId if user has one
    if (req.user.tenantId) {
      customerData.tenantId = req.user.tenantId;
    }
    
    const customer = await Customer.create(customerData);
    
    console.log('✅ Customer created successfully:', customer._id);
    await customer.populate('createdBy assignedTo', 'name email');
    console.log('=== END CUSTOMER CREATION ===\n');
    
    res.status(201).json(customer);
  } catch (error) {
    console.error('\n❌ === CUSTOMER CREATION ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('=== END ERROR ===\n');
    
    res.status(400).json({ message: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const { status, customerType, assignedTo, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (status) query.status = status;
    if (customerType) query.customerType = customerType;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query)
      .select('name email phone companyName status customerType industry createdBy assignedTo createdAt updatedAt')
      .populate('createdBy assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Customer.countDocuments(query);

    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .select('name email phone companyName status customerType industry createdBy assignedTo createdAt updatedAt noteHistory')
      .populate('createdBy assignedTo', 'name email')
      .populate('noteHistory.createdBy', 'name');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .select('name email phone companyName status customerType industry createdBy assignedTo createdAt updatedAt')
    .populate('createdBy assignedTo', 'name email');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addNote = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get user ID - handle both _id and id properties
    const userId = req.user._id || req.user.id;
    
    customer.noteHistory.push({
      content: req.body.content,
      createdBy: userId
    });

    await customer.save();
    await customer.populate('noteHistory.createdBy', 'name');
    
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addNote
};