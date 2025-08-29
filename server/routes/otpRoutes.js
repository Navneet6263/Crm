const express = require('express');
const { sendOTP, verifyOTP, resendOTP } = require('../controllers/otpController');

const router = express.Router();

// @route   POST /api/otp/send
// @desc    Send OTP to phone number
// @access  Public
router.post('/send', sendOTP);

// @route   POST /api/otp/verify
// @desc    Verify OTP and login
// @access  Public
router.post('/verify', verifyOTP);

// @route   POST /api/otp/resend
// @desc    Resend OTP
// @access  Public
router.post('/resend', resendOTP);

module.exports = router;