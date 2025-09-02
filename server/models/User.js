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
  }
}, {
  timestamps: true
});

// Email uniqueness handled by schema

// Hash password before saving (skip for seeded users)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Skip hashing for seeded users and OAuth users
  if (this.isNew && (['navneet', 'super123', 'admin123', 'manager123', 'sales123', 'support123', 'google_oauth', 'linkedin_oauth'].includes(this.password))) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);