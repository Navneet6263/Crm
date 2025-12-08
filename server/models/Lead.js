const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  leadSource: {
    type: String,
    enum: [
      'website',
      'google',
      'facebook',
      'instagram', 
      'linkedin',
      'twitter',
      'youtube',
      'referral',
      'cold-call',
      'email-campaign',
      'trade-show',
      'advertisement',
      'direct-mail',
      'partner',
      'webinar',
      'content-marketing',
      'seo',
      'ppc',
      'social-media',
      'word-of-mouth',
      'existing-customer',
      'walk-in',
      'other'
    ],
    default: 'website'
  },
  customLeadSource: {
    type: String,
    trim: true
  },
  followUpDate: {
    type: Date
  },
  status: {
    type: String,
    default: 'new'
  },
  priority: {
    type: String,
    default: 'medium'
  },
  estimatedValue: {
    type: Number,
    default: 0
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastViewedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false
  },
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  activities: [{
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'note', 'status_change', 'assignment']
    },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  nextFollowUp: {
    type: Date
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBySuperAdmin: {
    type: Boolean,
    default: false
  },
  requirements: {
    type: String,
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}, {
  timestamps: true
});

// Index for better search performance
leadSchema.index({ contactPerson: 'text', companyName: 'text', email: 'text' });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);