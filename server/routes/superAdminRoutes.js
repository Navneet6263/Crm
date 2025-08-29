const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createSuperAdmin,
  deactivateUser,
  resetUserPassword,
  getSuperAdminsAndAdmins,
  activateUser,
  getSuperAdminSafetyStatus
} = require('../controllers/superAdminController');

// All routes require authentication and Super Admin role
router.use(auth);

// Get all Super Admins and Admins
router.get('/users', getSuperAdminsAndAdmins);

// Create new Super Admin
router.post('/create-super-admin', createSuperAdmin);

// Deactivate user (Super Admin/Admin only)
router.put('/deactivate/:userId', deactivateUser);

// Activate user
router.put('/activate/:userId', activateUser);

// Reset user password (Super Admin/Admin only)
router.put('/reset-password/:userId', resetUserPassword);

// Get Super Admin safety status
router.get('/safety-status', getSuperAdminSafetyStatus);

module.exports = router;