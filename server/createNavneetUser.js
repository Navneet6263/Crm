const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const createNavneetUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const existingUser = await User.findOne({ email: 'navneet@greencall.com' });
    if (existingUser) {
      console.log('❌ User already exists');
      console.log('📧 Email:', existingUser.email);
      console.log('🔑 Role:', existingUser.role);
      process.exit(0);
    }

    // Create user with both hashed and plain password for compatibility
    const hashedPassword = await bcrypt.hash('navneet', 10);
    
    const navneetUser = new User({
      name: 'Navneet Kumar',
      email: 'navneet@greencall.com',
      password: hashedPassword, // Use hashed password
      role: 'super-admin',
      isActive: true
    });

    await navneetUser.save();
    console.log('✅ Navneet user created successfully');
    console.log('📧 Email: navneet@greencall.com');
    console.log('🔑 Password: navneet');
    console.log('👑 Role: super-admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createNavneetUser();