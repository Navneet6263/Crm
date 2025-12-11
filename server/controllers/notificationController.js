const Notification = require('../models/Notification');
const User = require('../models/User');

// Create notification
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    let query = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .populate('leadId', 'contactPerson companyName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    
    // Format notifications for frontend
    const formattedNotifications = notifications.map(notification => ({
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      priority: notification.priority,
      leadId: notification.leadId?._id,
      createdAt: notification.createdAt
    }));
    
    res.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ 
      message: 'Notification marked as read', 
      notification: {
        id: notification._id,
        isRead: notification.isRead
      }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully', deletedId: id });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

// Helper function to create lead assignment notification
const createLeadAssignmentNotification = async (leadId, assignedToUserId, assignedByUserId) => {
  try {
    const Lead = require('../models/Lead');
    const lead = await Lead.findById(leadId).populate('assignedBy', 'name role');
    
    if (!lead) {
      console.log('❌ Lead not found for notification:', leadId);
      return;
    }
    
    const assignedByUser = await User.findById(assignedByUserId);
    const assignedToUser = await User.findById(assignedToUserId);
    
    console.log('📧 Creating lead assignment notification:', {
      leadId,
      leadCompany: lead.companyName,
      assignedTo: assignedToUser?.name,
      assignedBy: assignedByUser?.name
    });
    
    // Create notification for assigned user
    const notification = await createNotification({
      title: '🎯 New Lead Assigned to You',
      message: `Lead "${lead.companyName || lead.contactPerson}" has been assigned to you by ${assignedByUser?.name || 'Admin'}`,
      type: 'lead_assigned',
      userId: assignedToUserId,
      leadId: leadId,
      priority: 'high',
      actionable: true,
      actionView: 'my-leads',
      metadata: {
        leadCompany: lead.companyName,
        leadContact: lead.contactPerson,
        assignedBy: assignedByUser?.name,
        assignedAt: new Date()
      }
    });
    
    console.log('✅ Lead assignment notification created:', notification?._id);
    return notification;
  } catch (error) {
    console.error('❌ Error creating lead assignment notification:', error);
  }
};

// Helper function to create lead creation notification
const createLeadCreationNotification = async (leadId, createdByUserId) => {
  try {
    const Lead = require('../models/Lead');
    const lead = await Lead.findById(leadId);
    
    if (!lead) return;
    
    // Notify all managers and admins about new lead
    const managers = await User.find({ 
      role: { $in: ['admin', 'manager', 'super-admin'] } 
    });
    
    const createdByUser = await User.findById(createdByUserId);
    
    for (const manager of managers) {
      if (manager._id.toString() !== createdByUserId.toString()) {
        await createNotification({
          title: 'New Lead Created',
          message: `New lead "${lead.companyName || lead.contactPerson}" created by ${createdByUser?.name || 'User'}`,
          type: 'lead_created',
          userId: manager._id,
          leadId: leadId,
          priority: 'medium',
          actionable: true,
          actionView: 'lead-tracker'
        });
      }
    }
    
    console.log('✅ Lead creation notifications sent to managers');
  } catch (error) {
    console.error('Error creating lead creation notification:', error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createLeadAssignmentNotification,
  createLeadCreationNotification
};