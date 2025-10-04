const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Company = require('../models/Company');
const emailService = require('../services/emailService');

// Create new support ticket
const createSupportTicket = async (req, res) => {
  try {
    console.log('📝 Creating enhanced support ticket:', req.body);
    const { 
      title, 
      description, 
      priority, 
      category, 
      customerName, 
      customerEmail, 
      customerPhone,
      companyName 
    } = req.body;

    if (!title || !description || !customerEmail || !customerName) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, customer name and email are required'
      });
    }

    // Check if user is from a company
    let companyId = null;
    let companyInfo = null;
    
    if (req.user && req.user.companyId) {
      companyId = req.user.companyId;
      companyInfo = await Company.findById(companyId);
    } else if (companyName) {
      companyInfo = await Company.findOne({ name: companyName });
      if (companyInfo) {
        companyId = companyInfo._id;
      }
    }

    const ticketData = {
      title,
      description,
      priority: priority || 'medium',
      category: category || 'general',
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      companyId,
      companyName: companyInfo ? companyInfo.name : (companyName || ''),
      createdBy: req.user ? req.user.name : customerName,
      customerUserId: req.user ? req.user._id : null
    };

    const ticket = new SupportTicket(ticketData);
    await ticket.save();

    // Notify all admins and super-admins
    await notifyAdminsOfNewTicket(ticket, companyId);

    // Send email notification to customer
    try {
      await emailService.sendTicketCreatedEmail(customerEmail, {
        ticketId: ticket.ticketId,
        title: ticket.title,
        customerName: ticket.customerName
      });
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }

    console.log('✅ Enhanced ticket created successfully:', ticket.ticketId);

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: {
        ticketId: ticket.ticketId,
        _id: ticket._id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error creating enhanced ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: error.message
    });
  }
};

// Get tickets with proper access control
const getTickets = async (req, res) => {
  try {
    const { status, priority, category, search, page = 1, limit = 20 } = req.query;
    const user = req.user;

    let query = { status: { $ne: 'deleted' } };

    // Access control based on user role
    if (user.role === 'super-admin') {
      // Super admin can see all tickets
    } else if (user.role === 'admin') {
      // Admin can see tickets from their company
      query.companyId = user.companyId;
    } else {
      // Regular users can only see their own tickets
      query.customerUserId = user._id;
    }

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    
    const tickets = await SupportTicket.find(query)
      .populate('assignedTo', 'name email')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SupportTicket.countDocuments(query);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: tickets.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

// Get single ticket with replies
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    let query = { _id: id, status: { $ne: 'deleted' } };

    // Access control
    if (user.role !== 'super-admin') {
      if (user.role === 'admin') {
        query.companyId = user.companyId;
      } else {
        query.customerUserId = user._id;
      }
    }

    const ticket = await SupportTicket.findOne(query)
      .populate('assignedTo', 'name email')
      .populate('companyId', 'name')
      .populate('resolvedBy', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('❌ Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: error.message
    });
  }
};

// Add reply to ticket
const addTicketReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const user = req.user;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    let query = { _id: id, status: { $ne: 'deleted' } };

    // Access control for viewing/replying to ticket
    if (user.role !== 'super-admin') {
      if (user.role === 'admin') {
        query.companyId = user.companyId;
      } else {
        query.customerUserId = user._id;
      }
    }

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied'
      });
    }

    // Create reply object
    const reply = {
      message: message.trim(),
      repliedBy: user.name,
      repliedByRole: user.role,
      repliedByUserId: user._id,
      isStaff: ['admin', 'super-admin', 'support'].includes(user.role),
      createdAt: new Date()
    };

    ticket.replies.push(reply);
    
    // Update ticket status if it was open
    if (ticket.status === 'open') {
      ticket.status = 'in-progress';
    }

    await ticket.save();

    // Send notifications
    await notifyTicketReply(ticket, reply, user);

    // Send email to customer if reply is from staff
    if (reply.isStaff && ticket.customerEmail) {
      try {
        await emailService.sendTicketReplyEmail(ticket.customerEmail, {
          ticketId: ticket.ticketId,
          title: ticket.title,
          replyMessage: message,
          repliedBy: user.name,
          customerName: ticket.customerName
        });
      } catch (emailError) {
        console.log('Email notification failed:', emailError.message);
      }
    }

    res.json({
      success: true,
      message: 'Reply added successfully',
      data: {
        reply,
        ticketStatus: ticket.status
      }
    });
  } catch (error) {
    console.error('❌ Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
};

// Update ticket (admin/super-admin only)
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, resolution } = req.body;
    const user = req.user;

    if (!['admin', 'super-admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    let query = { _id: id, status: { $ne: 'deleted' } };

    // Access control for admin
    if (user.role === 'admin') {
      query.companyId = user.companyId;
    }

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied'
      });
    }

    const updateData = {};
    let statusChanged = false;

    if (status && status !== ticket.status) {
      updateData.status = status;
      statusChanged = true;
      
      if (status === 'resolved') {
        updateData.resolvedBy = user._id;
        updateData.resolvedByName = user.name;
        updateData.resolvedAt = new Date();
        updateData.canCustomerDelete = true;
        if (resolution) {
          updateData.resolution = resolution;
        }
      }
    }

    if (priority) updateData.priority = priority;
    
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser) {
        updateData.assignedTo = assignedTo;
        updateData.assignedToName = assignedUser.name;
      }
    }

    if (resolution) updateData.resolution = resolution;

    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('assignedTo', 'name email');

    // Send notifications for status change
    if (statusChanged) {
      await notifyTicketStatusChange(updatedTicket, user);
    }

    // Send email to customer for resolution
    if (status === 'resolved' && updatedTicket.customerEmail) {
      try {
        await emailService.sendTicketResolvedEmail(updatedTicket.customerEmail, {
          ticketId: updatedTicket.ticketId,
          title: updatedTicket.title,
          resolution: resolution || 'Your ticket has been resolved.',
          customerName: updatedTicket.customerName
        });
      } catch (emailError) {
        console.log('Email notification failed:', emailError.message);
      }
    }

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('❌ Error updating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket',
      error: error.message
    });
  }
};

// Delete ticket (customer only after resolution)
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const ticket = await SupportTicket.findOne({
      _id: id,
      customerUserId: user._id,
      status: { $ne: 'deleted' }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied'
      });
    }

    if (!ticket.canCustomerDelete) {
      return res.status(403).json({
        success: false,
        message: 'Ticket can only be deleted after it has been resolved'
      });
    }

    ticket.status = 'deleted';
    ticket.deletedBy = user._id;
    ticket.deletedAt = new Date();
    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ticket',
      error: error.message
    });
  }
};

// Get ticket statistics
const getTicketStats = async (req, res) => {
  try {
    const user = req.user;
    let matchQuery = { status: { $ne: 'deleted' } };

    // Access control
    if (user.role === 'admin') {
      matchQuery.companyId = user.companyId;
    } else if (user.role !== 'super-admin') {
      matchQuery.customerUserId = user._id;
    }

    const stats = await SupportTicket.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await SupportTicket.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await SupportTicket.countDocuments(matchQuery);

    const formattedStats = {
      total,
      byStatus: {
        open: 0,
        'in-progress': 0,
        resolved: 0,
        closed: 0
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      }
    };

    stats.forEach(stat => {
      formattedStats.byStatus[stat._id] = stat.count;
    });

    priorityStats.forEach(stat => {
      formattedStats.byPriority[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Helper function to notify admins of new ticket
const notifyAdminsOfNewTicket = async (ticket, companyId) => {
  try {
    let adminQuery = { 
      role: { $in: ['admin', 'super-admin'] },
      isActive: true 
    };

    if (companyId) {
      adminQuery.$or = [
        { role: 'super-admin' },
        { companyId: companyId }
      ];
    } else {
      adminQuery.role = 'super-admin';
    }

    const admins = await User.find(adminQuery);

    const notifications = admins.map(admin => ({
      title: 'New Support Ticket',
      message: `New ticket "${ticket.title}" created by ${ticket.customerName}`,
      type: 'ticket_created',
      userId: admin._id,
      ticketId: ticket._id,
      ticketNumber: ticket.ticketId,
      companyId: ticket.companyId,
      priority: 'medium',
      actionable: true,
      actionView: 'support-tickets'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
};

// Helper function to notify about ticket reply
const notifyTicketReply = async (ticket, reply, repliedByUser) => {
  try {
    const notifications = [];

    if (reply.isStaff) {
      // Staff replied - notify customer if they have an account
      if (ticket.customerUserId) {
        notifications.push({
          title: 'Ticket Reply',
          message: `${repliedByUser.name} replied to your ticket "${ticket.title}"`,
          type: 'ticket_reply',
          userId: ticket.customerUserId,
          ticketId: ticket._id,
          ticketNumber: ticket.ticketId,
          companyId: ticket.companyId,
          priority: 'medium',
          actionable: true,
          actionView: 'support-tickets'
        });
      }
    } else {
      // Customer replied - notify assigned admin or all admins
      let adminQuery = { 
        role: { $in: ['admin', 'super-admin'] },
        isActive: true 
      };

      if (ticket.assignedTo) {
        adminQuery._id = ticket.assignedTo;
      } else if (ticket.companyId) {
        adminQuery.$or = [
          { role: 'super-admin' },
          { companyId: ticket.companyId }
        ];
      } else {
        adminQuery.role = 'super-admin';
      }

      const admins = await User.find(adminQuery);

      admins.forEach(admin => {
        notifications.push({
          title: 'Customer Reply',
          message: `${ticket.customerName} replied to ticket "${ticket.title}"`,
          type: 'ticket_reply',
          userId: admin._id,
          ticketId: ticket._id,
          ticketNumber: ticket.ticketId,
          companyId: ticket.companyId,
          priority: 'medium',
          actionable: true,
          actionView: 'support-tickets'
        });
      });
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error notifying ticket reply:', error);
  }
};

// Helper function to notify about status change
const notifyTicketStatusChange = async (ticket, changedByUser) => {
  try {
    const notifications = [];

    // Notify customer if they have an account
    if (ticket.customerUserId) {
      notifications.push({
        title: 'Ticket Status Updated',
        message: `Your ticket "${ticket.title}" status changed to ${ticket.status}`,
        type: 'ticket_status_changed',
        userId: ticket.customerUserId,
        ticketId: ticket._id,
        ticketNumber: ticket.ticketId,
        companyId: ticket.companyId,
        priority: ticket.status === 'resolved' ? 'high' : 'medium',
        actionable: true,
        actionView: 'support-tickets',
        metadata: {
          newStatus: ticket.status,
          changedBy: changedByUser.name
        }
      });
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error notifying status change:', error);
  }
};

module.exports = {
  createSupportTicket,
  getTickets,
  getTicketById,
  addTicketReply,
  updateTicket,
  deleteTicket,
  getTicketStats
};