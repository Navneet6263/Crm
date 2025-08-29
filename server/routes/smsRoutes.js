const express = require('express');
const smsService = require('../services/smsService');

const router = express.Router();

// @route   POST /api/sms/send
// @desc    Send SMS
// @access  Public
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber, message, templateId } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ message: 'Phone number and message required' });
    }

    const result = await smsService.sendSMS(phoneNumber, message, templateId);
    
    res.json({
      success: true,
      message: 'SMS sent successfully',
      data: result
    });

  } catch (error) {
    console.error('SMS Route Error:', error);
    res.status(500).json({ message: 'Failed to send SMS' });
  }
});

module.exports = router;