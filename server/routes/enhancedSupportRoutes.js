const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createSupportTicket,
  getTickets,
  getTicketById,
  addTicketReply,
  updateTicket,
  deleteTicket,
  getTicketStats
} = require('../controllers/enhancedSupportController');

// Create new ticket
router.post('/tickets', auth, createSupportTicket);

// Get all tickets with filters
router.get('/tickets', auth, getTickets);

// Get ticket statistics
router.get('/tickets/stats', auth, getTicketStats);

// Get specific ticket by ID
router.get('/tickets/:id', auth, getTicketById);

// Add reply to ticket
router.post('/tickets/:id/reply', auth, addTicketReply);

// Update ticket (admin/super-admin only)
router.put('/tickets/:id', auth, updateTicket);

// Delete ticket (customer only after resolution)
router.delete('/tickets/:id', auth, deleteTicket);

// Notification routes for tickets
router.get('/notifications', auth, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({
      userId: req.user._id,
      type: { $in: ['ticket_created', 'ticket_reply', 'ticket_assigned', 'ticket_resolved', 'ticket_status_changed'] }
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

module.exports = router;