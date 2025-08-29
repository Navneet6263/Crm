const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tokenId: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    enum: ['USER_DEACTIVATED', 'PASSWORD_CHANGED', 'LOGOUT', 'SECURITY_BREACH'],
    default: 'USER_DEACTIVATED'
  },
  deactivatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deactivatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
});

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);