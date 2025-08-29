const smsService = require('../services/smsService');
const User = require('../models/User');

// Store OTPs temporarily (in production use Redis)
const otpStore = new Map();

const sendOTP = async (req, res) => {
  try {
    const { phoneNumber, method = 'sms' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (10 minutes)
    otpStore.set(phoneNumber, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      attempts: 0
    });

    // Send OTP based on method
    let sendResult;
    switch (method) {
      case 'sms':
        try {
          sendResult = await smsService.sendOTPSMS(phoneNumber, otp);
          console.log('📱 SMS Result:', sendResult);
        } catch (smsError) {
          console.error('SMS sending failed:', smsError);
          return res.status(500).json({ message: 'Failed to send SMS OTP' });
        }
        break;
      case 'whatsapp':
        // WhatsApp integration (future)
        console.log(`📱 WhatsApp OTP: ${otp} to ${phoneNumber}`);
        break;
      case 'email':
        // Email integration (future)
        console.log(`📧 Email OTP: ${otp} to ${phoneNumber}`);
        break;
      default:
        return res.status(400).json({ message: 'Invalid OTP method' });
    }

    res.json({ 
      success: true, 
      message: `OTP sent via ${method}`,
      phoneNumber: phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3') // Mask number
    });

  } catch (error) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP required' });
    }

    const storedData = otpStore.get(phoneNumber);
    
    if (!storedData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    // Check expiry
    if (Date.now() > storedData.expires) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ message: 'Too many attempts' });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts++;
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP verified successfully
    otpStore.delete(phoneNumber);

    // Find or create user
    let user = await User.findOne({ phone: phoneNumber });
    if (!user) {
      // Create new user with phone login
      user = await User.create({
        name: `User_${phoneNumber.slice(-4)}`,
        phone: phoneNumber,
        email: `${phoneNumber}@temp.com`,
        password: 'temp123', // Temporary password
        role: 'sales',
        loginMethod: 'otp'
      });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    // Check if can resend (rate limiting)
    const storedData = otpStore.get(phoneNumber);
    if (storedData && (Date.now() - (storedData.expires - 10 * 60 * 1000)) < 60 * 1000) {
      return res.status(400).json({ message: 'Please wait 1 minute before resending' });
    }

    // Resend OTP
    await sendOTP(req, res);
  } catch (error) {
    console.error('OTP Resend Error:', error);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};

module.exports = { sendOTP, verifyOTP, resendOTP };