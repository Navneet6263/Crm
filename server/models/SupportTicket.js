const mongoose = require('mongoose');

const ticketReplySchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  repliedBy: {
    type: String,
    required: true
  },
  repliedByRole: {
    type: String,
    enum: ['customer', 'admin', 'super-admin', 'support'],
    default: 'customer'
  },
  repliedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isStaff: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false
  },
  customerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  companyName: {
    type: String,
    default: ''
  },
  createdBy: {
    type: String,
    default: 'Customer'
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'deleted'],
    default: 'open'
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'general', 'feature-request', 'feature', 'account', 'other'],
    default: 'general'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedToName: {
    type: String,
    default: ''
  },
  replies: [ticketReplySchema],
  resolution: {
    type: String,
    default: ''
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedByName: {
    type: String,
    default: ''
  },
  canCustomerDelete: {
    type: Boolean,
    default: false
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date
  },
  lastReplyAt: {
    type: Date,
    default: Date.now
  },
  customerNotified: {
    type: Boolean,
    default: false
  },
  adminNotified: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  }
});

// Generate ticket ID before saving
supportTicketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    try {
      const count = await this.constructor.countDocuments();
      this.ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      // Fallback ID generation
      this.ticketId = `TKT-${Date.now()}`;
    }
  }
  
  // Update timestamps
  this.updatedAt = new Date();
  
  // Update lastReplyAt when new reply is added
  if (this.isModified('replies') && this.replies.length > 0) {
    this.lastReplyAt = new Date();
  }
  
  // Set canCustomerDelete to true when status is resolved
  if (this.isModified('status') && this.status === 'resolved') {
    this.canCustomerDelete = true;
    this.resolvedAt = new Date();
  }
  
  next();
});

// Index for better performance
supportTicketSchema.index({ ticketId: 1 });
supportTicketSchema.index({ customerEmail: 1 });
supportTicketSchema.index({ companyId: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ assignedTo: 1 });

// Text search index
supportTicketSchema.index({
  title: 'text',
  description: 'text',
  customerName: 'text',
  customerEmail: 'text',
  ticketId: 'text'
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);