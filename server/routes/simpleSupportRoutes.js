const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Simple ticket creation
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('='.repeat(50));
    console.log('🎫 SUPPORT TICKET REQUEST RECEIVED!');
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('🔑 User:', JSON.stringify(req.user, null, 2));
    console.log('='.repeat(50));
    
    const SupportTicket = require('../models/SupportTicket');
    
    const { subject, description, priority, type, createdBy, customerEmail } = req.body;
    
    const ticket = new SupportTicket({
      title: subject,
      description: description,
      priority: priority || 'medium',
      category: type || 'general',
      createdBy: createdBy || req.user?.name || 'Customer',
      customerEmail: customerEmail || req.user?.email || 'customer@example.com'
    });

    console.log('🎫 Creating ticket with data:', ticket);
    const savedTicket = await ticket.save();
    console.log('✅ Ticket saved successfully:', savedTicket._id);
    res.status(201).json(savedTicket);
  } catch (error) {
    console.error('Support ticket creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create support ticket',
      error: error.message 
    });
  }
});

module.exports = router;