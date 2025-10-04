const User = require('../models/User');
const Company = require('../models/Company');
const bcrypt = require('bcryptjs');

// Get user profile with company details
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .populate('companyId', 'name industry companySize website contactEmail contactPhone')
      .select('-password -twoFactorSecret -activeSessions');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar || user.profilePicture || '',
      companyName: user.companyId?.name || user.company || '',
      company: user.companyId ? {
        name: user.companyId.name,
        industry: user.companyId.industry || '',
        size: user.companyId.companySize || '',
        website: user.companyId.website || '',
        email: user.companyId.contactEmail || '',
        phone: user.companyId.contactPhone || ''
      } : null,
      loginMethod: user.loginMethod,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      notificationPreferences: user.notificationPreferences || {
        emailNotifications: true,
        pushNotifications: true,
        leadAlerts: true,
        taskReminders: true,
        weeklyReports: false,
        marketingEmails: false
      },
      appPreferences: user.appPreferences || {
        language: 'en',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        currency: 'INR'
      }
    };

    res.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, avatar } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).populate('companyId', 'name industry companySize website contactEmail contactPhone')
     .select('-password -twoFactorSecret -activeSessions');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar || user.profilePicture || '',
      companyName: user.companyId?.name || user.company || '',
      company: user.companyId ? {
        name: user.companyId.name,
        industry: user.companyId.industry || '',
        size: user.companyId.companySize || '',
        website: user.companyId.website || '',
        email: user.companyId.contactEmail || '',
        phone: user.companyId.contactPhone || ''
      } : null,
      loginMethod: user.loginMethod,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      notificationPreferences: user.notificationPreferences || {
        emailNotifications: true,
        pushNotifications: true,
        leadAlerts: true,
        taskReminders: true,
        weeklyReports: false,
        marketingEmails: false
      },
      appPreferences: user.appPreferences || {
        language: 'en',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        currency: 'INR'
      }
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Check if user is super admin
    if (req.user.role === 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Super admin cannot change password through this method'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Update notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    await User.findByIdAndUpdate(userId, {
      notificationPreferences: preferences
    });

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences
    });

  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
};

// Update app preferences
const updateAppPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    await User.findByIdAndUpdate(userId, {
      appPreferences: preferences
    });

    res.json({
      success: true,
      message: 'App preferences updated successfully',
      data: preferences
    });

  } catch (error) {
    console.error('Update app preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update app preferences'
    });
  }
};

// Toggle 2FA
const toggle2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { enabled } = req.body;

    // Check if user is super admin
    if (req.user.role === 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Super admin cannot use two-factor authentication'
      });
    }

    await User.findByIdAndUpdate(userId, {
      twoFactorEnabled: enabled
    });

    res.json({
      success: true,
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`
    });

  } catch (error) {
    console.error('Toggle 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update two-factor authentication'
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateNotificationPreferences,
  updateAppPreferences,
  toggle2FA
};