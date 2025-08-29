const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
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
    default: 'Website'
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
    type: String,
    trim: true
  },
  assignedAt: {
    type: Date
  },
  assignedBy: {
    type: String
  },
  createdBy: {
    type: String,
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
      enum: ['call', 'email', 'meeting', 'note', 'status_change']
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
  }
}, {
  timestamps: true
});

// Index for better search performance
leadSchema.index({ contactPerson: 'text', companyName: 'text', email: 'text' });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);