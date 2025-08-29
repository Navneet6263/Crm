const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  industry: {
    type: String,
    trim: true
  },
  customerType: {
    type: String,
    enum: ['individual', 'business', 'enterprise'],
    default: 'business'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  convertedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  totalValue: {
    type: Number,
    default: 0
  },
  lastInteraction: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  noteHistory: [{
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
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
customerSchema.index({ name: 'text', companyName: 'text', email: 'text' });
customerSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Customer', customerSchema);