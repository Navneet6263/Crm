const mongoose = require('mongoose');

// Plan configurations
const PLAN_CONFIGS = {
  trial: {
    leadsLimit: 5,
    usersLimit: 1,
    customersLimit: 3,
    storageLimit: 0.1, // GB
    emailLimit: 10, // per month
    smsLimit: 5, // per month
    features: ['basic_crm']
  },
  basic: {
    leadsLimit: 1000,
    usersLimit: 5,
    customersLimit: 500,
    storageLimit: 1, // GB
    emailLimit: 1000, // per month
    smsLimit: 100, // per month
    features: ['basic_crm', 'lead_management', 'basic_reports']
  },
  professional: {
    leadsLimit: 5000,
    usersLimit: 25,
    customersLimit: 2500,
    storageLimit: 10, // GB
    emailLimit: 10000, // per month
    smsLimit: 1000, // per month
    features: ['advanced_crm', 'ai_assistant', 'advanced_reports', 'automation']
  },
  enterprise: {
    leadsLimit: -1, // unlimited
    usersLimit: -1, // unlimited
    customersLimit: -1, // unlimited
    storageLimit: 100, // GB
    emailLimit: -1, // unlimited
    smsLimit: 10000, // per month
    features: ['full_crm', 'ai_assistant', 'custom_reports', 'advanced_automation', 'api_access']
  }
};

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  companySize: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  talentId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  adminCredentials: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    isGenerated: {
      type: Boolean,
      default: true
    }
  },
  plan: {
    name: {
      type: String,
      enum: ['trial', 'basic', 'professional', 'enterprise'],
      default: 'trial'
    },
    leadsLimit: {
      type: Number,
      default: 1000
    },
    usersLimit: {
      type: Number,
      default: 5
    },
    customersLimit: {
      type: Number,
      default: 500
    },
    storageLimit: {
      type: Number,
      default: 1
    },
    emailLimit: {
      type: Number,
      default: 1000
    },
    smsLimit: {
      type: Number,
      default: 100
    },
    features: {
      type: [String],
      default: ['basic_crm']
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: function() {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date;
      }
    }
  },
  usage: {
    currentLeads: {
      type: Number,
      default: 0
    },
    currentUsers: {
      type: Number,
      default: 0
    },
    currentCustomers: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number,
      default: 0
    },
    emailsSent: {
      type: Number,
      default: 0
    },
    smsSent: {
      type: Number,
      default: 0
    },
    lastReset: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'trial'],
    default: 'trial'
  },
  branding: {
    logoUrl: String,
    primaryColor: {
      type: String,
      default: '#3b82f6'
    },
    companyName: String
  },
  settings: {
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    currency: {
      type: String,
      default: 'INR'
    },
    language: {
      type: String,
      default: 'en'
    },
    smtp: {
      host: String,
      port: Number,
      secure: Boolean,
      user: String,
      pass: String,
      from: String,
      enabled: {
        type: Boolean,
        default: false
      }
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to set plan limits
companySchema.pre('save', function(next) {
  if (this.isModified('plan.name')) {
    const config = PLAN_CONFIGS[this.plan.name];
    if (config) {
      this.plan.leadsLimit = config.leadsLimit;
      this.plan.usersLimit = config.usersLimit;
      this.plan.customersLimit = config.customersLimit;
      this.plan.storageLimit = config.storageLimit;
      this.plan.emailLimit = config.emailLimit;
      this.plan.smsLimit = config.smsLimit;
      this.plan.features = config.features;
    }
  }
  next();
});

// Methods to check limits
companySchema.methods.canAddUser = function() {
  if (this.plan.usersLimit === -1) return true;
  return this.usage.currentUsers < this.plan.usersLimit;
};

// Method to check limits with real-time count
companySchema.methods.canAddUserRealTime = async function() {
  if (this.plan.usersLimit === -1) return true;
  
  const User = require('./User');
  const realUserCount = await User.countDocuments({
    $or: [{ companyId: this._id }, { tenantId: this._id }],
    isActive: true
  });
  
  return realUserCount < this.plan.usersLimit;
};

companySchema.methods.canAddLead = function() {
  if (this.plan.leadsLimit === -1) return true;
  return this.usage.currentLeads < this.plan.leadsLimit;
};

companySchema.methods.canAddCustomer = function() {
  if (this.plan.customersLimit === -1) return true;
  return this.usage.currentCustomers < this.plan.customersLimit;
};

companySchema.methods.hasFeature = function(feature) {
  return this.plan.features.includes(feature);
};

companySchema.methods.getRemainingLimits = function() {
  return {
    users: this.plan.usersLimit === -1 ? 'unlimited' : this.plan.usersLimit - this.usage.currentUsers,
    leads: this.plan.leadsLimit === -1 ? 'unlimited' : this.plan.leadsLimit - this.usage.currentLeads,
    customers: this.plan.customersLimit === -1 ? 'unlimited' : this.plan.customersLimit - this.usage.currentCustomers,
    storage: this.plan.storageLimit - this.usage.storageUsed
  };
};

// Static method to get plan configurations
companySchema.statics.getPlanConfigs = function() {
  return PLAN_CONFIGS;
};

// Indexes
companySchema.index({ slug: 1 }, { unique: true });
companySchema.index({ name: 1 }, { unique: true });
companySchema.index({ 'adminCredentials.email': 1 });
companySchema.index({ talentId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Company', companySchema);