const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['email', 'call', 'meeting', 'sms', 'whatsapp'],
    required: true
  },
  subject: {
    type: String,
    required: function() { return this.type === 'email' || this.type === 'meeting'; }
  },
  content: {
    type: String,
    required: true
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'replied', 'failed'],
    default: 'sent'
  },
  scheduledAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],
  metadata: {
    duration: Number, // for calls in minutes
    participants: [String], // for meetings
    phoneNumber: String, // for calls/sms
    emailAddress: String // for emails
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Communication', communicationSchema);