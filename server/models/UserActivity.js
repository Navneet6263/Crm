const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'page_view',
      'lead_created',
      'lead_updated',
      'lead_deleted',
      'customer_created',
      'customer_updated',
      'customer_deleted',
      'note_added',
      'activity_logged',
      'report_generated',
      'export_data',
      'other'
    ]
  },
  feature: {
    type: String,
    enum: [
      'Dashboard',
      'Leads',
      'Customers',
      'Products',
      'Reports',
      'Settings',
      'User Management',
      'Other'
    ]
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  sessionId: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ sessionId: 1 });
userActivitySchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
