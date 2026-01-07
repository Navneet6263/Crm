const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Lead = require('../models/Lead');
const User = require('../models/User');
const Company = require('../models/Company');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const SupportTicket = require('../models/SupportTicket');
const Task = require('../models/Task');
const TokenBlacklist = require('../models/TokenBlacklist');
const UserActivity = require('../models/UserActivity');
const AuditLog = require('../models/AuditLog');
const Calendar = require('../models/Calendar');
const Communication = require('../models/Communication');
const DemoRequest = require('../models/DemoRequest');
const Notification = require('../models/Notification');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/green-crm', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const exportToJson = async () => {
  try {
    console.log('📊 Starting database export...');

    // Create exports directory
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Export Leads
    console.log('📋 Exporting leads...');
    const leads = await Lead.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'leads.json'),
      JSON.stringify(leads, null, 2)
    );
    console.log(`✅ Exported ${leads.length} leads`);

    // Export Users
    console.log('👥 Exporting users...');
    const users = await User.find({}).select('-password').lean();
    fs.writeFileSync(
      path.join(exportDir, 'users.json'),
      JSON.stringify(users, null, 2)
    );
    console.log(`✅ Exported ${users.length} users`);

    // Export Companies
    console.log('🏢 Exporting companies...');
    const companies = await Company.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'companies.json'),
      JSON.stringify(companies, null, 2)
    );
    console.log(`✅ Exported ${companies.length} companies`);

    // Export Customers
    console.log('👤 Exporting customers...');
    const customers = await Customer.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'customers.json'),
      JSON.stringify(customers, null, 2)
    );
    console.log(`✅ Exported ${customers.length} customers`);

    // Export Products
    console.log('📦 Exporting products...');
    const products = await Product.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'products.json'),
      JSON.stringify(products, null, 2)
    );
    console.log(`✅ Exported ${products.length} products`);

    // Export Support Tickets
    console.log('🎫 Exporting support tickets...');
    const supportTickets = await SupportTicket.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'supportTickets.json'),
      JSON.stringify(supportTickets, null, 2)
    );
    console.log(`✅ Exported ${supportTickets.length} support tickets`);

    // Export Tasks
    console.log('✅ Exporting tasks...');
    const tasks = await Task.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'tasks.json'),
      JSON.stringify(tasks, null, 2)
    );
    console.log(`✅ Exported ${tasks.length} tasks`);

    // Export Token Blacklist
    console.log('🔒 Exporting token blacklist...');
    const tokenBlacklist = await TokenBlacklist.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'tokenBlacklist.json'),
      JSON.stringify(tokenBlacklist, null, 2)
    );
    console.log(`✅ Exported ${tokenBlacklist.length} blacklisted tokens`);

    // Export User Activity
    console.log('📊 Exporting user activity...');
    const userActivity = await UserActivity.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'userActivity.json'),
      JSON.stringify(userActivity, null, 2)
    );
    console.log(`✅ Exported ${userActivity.length} user activities`);

    // Export Audit Logs
    console.log('📝 Exporting audit logs...');
    const auditLogs = await AuditLog.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'auditLogs.json'),
      JSON.stringify(auditLogs, null, 2)
    );
    console.log(`✅ Exported ${auditLogs.length} audit logs`);

    // Export Calendars
    console.log('📅 Exporting calendars...');
    const calendars = await Calendar.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'calendars.json'),
      JSON.stringify(calendars, null, 2)
    );
    console.log(`✅ Exported ${calendars.length} calendars`);

    // Export Communications
    console.log('💬 Exporting communications...');
    const communications = await Communication.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'communications.json'),
      JSON.stringify(communications, null, 2)
    );
    console.log(`✅ Exported ${communications.length} communications`);

    // Export Demo Requests
    console.log('🎯 Exporting demo requests...');
    const demoRequests = await DemoRequest.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'demoRequests.json'),
      JSON.stringify(demoRequests, null, 2)
    );
    console.log(`✅ Exported ${demoRequests.length} demo requests`);

    // Export Notifications
    console.log('🔔 Exporting notifications...');
    const notifications = await Notification.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'notifications.json'),
      JSON.stringify(notifications, null, 2)
    );
    console.log(`✅ Exported ${notifications.length} notifications`);

    // Export all in one file
    console.log('📦 Creating complete backup...');
    const completeBackup = {
      exportDate: new Date().toISOString(),
      leads,
      users,
      companies,
      customers,
      products,
      supportTickets,
      tasks,
      tokenBlacklist,
      userActivity,
      auditLogs,
      calendars,
      communications,
      demoRequests,
      notifications
    };
    fs.writeFileSync(
      path.join(exportDir, 'complete-backup.json'),
      JSON.stringify(completeBackup, null, 2)
    );

    console.log('✅ Export completed successfully!');
    console.log(`📁 Files saved in: ${exportDir}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
};

exportToJson();
