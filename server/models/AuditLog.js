const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'USER_CREATE', 'USER_DEACTIVATE', 
           'BULK_EXPORT', 'ROLE_CHANGE', 'DATA_DELETE', 'SETTINGS_CHANGE']
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: String,
  userRole: String,
  ipAddress: String,
  userAgent: String,
  recordCount: Number,
  exportType: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);