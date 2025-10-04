const express = require('express');
const { register, login, getProfile, getAllUsers, checkAuth, logout, createTeamMember, toggleUserStatus, createEmployee } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { checkUserLimit } = require('../middleware/userLimit');

const router = express.Router();

// Public routes
router.post('/register', checkUserLimit, register);
router.post('/login', login);
router.get('/check-auth', checkAuth);
router.post('/logout', logout);
router.post('/forgot-password', require('../controllers/forgotPasswordController').sendResetOTP);
router.post('/reset-password', require('../controllers/forgotPasswordController').resetPassword);

// Protected routes
router.get('/profile', auth, getProfile);
router.get('/users', auth, getAllUsers);
router.post('/create-team-member', auth, (req, res, next) => {
  if (req.user && req.user.role === 'super-admin') {
    return next();
  }
  return checkUserLimit(req, res, next);
}, createTeamMember);
router.put('/users/:userId/toggle', auth, toggleUserStatus);
router.post('/create-employee', auth, createEmployee);

module.exports = router;