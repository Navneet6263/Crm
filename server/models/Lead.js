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
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'India'
    },
    fullAddress: {
      type: String,
      trim: true
    }
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
  assignedToGroup: {
    type: String,
    enum: ['sales', 'marketing', 'support', null],
    default: null
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
  
  // Lead Scoring & Intelligence
  leadScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  leadTemperature: {
    type: String,
    enum: ['hot', 'warm', 'cold'],
    default: 'warm'
  },
  conversionProbability: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Communication Tracking
  communications: [{
    type: {
      type: String,
      enum: ['email', 'call', 'whatsapp', 'sms', 'meeting']
    },
    subject: String,
    content: String,
    duration: Number,
    status: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Follow-up & Reminders
  reminders: [{
    title: String,
    description: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date
  }],
  
  // Lead Velocity Tracking
  stageHistory: [{
    stage: String,
    enteredAt: Date,
    exitedAt: Date,
    duration: Number
  }],
  
  // Lost Lead Tracking
  lostReason: String,
  lostReasonDetails: String,
  lostAt: Date,
  
  // Response Time Tracking
  firstResponseAt: Date,
  firstResponseTime: Number,
  avgResponseTime: Number,
  
  // Engagement Metrics
  lastContactedAt: Date,
  totalInteractions: {
    type: Number,
    default: 0
  },
  emailsSent: {
    type: Number,
    default: 0
  },
  callsMade: {
    type: Number,
    default: 0
  },
  meetingsHeld: {
    type: Number,
    default: 0
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
  },
  
  // Workflow Management Fields
  workflowStage: {
    type: String,
    enum: ['sales', 'legal', 'finance', 'completed'],
    default: 'sales'
  },
  assignedToLegal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedToFinance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Legal Team Data
  legalDocuments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    documentType: {
      type: String,
      enum: ['agreement', 'contract', 'other'],
      default: 'agreement'
    }
  }],
  agreementStatus: {
    type: String,
    enum: ['pending', 'uploaded', 'approved'],
    default: 'pending'
  },
  legalApprovedAt: Date,
  legalApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Finance Team Data
  financeDocuments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    documentType: {
      type: String,
      enum: ['invoice', 'tax-invoice', 'receipt', 'other'],
      default: 'invoice'
    }
  }],
  invoiceNumber: String,
  invoiceAmount: Number,
  taxInvoiceNumber: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  },
  paymentCompletedAt: Date,
  
  // Transfer History
  transferHistory: [{
    from: {
      type: String,
      enum: ['sales', 'legal', 'finance']
    },
    to: {
      type: String,
      enum: ['legal', 'finance', 'completed']
    },
    transferredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transferredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transferredAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes for performance
leadSchema.index({ contactPerson: 'text', companyName: 'text', email: 'text' });
leadSchema.index({ assignedTo: 1, createdAt: -1 });
leadSchema.index({ createdBy: 1, createdAt: -1 });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ isActive: 1, createdBy: 1 });
leadSchema.index({ isActive: 1, assignedTo: 1 });
leadSchema.index({ status: 1, priority: 1 });
leadSchema.index({ product: 1 });
leadSchema.index({ workflowStage: 1 });
leadSchema.index({ assignedToLegal: 1 });
leadSchema.index({ assignedToFinance: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ createdAt: -1, _id: -1 });
leadSchema.index({ companyId: 1, isActive: 1, createdAt: -1 });
leadSchema.index({ companyId: 1, isActive: 1, assignedTo: 1, createdAt: -1 });
leadSchema.index({ companyId: 1, isActive: 1, createdBy: 1, createdAt: -1 });
leadSchema.index({ companyId: 1, isActive: 1, status: 1, priority: 1, createdAt: -1 });
leadSchema.index({ companyId: 1, isActive: 1, product: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);