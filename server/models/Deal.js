const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Deal title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  value: {
    type: Number,
    required: [true, 'Deal value is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  stage: {
    type: String,
    enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
    default: 'prospecting'
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  expectedCloseDate: {
    type: Date,
    required: true
  },
  actualCloseDate: {
    type: Date
  },
  leadSource: {
    type: String,
    enum: ['Website', 'Social Media', 'Email Campaign', 'Cold Call', 'Referral', 'Trade Show', 'Other'],
    default: 'Website'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

dealSchema.index({ stage: 1, assignedTo: 1 });
dealSchema.index({ expectedCloseDate: 1 });
dealSchema.index({ value: -1 });

module.exports = mongoose.model('Deal', dealSchema);