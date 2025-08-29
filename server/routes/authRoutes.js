const express = require('express');
const { register, login, getProfile, getAllUsers, checkAuth, logout, createTeamMember } = require('../controllers/authController');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/check-auth', checkAuth); // Auto-login check
router.post('/logout', logout);

// Protected routes
router.get('/profile', auth, getProfile);
router.get('/users', auth, getAllUsers);
router.post('/create-team-member', auth, createTeamMember);

// Health check with optional auth
router.get('/health', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    user: req.user ? req.user.name : 'Not authenticated',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;