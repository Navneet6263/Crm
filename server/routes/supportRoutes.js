const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  addResponse,
  getTicketStats
} = require('../controllers/supportController');

// Public route - create ticket (no auth required for customer support)
router.post('/', createTicket);

// Protected routes - require authentication
router.get('/', auth, getAllTickets);
router.get('/stats', auth, getTicketStats);
router.get('/:id', auth, getTicketById);
router.put('/:id', auth, updateTicket);
router.post('/:id/response', auth, addResponse);

module.exports = router;