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
      action: 'super_admin_created',
      newUser: {
        id: newSuperAdmin._id,
        name: newSuperAdmin.name,
        email: newSuperAdmin.email,
        type: 'Super Admin',
        role: newSuperAdmin.role,
        isMainSuperAdmin: false
      },
      createdBy: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        type: 'Super Admin',
        isMainSuperAdmin: req.user.email === 'navneet@greencall.com'
      },
      superAdminStats: {
        total: superAdminCount + 1,
        maxAllowed: 4,
        remaining: 4 - (superAdminCount + 1)
      },
      timestamp: new Date()
    }, `Super Admin ${newSuperAdmin.name} created successfully by ${req.user.name}. Total Super Admins: ${superAdminCount + 1}/4`));

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
    
    // Enhanced response with clear identification
    const userType = userToDeactivate.role === 'super-admin' ? 'Super Admin' : 'Admin';
    const actionBy = `${req.user.name} (${req.user.email})`;
    
    res.json(formatResponse({
      action: 'deactivated',
      targetUser: {
        id: userToDeactivate._id,
        name: userToDeactivate.name,
        email: userToDeactivate.email,
        type: userType,
        role: userToDeactivate.role
      },
      actionBy: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        type: 'Super Admin'
      },
      remainingActiveSuperAdmins: remainingActive,
      timestamp: new Date()
    }, `${userType} ${userToDeactivate.name} deactivated by ${actionBy}. ${remainingActive} Super Admins remain active.`));

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

    // Enhanced response with clear identification
    const userType = userToReset.role === 'super-admin' ? 'Super Admin' : 'Admin';
    const actionBy = `${req.user.name} (${req.user.email})`;

    res.json(formatResponse({
      action: 'password_reset',
      targetUser: {
        id: userToReset._id,
        name: userToReset.name,
        email: userToReset.email,
        type: userType,
        role: userToReset.role
      },
      actionBy: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        type: 'Super Admin'
      },
      timestamp: new Date(),
      securityNote: 'Login attempts reset and account unlocked'
    }, `Password reset successfully for ${userType} ${userToReset.name} by ${actionBy}`));

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
    })
    .select('-password')
    .populate('createdBy', 'name email role')
    .populate('deactivatedBy', 'name email role')
    .sort({ createdAt: -1 });

    // Add user type indicator for better identification
    const usersWithType = users.map(user => ({
      ...user.toObject(),
      userType: user.role === 'super-admin' ? 'Super Admin' : 'Admin',
      roleIcon: user.role === 'super-admin' ? '👑' : '🛡️',
      isMainSuperAdmin: user.email === 'navneet@greencall.com',
      canBeModified: user.email !== 'navneet@greencall.com' && user._id.toString() !== req.user._id.toString()
    }));

    res.json(formatResponse(usersWithType, 'Users retrieved successfully'));

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

    // Enhanced response with clear identification
    const userType = userToActivate.role === 'super-admin' ? 'Super Admin' : 'Admin';
    const actionBy = `${req.user.name} (${req.user.email})`;

    res.json(formatResponse({
      action: 'activated',
      targetUser: {
        id: userToActivate._id,
        name: userToActivate.name,
        email: userToActivate.email,
        type: userType,
        role: userToActivate.role
      },
      actionBy: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        type: 'Super Admin'
      },
      timestamp: new Date()
    }, `${userType} ${userToActivate.name} activated by ${actionBy}`));

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
      .select('name email isActive createdAt lastLogin deactivatedBy deactivatedAt role')
      .populate('deactivatedBy', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: 1 });

    // Enhanced super admin list with clear identification
    const enhancedSuperAdminsList = superAdminsList.map(admin => ({
      ...admin.toObject(),
      userType: 'Super Admin',
      roleIcon: '👑',
      isMainSuperAdmin: admin.email === 'navneet@greencall.com',
      statusIcon: admin.isActive ? '✅' : '❌',
      canBeModified: admin.email !== 'navneet@greencall.com' && admin._id.toString() !== req.user._id.toString()
    }));

    const safetyStatus = {
      isSafe: activeSuperAdmins >= 1,
      totalSuperAdmins,
      activeSuperAdmins,
      inactiveSuperAdmins,
      maxAllowed: 4,
      canCreateMore: activeSuperAdmins < 4,
      safetyLevel: activeSuperAdmins >= 3 ? 'HIGH' : activeSuperAdmins >= 2 ? 'MEDIUM' : 'LOW',
      superAdminsList: enhancedSuperAdminsList,
      currentUser: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isMainSuperAdmin: req.user.email === 'navneet@greencall.com'
      }
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