const mongoose = require('mongoose');

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
  plan: {
    name: {
      type: String,
      enum: ['basic', 'professional', 'enterprise'],
      default: 'basic'
    },
    leadsLimit: {
      type: Number,
      default: 1000
    },
    usersLimit: {
      type: Number,
      default: 5
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  branding: {
    logoUrl: String,
    primaryColor: {
      type: String,
      default: '#3b82f6'
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

// Indexes
companySchema.index({ slug: 1 }, { unique: true });
companySchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Company', companySchema);