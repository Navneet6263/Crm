const mongoose = require('mongoose');

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
  createdBy: {
    type: String,
    default: 'Customer'
  },
  customerEmail: {
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
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'general', 'feature-request', 'feature', 'account', 'other'],
    default: 'general'
  },
  assignedTo: {
    type: String,
    default: null
  },
  resolution: {
    type: String,
    default: ''
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
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);