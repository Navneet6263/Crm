const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to database
let isDBConnected = false;
connectDB().then(() => {
  isDBConnected = true;
}).catch(err => {
  console.error('Database connection failed:', err.message);
});

// Import models
const User = require('./models/User');
const Lead = require('./models/Lead');
const Customer = require('./models/Customer');
const DemoRequest = require('./models/DemoRequest');
const Notification = require('./models/Notification');
const Communication = require('./models/Communication');

// Import routes
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const customerRoutes = require('./routes/customerRoutes');
const companyRoutes = require('./routes/companyRoutes');
const enhancedSupportRoutes = require('./routes/enhancedSupportRoutes');
const dataRoutes = require('./routes/dataRoutes');
const otpRoutes = require('./routes/otpRoutes');
const smsRoutes = require('./routes/smsRoutes');
const oauthRoutes = require('./routes/oauth');
const notificationRoutes = require('./routes/notificationRoutes');
const taskRoutes = require('./routes/taskRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const { initializePassport } = require('./controllers/oauthController');
const { createLeadAssignmentNotification, createLeadCreationNotification } = require('./controllers/notificationController');



const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Import security middleware
const { loginLimiter, apiLimiter } = require('./middleware/rateLimiter');
const ipWhitelist = require('./middleware/ipWhitelist');
const { auditLogger, checkTokenBlacklist, monitorBulkExport } = require('./middleware/security');

// Apply rate limiting
app.use('/api', apiLimiter);

// Middleware
app.use(cors({
  origin: [
    'https://crm-two-ashy.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-2fa-token', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Fix for 431 Request Header Fields Too Large
app.use((req, res, next) => {
  req.headers = req.headers || {};
  next();
});

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept, Origin, x-2fa-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// IP whitelist for super admins
app.use(ipWhitelist);

// Monitor bulk exports
app.use(monitorBulkExport);

// Initialize passport for OAuth
initializePassport(app);

// Enhanced auth middleware with security checks
const authenticateToken = async (req, res, next) => {
  console.log('🔐 Auth check for:', req.method, req.path);
  console.log('📋 Headers:', { Authorization: req.headers.authorization ? 'Token present' : 'No token', Cookie: req.headers.cookie ? 'Cookie present' : 'No cookie' });
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    console.log('🎫 Token extracted:', token ? token.substring(0, 20) + '...' : 'None');
    console.log('🔍 Verifying token with JWT_SECRET...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log('✅ Token decoded successfully:', { userId: decoded.id });
    
    // Check if token is blacklisted
    const TokenBlacklist = require('./models/TokenBlacklist');
    const blacklisted = await TokenBlacklist.findOne({
      userId: decoded.id,
      deactivatedAt: { $lte: new Date() }
    });
    
    if (blacklisted) {
      console.log('❌ Token is blacklisted');
      return res.status(401).json({ message: 'Token has been revoked' });
    }
    
    // Get user with populated company information
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('companyId', 'name plan usage status')
      .populate('tenantId', 'name plan usage status');
    
    console.log('👤 User found:', user ? `${user.email} (role: ${user.role}, companyId: ${user.companyId?._id || user.tenantId?._id})` : 'Not found');
    
    if (!user || !user.isActive) {
      console.log('❌ User is inactive or not found');
      return res.status(401).json({ message: 'User account is inactive' });
    }
    
    console.log('✅ Token verified for user:', user.email, 'Role:', user.role);
    req.user = user; // Use the full user object instead of just decoded token
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/login', loginLimiter, auditLogger('LOGIN'), async (req, res) => {
  try {
    console.log('🔐 LOGIN REQUEST:', req.body);
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({ message: 'Email not found' });
    }
    
    console.log('🔑 Stored password:', user.password);
    console.log('🔑 Input password:', password);
    
    // Check password - try both hashed and plain text
    let isValidPassword = await bcrypt.compare(password, user.password);
    
    // If bcrypt fails, try plain text comparison
    if (!isValidPassword && user.password === password) {
      isValidPassword = true;
      console.log('✅ Plain text password match');
    }
    
    console.log('🔓 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: 'Incorrect password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful, token generated');
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/register', auditLogger('USER_CREATE'), async (req, res) => {
  try {
    console.log('📝 REGISTER REQUEST:', req.body);
    const { name, email, password, company, phone, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'Email already exists! This email is already registered.' });
    }
    
    // Determine role based on email if not provided
    let userRole = role || 'sales';
    
    // Auto-assign admin role based on email domain
    const emailLower = email.toLowerCase();
    if (emailLower.includes('@greencrm.com') || emailLower.includes('admin')) {
      userRole = 'admin';
    }
    if (emailLower.includes('superadmin') || emailLower.includes('@greencrm.admin')) {
      userRole = 'super-admin';
    }
    if (emailLower.includes('manager')) {
      userRole = 'manager';
    }
    if (emailLower.includes('support')) {
      userRole = 'support';
    }
    
    // Generate unique tenant ID for new users
    const tenantId = new require('mongoose').Types.ObjectId();
    
    // Create new user with temporary tenant ID
    const user = new User({
      name,
      email,
      password, // Will be hashed by the pre-save middleware
      phone,
      company,
      role: userRole,
      companyId: tenantId, // Use same ID for both
      tenantId: tenantId
    });
    
    await user.save();
    console.log('✅ User created successfully with role:', userRole);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        needsCompanySetup: true // Flag to show company setup page
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.get('/api/auth/verify', authenticateToken, checkTokenBlacklist, (req, res) => {
  res.json({ user: req.user });
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    console.log('📝 Updating user profile:', req.user.id, req.body);
    const { name, email, phone } = req.body;
    
    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone },
      { new: true }
    ).select('-password');
    
    console.log('✅ Profile updated successfully');
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password
app.put('/api/auth/change-password', authenticateToken, auditLogger('PASSWORD_CHANGE'), async (req, res) => {
  try {
    console.log('🔐 Changing password for user:', req.user.id);
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    let isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword && user.password === currentPassword) {
      isValidPassword = true; // Handle plain text passwords
    }
    
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    
    console.log('✅ Password changed successfully');
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Password change error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Get users for assignment
app.get('/api/auth/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['sales', 'support', 'manager'] } })
      .select('name email role')
      .sort({ name: 1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Lead Routes - Get all leads endpoint
app.get('/api/leads', authenticateToken, async (req, res) => {
  try {
    console.log('\n🔍 === GET ALL LEADS REQUEST ===');
    console.log('👤 User:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    });
    
    const { status, priority, assignedTo, search, page = 1, limit = 50 } = req.query;
    
    let query = { isActive: true };
    
    // Company-based filtering (except super-admin)
    if (req.user.role !== 'super-admin') {
      if (req.user.companyId) {
        query.companyId = req.user.companyId;
        console.log('🏢 Company-based filtering:', req.user.companyId);
      } else {
        return res.status(403).json({ message: 'User not associated with any company' });
      }
    }
    
    // Role-based filtering within company
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      // Admin and manager can see all company leads
      console.log('🔑 Admin/Manager access - showing all company leads');
    } else if (req.user.role !== 'super-admin') {
      // Normal users can only see leads created by them or assigned to them
      console.log('🔒 Normal user access - filtering leads');
      const existingCompanyFilter = query.companyId;
      query.$and = [
        { companyId: existingCompanyFilter },
        {
          $or: [
            { createdBy: req.user.id },
            { assignedTo: req.user.id }
          ]
        }
      ];
      delete query.companyId; // Remove duplicate filter
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo && ['super-admin', 'admin', 'manager'].includes(req.user.role)) {
      query.assignedTo = assignedTo;
    }
    if (search) {
      query.$or = [
        { contactPerson: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
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
    console.error('❌ Error fetching leads:', error);
    res.status(500).json({ message: 'Error fetching leads', error: error.message });
  }
});

app.post('/api/leads', authenticateToken, async (req, res) => {
  try {
    console.log('\n🔄 === LEAD CREATION REQUEST ===');
    console.log('📝 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('👤 Authenticated User:', req.user);
    console.log('🔗 Database Connected:', isDBConnected);
    
    // Validate required fields
    const { contactPerson, companyName, email, phone } = req.body;
    if (!contactPerson || !companyName || !email || !phone) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['contactPerson', 'companyName', 'email', 'phone'],
        received: Object.keys(req.body)
      });
    }
    
    // Check if user belongs to a company (except super-admin)
    if (req.user.role !== 'super-admin' && !req.user.companyId) {
      return res.status(403).json({ message: 'User not associated with any company' });
    }
    
    // Check company lead limits
    if (req.user.companyId) {
      const company = await require('./models/Company').findById(req.user.companyId);
      if (company && !company.canAddLead()) {
        return res.status(400).json({ 
          message: `Lead limit reached. Current plan allows ${company.plan.leadsLimit} leads.`,
          currentLeads: company.usage.currentLeads,
          maxLeads: company.plan.leadsLimit
        });
      }
    }
    
    const leadData = {
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user.id
    };
    
    const newLead = new Lead(leadData);
    
    console.log('💾 Attempting to save lead...');
    const savedLead = await newLead.save();
    console.log('✅ Lead saved successfully!');
    console.log('🆔 Lead ID:', savedLead._id);
    
    // Update company usage
    if (req.user.companyId) {
      await require('./models/Company').findByIdAndUpdate(req.user.companyId, {
        $inc: { 'usage.currentLeads': 1 }
      });
      console.log('📈 Company lead count updated');
    }
    
    // Create notification for lead creation
    await createLeadCreationNotification(savedLead._id, req.user.id);
    
    console.log('=== END LEAD CREATION ===\n');
    
    res.status(201).json(savedLead);
  } catch (error) {
    console.error('\n❌ === LEAD CREATION ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('=== END ERROR ===\n');
    
    res.status(500).json({ 
      message: 'Error creating lead', 
      error: error.message,
      type: error.name
    });
  }
});

app.put('/api/leads/:id', authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lead', error: error.message });
  }
});

app.delete('/api/leads/:id', authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lead', error: error.message });
  }
});

// Lead assignment endpoint
app.post('/api/leads/assign', authenticateToken, async (req, res) => {
  try {
    console.log('🔄 Lead assignment request:', req.body);
    const { leadId, assignedTo } = req.body;
    
    if (!leadId || !assignedTo) {
      return res.status(400).json({ message: 'Lead ID and assignedTo are required' });
    }
    
    // Find the user being assigned to (can be email or ID)
    let assignedUser;
    if (assignedTo.includes('@')) {
      assignedUser = await User.findOne({ email: assignedTo });
    } else {
      assignedUser = await User.findById(assignedTo);
    }
    
    if (!assignedUser) {
      return res.status(400).json({ message: 'Assigned user not found' });
    }
    
    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { 
        assignedTo: assignedUser._id,
        assignedAt: new Date(),
        assignedBy: req.user.id
      },
      { new: true }
    ).populate('createdBy assignedTo', 'name email role');
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Create notification for lead assignment
    await createLeadAssignmentNotification(leadId, assignedUser._id, req.user.id);
    console.log('📧 Notification sent to:', assignedUser.email);
    
    console.log('✅ Lead assigned successfully:', leadId, 'to', assignedUser.email);
    res.json({ message: 'Lead assigned successfully', lead });
  } catch (error) {
    console.error('❌ Lead assignment error:', error);
    res.status(500).json({ message: 'Error assigning lead', error: error.message });
  }
});

// Get leads assigned to current user
app.get('/api/leads/my-leads', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching leads for user:', req.user.email);
    const leads = await Lead.find({ assignedTo: req.user.email });
    console.log('📊 Found', leads.length, 'assigned leads');
    res.json({ leads });
  } catch (error) {
    console.error('❌ Error fetching my leads:', error);
    res.status(500).json({ message: 'Error fetching assigned leads', error: error.message });
  }
});

// Customer Routes (Direct implementation to avoid conflicts)
app.get('/api/customers', authenticateToken, async (req, res) => {
  try {
    const { status, customerType, assignedTo, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    // Company-based filtering (except super-admin)
    if (req.user.role !== 'super-admin') {
      if (req.user.companyId) {
        query.companyId = req.user.companyId;
      } else {
        return res.status(403).json({ message: 'User not associated with any company' });
      }
    }
    
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
      .populate('createdBy assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Customer.countDocuments(query);

    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('❌ Get customers error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/customers', authenticateToken, async (req, res) => {
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
    
    // Check if user belongs to a company (except super-admin)
    if (req.user.role !== 'super-admin' && !req.user.companyId) {
      return res.status(403).json({ message: 'User not associated with any company' });
    }
    
    // Check company customer limits
    if (req.user.companyId) {
      const Company = require('./models/Company');
      const company = await Company.findById(req.user.companyId);
      if (company && !company.canAddCustomer()) {
        return res.status(400).json({ 
          message: `Customer limit reached. Current plan allows ${company.plan.customersLimit} customers.`,
          currentCustomers: company.usage.currentCustomers,
          maxCustomers: company.plan.customersLimit
        });
      }
    }
    
    // Get user ID - handle both _id and id properties
    const userId = req.user._id || req.user.id;
    console.log('👤 Using user ID:', userId);
    
    const customer = await Customer.create({
      ...req.body,
      companyId: req.user.companyId,
      createdBy: userId
    });
    
    // Update company usage
    if (req.user.companyId) {
      const Company = require('./models/Company');
      await Company.findByIdAndUpdate(req.user.companyId, {
        $inc: { 'usage.currentCustomers': 1 }
      });
      console.log('📈 Company customer count updated');
    }
    
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
});

app.get('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('createdBy assignedTo', 'name email')
      .populate('noteHistory.createdBy', 'name');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy assignedTo', 'name email');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/customers/:id', authenticateToken, async (req, res) => {
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
});

app.post('/api/customers/:id/notes', authenticateToken, async (req, res) => {
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
});

// Demo Request Routes
app.get('/api/demo-requests', authenticateToken, async (req, res) => {
  try {
    const demoRequests = await DemoRequest.find()
      .populate('processedBy', 'name email')
      .sort({ submittedAt: -1 });
    res.json(demoRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching demo requests', error: error.message });
  }
});

app.post('/api/demo-requests', async (req, res) => {
  try {
    const demoRequest = new DemoRequest(req.body);
    const savedRequest = await demoRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating demo request', error: error.message });
  }
});

app.put('/api/demo-requests/:id/approve', authenticateToken, async (req, res) => {
  try {
    const demoRequest = await DemoRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        processedAt: new Date(),
        processedBy: req.user.id
      },
      { new: true }
    ).populate('processedBy', 'name email');
    
    if (!demoRequest) {
      return res.status(404).json({ message: 'Demo request not found' });
    }
    
    res.json(demoRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error approving demo request', error: error.message });
  }
});

app.put('/api/demo-requests/:id/reject', authenticateToken, async (req, res) => {
  try {
    const demoRequest = await DemoRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        processedAt: new Date(),
        processedBy: req.user.id
      },
      { new: true }
    ).populate('processedBy', 'name email');
    
    if (!demoRequest) {
      return res.status(404).json({ message: 'Demo request not found' });
    }
    
    res.json(demoRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting demo request', error: error.message });
  }
});

app.delete('/api/demo-requests/:id', authenticateToken, async (req, res) => {
  try {
    const demoRequest = await DemoRequest.findByIdAndDelete(req.params.id);
    
    if (!demoRequest) {
      return res.status(404).json({ message: 'Demo request not found' });
    }
    
    res.json({ message: 'Demo request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting demo request', error: error.message });
  }
});

// Other Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/support', enhancedSupportRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/settings', require('./routes/settingsRoutes'));
const demoRequestRoutes = require('./routes/demoRequestRoutes');
// Apply auth to protected demo routes
app.get('/api/demo-requests', authenticateToken, demoRequestRoutes);
app.put('/api/demo-requests/:id/approve', authenticateToken, async (req, res) => {
  const { approveDemoRequest } = require('./controllers/demoRequestController');
  await approveDemoRequest(req, res);
});
app.put('/api/demo-requests/:id/reject', authenticateToken, async (req, res) => {
  const { rejectDemoRequest } = require('./controllers/demoRequestController');
  await rejectDemoRequest(req, res);
});
app.delete('/api/demo-requests/:id', authenticateToken, async (req, res) => {
  const { deleteDemoRequest } = require('./controllers/demoRequestController');
  await deleteDemoRequest(req, res);
});
// Public route for creating demo requests
app.post('/api/demo-requests', async (req, res) => {
  const { createDemoRequest } = require('./controllers/demoRequestController');
  await createDemoRequest(req, res);
});
// OAuth Routes - Register with proper paths
app.use('/api/auth', require('./routes/oauth'));
app.use('/api/notifications', authenticateToken, notificationRoutes);
// Security Routes
app.use('/api/security', authenticateToken, require('./routes/securityRoutes'));

// Super Admin Routes
app.use('/api/super-admin', authenticateToken, require('./routes/superAdminRoutes'));

// Communication, Task, and Calendar Routes
app.use('/api/communications', authenticateToken, communicationRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/calendar', authenticateToken, calendarRoutes);



// Direct routes for frontend compatibility
const { getPlanConfigs, getMyCompanyPlan, getTeamMembers } = require('./controllers/companyController');

// Plans routes
app.get('/api/plans', authenticateToken, getPlanConfigs);
app.get('/api/my/plan', authenticateToken, getMyCompanyPlan);
app.get('/api/my/team', authenticateToken, getTeamMembers);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const leadCount = await Lead.countDocuments();
    const customerCount = await Customer.countDocuments();
    const demoRequestCount = await DemoRequest.countDocuments();
    
    res.json({ 
      message: 'Green Call CRM Backend is running!',
      status: 'active',
      timestamp: new Date().toISOString(),
      users: userCount,
      leads: leadCount,
      customers: customerCount,
      demoRequests: demoRequestCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Health check failed', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
}).on('error', (err) => {
  console.error('Server error:', err);
});