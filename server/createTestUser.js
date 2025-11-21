const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test user exists
    const existingUser = await User.findOne({ email: 'test@test.com' });
    if (existingUser) {
      console.log('❌ Test user already exists');
      process.exit(0);
    }

    // Create test user with hashed password
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testUser = new User({
      name: 'Test User',
      email: 'test@test.com',
      password: hashedPassword,
      role: 'super-admin',
      isActive: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('📧 Email: test@test.com');
    console.log('🔑 Password: test123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestUser();