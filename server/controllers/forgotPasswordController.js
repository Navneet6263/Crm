const User = require('../models/User');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send Reset OTP
const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    });

    // Send OTP email
    await emailService.sendPasswordResetOTP(email, otp, user.name);

    res.json({
      success: true,
      message: 'Password reset code sent to your email'
    });

  } catch (error) {
    console.error('Send reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset code'
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check OTP
    const storedOTP = otpStore.get(email);
    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found. Please request a new one.'
      });
    }

    // Check if OTP expired
    if (Date.now() > storedOTP.expires) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check attempts
    if (storedOTP.attempts >= 3) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      storedOTP.attempts++;
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user password (let the pre-save hook handle hashing)
    user.password = newPassword;
    await user.save();

    // Clear OTP
    otpStore.delete(email);

    // Send confirmation email
    await emailService.sendPasswordResetSuccess(email);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

module.exports = {
  sendResetOTP,
  resetPassword
};