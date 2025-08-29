const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  isStaff: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ticketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['technical', 'billing', 'feature', 'account', 'other'],
    default: 'technical'
  },
  createdBy: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  responses: [responseSchema],
  assignedTo: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Add text index for search
ticketSchema.index({ 
  subject: 'text', 
  description: 'text',
  customerName: 'text',
  customerEmail: 'text'
});

module.exports = mongoose.model('Ticket', ticketSchema);