const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['meeting', 'call', 'demo', 'email', 'task', 'other'],
    default: 'meeting'
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  attendees: [{
    email: String,
    name: String,
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'tentative'],
      default: 'invited'
    }
  }],
  location: {
    type: String,
    trim: true
  },
  meetingLink: {
    type: String,
    trim: true
  },
  reminder: {
    type: Number, // minutes before event
    default: 15
  },
  relatedTo: {
    type: String,
    enum: ['lead', 'customer', 'deal', 'task'],
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: Number, // every X days/weeks/months
    endDate: Date
  },
  syncedWith: [{
    platform: {
      type: String,
      enum: ['google', 'outlook', 'apple']
    },
    externalId: String,
    lastSynced: Date
  }]
}, {
  timestamps: true
});

calendarSchema.index({ startDate: 1, endDate: 1 });
calendarSchema.index({ createdBy: 1 });
calendarSchema.index({ type: 1, status: 1 });
calendarSchema.index({ relatedTo: 1, relatedId: 1 });

module.exports = mongoose.model('Calendar', calendarSchema);