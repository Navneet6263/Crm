const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { formatResponse } = require('../utils/helpers');

// Create new Super Admin (RESTRICTED - Only navneet@greencall.com can create)
const createSuperAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json(formatResponse(null, 'Only Super Admin can create Super Admin', 403));
    }

    // SECURITY: Only allow navneet@greencall.com to create new superadmins
    if (req.user.email !== 'navneet@greencall.com') {
      return res.status(403).json(formatResponse(null, 'Unauthorized: Only main Super Admin can create new Super Admins', 403));
    }

    // Check if we already have 4 Super Admins (strict limit)
    const superAdminCount = await User.countDocuments({ role: 'super-admin', isActive: true });
    if (superAdminCount >= 4) {
      return res.status(400).json(formatResponse(null, 'Maximum 4 Super Admins allowed for security', 400));
    }

    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(formatResponse(null, 'User already exists', 400));
    }

    const newSuperAdmin = await User.create({
      name,
      email,
      password,
      role: 'super-admin',
      isActive: true,
      isSuperAdmin: true,
      superAdminLevel: 1,
      canManageSuperAdmins: true,
      createdBy: req.user._id
    });

    res.json(formatResponse({
      _id: newSuperAdmin._id,
      name: newSuperAdmin.name,
      email: newSuperAdmin.email,
      role: newSuperAdmin.role,
      superAdminCount: superAdminCount + 1
    }, `Super Admin created successfully. Total Super Admins: ${superAdminCount + 1}/4`));

  } catch (error) {
    res.status(500).json(formatResponse(null, error.message, 500));
  }
};

// Deactivate Super Admin/Admin (Super Admin cannot deactivate themselves)
const deactivateUser = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json(formatResponse(null, 'Only Super Admin can deactivate users', 403));
    }

    const { userId } = req.params;
    
    // Cannot deactivate themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json(formatResponse(null, 'Cannot deactivate yourself - Safety Net Protection', 400));
    }

    const userToDeactivate = await User.findById(userId);
    if (!userToDeactivate) {
      return res.status(404).json(formatResponse(null, 'User not found', 404));
    }

    // Only allow deactivating Super Admin or Admin
    if (!['super-admin', 'admin'].includes(userToDeactivate.role)) {
      return res.status(400).json(formatResponse(null, 'Can only deactivate Super Admin or Admin users', 400));
    }

    // Safety check: Ensure at least 2 Super Admins remain active
    if (userToDeactivate.role === 'super-admin') {
      const activeSuperAdmins = await User.countDocuments({ 
        role: 'super-admin', 
        isActive: true,
        _id: { $ne: userId }
      });
      
      if (activeSuperAdmins < 2) {
        return res.status(400).json(formatResponse(null, 'Cannot deactivate - At least 2 Super Admins must remain active for safety', 400));
      }
    }

    userToDeactivate.isActive = false;
    userToDeactivate.deactivatedBy = req.user._id;
    userToDeactivate.deactivatedAt = new Date();
    await userToDeactivate.save();

    const remainingActive = await User.countDocuments({ role: 'super-admin', isActive: true });
    
    res.json(formatResponse({
      deactivatedUser: userToDeactivate.name,
      remainingActiveSuperAdmins: remainingActive
    }, `${userToDeactivate.role} deactivated successfully. ${remainingActive} Super Admins remain active.`));

  } catch (error) {
    res.status(500).json(formatResponse(null, error.message, 500));
  }
};

// Reset password for other Super Admin/Admin (cannot reset own password)
const resetUserPassword = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json(formatResponse(null, 'Only Super Admin can reset passwords', 403));
    }

    const { userId } = req.params;
    const { newPassword } = req.body;

    // Cannot reset own password - Safety Net Protection
    if (userId === req.user._id.toString()) {
      return res.status(400).json(formatResponse(null, 'Cannot reset your own password - Safety Net Protection', 400));
    }

    const userToReset = await User.findById(userId);
    if (!userToReset) {
      return res.status(404).json(formatResponse(null, 'User not found', 404));
    }

    // Only allow resetting Super Admin or Admin passwords
    if (!['super-admin', 'admin'].includes(userToReset.role)) {
      return res.status(400).json(formatResponse(null, 'Can only reset Super Admin or Admin passwords', 400));
    }

    // Validate password strength
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json(formatResponse(null, 'Password must be at least 6 characters long', 400));
    }

    userToReset.password = newPassword;
    userToReset.loginAttempts = 0; // Reset login attempts
    userToReset.lockUntil = undefined; // Remove any account lock
    await userToReset.save();

    res.json(formatResponse({
      resetBy: req.user.name,
      resetFor: userToReset.name,
      timestamp: new Date()
    }, `Password reset successfully for ${userToReset.name} by ${req.user.name}`));

  } catch (error) {
    res.status(500).json(formatResponse(null, error.message, 500));
  }
};

// Get all Super Admins and Admins
const getSuperAdminsAndAdmins = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json(formatResponse(null, 'Only Super Admin can view this data', 403));
    }

    const users = await User.find({ 
      role: { $in: ['super-admin', 'admin'] }
    }).select('-password').sort({ createdAt: -1 });

    res.json(formatResponse(users, 'Users retrieved successfully'));

  } catch (error) {
    res.status(500).json(formatResponse(null, error.message, 500));
  }
};

// Activate user
const activateUser = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json(formatResponse(null, 'Only Super Admin can activate users', 403));
    }

    const { userId } = req.params;
    
    const userToActivate = await User.findById(userId);
    if (!userToActivate) {
      return res.status(404).json(formatResponse(null, 'User not found', 404));
    }

    userToActivate.isActive = true;
    userToActivate.deactivatedBy = null;
    userToActivate.deactivatedAt = null;
    await userToActivate.save();

    res.json(formatResponse(null, `${userToActivate.role} activated successfully`));

  } catch (error) {
    res.status(500).json(formatResponse(null, error.message, 500));
  }
};

// Delete Super Admin (permanent removal)
const deleteSuperAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json(formatResponse(null, 'Only Super Admin can delete users', 403));
    }

    const { userId } = req.params;
    
    // Cannot delete themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json(formatResponse(null, 'Cannot delete yourself', 400));
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json(formatResponse(null, 'User not found', 404));
    }

    // Prevent deleting the main super admin
    if (userToDelete.email === 'navneet@greencall.com') {
      return res.status(400).json(formatResponse(null, 'Cannot delete main Super Admin account - PROTECTED', 400));
    }

    // Only allow navneet@greencall.com to delete other superadmins
    if (req.user.email !== 'navneet@greencall.com') {
      return res.status(403).json(formatResponse(null, 'Only main Super Admin can delete Super Admin accounts', 403));
    }

    await User.findByIdAndDelete(userId);
    
    res.json(formatResponse(null, `Super Admin ${userToDelete.name} deleted permanently`));

  } catch (error) {
    res.status(500).json(formatResponse(null, error.message, 500));
  }
};

// Get Super Admin Safety Status
const getSuperAdminSafetyStatus = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json(formatResponse(null, 'Only Super Admin can view safety status', 403));
    }

    const totalSuperAdmins = await User.countDocuments({ role: 'super-admin' });
    const activeSuperAdmins = await User.countDocuments({ role: 'super-admin', isActive: true });
    const inactiveSuperAdmins = totalSuperAdmins - activeSuperAdmins;
    
    const superAdminsList = await User.find({ role: 'super-admin' })
      .select('name email isActive createdAt lastLogin deactivatedBy deactivatedAt')
      .populate('deactivatedBy', 'name email')
      .sort({ createdAt: 1 });

    const safetyStatus = {
      isSafe: activeSuperAdmins >= 1,
      totalSuperAdmins,
      activeSuperAdmins,
      inactiveSuperAdmins,
      maxAllowed: 4,
      canCreateMore: activeSuperAdmins < 4,
      safetyLevel: activeSuperAdmins >= 3 ? 'HIGH' : activeSuperAdmins >= 2 ? 'MEDIUM' : 'LOW',
      superAdminsList
    };

    res.json(formatResponse(safetyStatus, 'Super Admin safety status retrieved'));

  } catch (error) {
    res.status(500).json(formatResponse(null, error.message, 500));
  }
};

module.exports = {
  createSuperAdmin,
  deactivateUser,
  resetUserPassword,
  getSuperAdminsAndAdmins,
  activateUser,
  getSuperAdminSafetyStatus,
  deleteSuperAdmin
};