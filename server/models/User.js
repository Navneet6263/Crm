const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.linkedinId;
    }
  },
  role: {
    type: String,
    default: 'sales'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: function() {
      return this.role !== 'super-admin';
    }
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: function() {
      return this.role !== 'super-admin';
    }
  },
  phone: {
    type: String,
    trim: true,
    sparse: true
  },
  loginMethod: {
    type: String,
    enum: ['email', 'otp', 'google', 'linkedin'],
    default: 'email'
  },
  googleId: {
    type: String,
    sparse: true
  },
  linkedinId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String
  },
  profilePicture: {
    type: String
  },
  company: {
    type: String,
    trim: true
  },
  talentId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deactivatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deactivatedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  // 2FA fields
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String
  },
  // Session tracking
  activeSessions: [{
    sessionId: String,
    ipAddress: String,
    userAgent: String,
    loginTime: Date,
    lastActivity: Date
  }],
  // Export tracking
  dailyExportCount: {
    type: Number,
    default: 0
  },
  lastExportReset: {
    type: Date,
    default: Date.now
  },
  // Super Admin Safety Net
  isSuperAdmin: {
    type: Boolean,
    default: function() {
      return this.role === 'super-admin';
    }
  },
  superAdminLevel: {
    type: Number,
    default: function() {
      return this.role === 'super-admin' ? 1 : 0;
    }
  },
  canManageSuperAdmins: {
    type: Boolean,
    default: function() {
      return this.role === 'super-admin';
    }
  },
  // User preferences
  notificationPreferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    leadAlerts: { type: Boolean, default: true },
    taskReminders: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: false },
    marketingEmails: { type: Boolean, default: false }
  },
  appPreferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    currency: { type: String, default: 'INR' }
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ talentId: 1 }, { unique: true, sparse: true });
userSchema.index({ companyId: 1 });
userSchema.index({ tenantId: 1 });

// Email uniqueness handled by schema

// Hash password before saving (skip for seeded users)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Skip hashing for seeded users and OAuth users
  if (this.isNew && (['navneet', 'super123', 'admin123', 'manager123', 'sales123', 'support123', 'google_oauth', 'linkedin_oauth'].includes(this.password))) {
    return next();
  }
  
  // Always hash password for new users
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('🔑 Password comparison:', {
      email: this.email,
      isMatch: isMatch,
      hasPassword: !!this.password
    });
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);