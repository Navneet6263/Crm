const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

// Get user profile
router.get('/profile', auth, settingsController.getUserProfile);

// Update user profile
router.put('/profile', auth, settingsController.updateUserProfile);

// Change password
router.put('/password', auth, settingsController.changePassword);

// Update notification preferences
router.put('/notifications', auth, settingsController.updateNotificationPreferences);

// Update app preferences
router.put('/preferences', auth, settingsController.updateAppPreferences);

// Toggle 2FA
router.put('/2fa', auth, settingsController.toggle2FA);

module.exports = router;