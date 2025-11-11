const smsService = require('../services/smsService');
const User = require('../models/User');
const crypto = require('crypto');

// Store OTPs temporarily (in production use Redis)
const otpStore = new Map();

const sendOTP = async (req, res) => {
  try {
    const { phoneNumber, email, method = 'sms' } = req.body;
    const contact = phoneNumber || email;

    if (!contact) {
      return res.status(400).json({ message: 'Phone number or email required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (10 minutes)
    otpStore.set(contact, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      attempts: 0
    });

    // Send OTP based on method
    let sendResult;
    switch (method) {
      case 'sms':
        if (!phoneNumber) {
          return res.status(400).json({ message: 'Phone number required for SMS' });
        }
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
        console.log(`📱 WhatsApp OTP: ${otp} to ${contact}`);
        break;
      case 'email':
        if (!email) {
          return res.status(400).json({ message: 'Email required for email OTP' });
        }
        try {
          const emailService = require('../services/emailService');
          await emailService.sendOTPEmail(email, otp);
          console.log(`📧 Email OTP sent to: ${email}`);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          return res.status(500).json({ message: 'Failed to send email OTP' });
        }
        break;
      default:
        return res.status(400).json({ message: 'Invalid OTP method' });
    }

    res.json({ 
      success: true, 
      message: `OTP sent via ${method}`,
      contact: phoneNumber ? phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3') : email.replace(/(.{2}).*(@.*)/, '$1****$2')
    });

  } catch (error) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, email, otp } = req.body;
    const contact = phoneNumber || email;

    if (!contact || !otp) {
      return res.status(400).json({ message: 'Contact (phone/email) and OTP required' });
    }

    const storedData = otpStore.get(contact);
    
    if (!storedData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    // Check expiry
    if (Date.now() > storedData.expires) {
      otpStore.delete(contact);
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(contact);
      return res.status(400).json({ message: 'Too many attempts' });
    }

    // Verify OTP using secure comparison to prevent timing attacks
    const isValidOTP = crypto.timingSafeEqual(
      Buffer.from(storedData.otp, 'utf8'),
      Buffer.from(otp, 'utf8')
    );
    
    if (!isValidOTP) {
      storedData.attempts++;
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP verified successfully
    otpStore.delete(contact);

    // Find or create user
    let user;
    if (phoneNumber) {
      user = await User.findOne({ phone: phoneNumber });
      if (!user) {
        const tenantId = new require('mongoose').Types.ObjectId();
        user = await User.create({
          name: `User_${phoneNumber.slice(-4)}`,
          phone: phoneNumber,
          email: `${phoneNumber}@temp.com`,
          password: process.env.DEFAULT_USER_PASSWORD || 'temp123',
          role: 'sales',
          loginMethod: 'otp',
          companyId: tenantId,
          tenantId: tenantId
        });
      }
    } else if (email) {
      user = await User.findOne({ email: email });
      if (!user) {
        const tenantId = new require('mongoose').Types.ObjectId();
        user = await User.create({
          name: email.split('@')[0],
          email: email,
          phone: '',
          password: process.env.DEFAULT_USER_PASSWORD || 'temp123',
          role: 'sales',
          loginMethod: 'otp',
          companyId: tenantId,
          tenantId: tenantId
        });
      }
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
        email: user.email,
        phone: user.phone || '',
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
    const { phoneNumber, email } = req.body;
    const contact = phoneNumber || email;
    
    if (!contact) {
      return res.status(400).json({ message: 'Phone number or email required' });
    }
    
    // Check if can resend (rate limiting)
    const storedData = otpStore.get(contact);
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