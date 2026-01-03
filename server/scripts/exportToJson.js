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

    // Export all in one file
    console.log('📦 Creating complete backup...');
    const completeBackup = {
      exportDate: new Date().toISOString(),
      leads,
      users,
      companies,
      customers,
      products
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
