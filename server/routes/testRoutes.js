const express = require('express');
const { sendLeadAssignmentEmail, sendLeadReminderEmail } = require('../services/emailService');
const Lead = require('../models/Lead');
const User = require('../models/User');

const router = express.Router();

// Test lead assignment email
router.post('/test-assignment-email', async (req, res) => {
  try {
    const { assignedUserId, leadId, assignerUserId } = req.body;
    
    const assignedUser = await User.findById(assignedUserId);
    const lead = await Lead.findById(leadId);
    const assignerUser = await User.findById(assignerUserId);
    
    if (!assignedUser || !lead || !assignerUser) {
      return res.status(400).json({ message: 'User or lead not found' });
    }
    
    await sendLeadAssignmentEmail(assignedUser, lead, assignerUser);
    res.json({ message: 'Assignment email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test lead reminder email
router.post('/test-reminder-email', async (req, res) => {
  try {
    const { assignedUserId, leadId, assignerUserId } = req.body;
    
    const assignedUser = await User.findById(assignedUserId);
    const lead = await Lead.findById(leadId);
    const assignerUser = await User.findById(assignerUserId);
    
    if (!assignedUser || !lead || !assignerUser) {
      return res.status(400).json({ message: 'User or lead not found' });
    }
    
    await sendLeadReminderEmail(assignerUser, assignedUser, lead);
    res.json({ message: 'Reminder email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;