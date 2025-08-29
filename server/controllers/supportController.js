const Ticket = require('../models/Ticket');

// Create new support ticket
const createTicket = async (req, res) => {
  try {
    console.log('📝 Creating support ticket:', req.body);
    const { subject, description, priority, type, createdBy, customerEmail } = req.body;

    if (!subject || !description) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required'
      });
    }

    const ticket = new Ticket({
      subject,
      description,
      priority: priority || 'medium',
      type: type || 'technical',
      createdBy: createdBy || req.user?.name || 'Customer',
      customerEmail: customerEmail || req.user?.email || 'customer@example.com',
      customerName: createdBy || req.user?.name || 'Customer'
    });

    console.log('💾 Saving ticket to database...');
    await ticket.save();
    console.log('✅ Ticket saved successfully:', ticket._id);

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    console.error('❌ Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: error.message
    });
  }
};

// Get all tickets (admin/super-admin only)
const getAllTickets = async (req, res) => {
  try {
    console.log('📋 Fetching all tickets with filters:', req.query);
    const { status, priority, type, search } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search };
    }

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    console.log('✅ Found tickets:', tickets.length);

    res.json({
      success: true,
      data: tickets
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

// Get ticket by ID
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket'
    });
  }
};

// Update ticket
const updateTicket = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket'
    });
  }
};

// Add response to ticket
const addResponse = async (req, res) => {
  try {
    console.log('💬 Adding response to ticket:', req.params.id, req.body);
    const { text } = req.body;
    
    if (!text) {
      console.log('❌ Missing response text');
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      console.log('❌ Ticket not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const response = {
      text,
      createdBy: req.user?.name || 'Support Team',
      isStaff: true,
      createdAt: new Date()
    };

    ticket.responses.push(response);
    
    // Update status to in_progress if it was open
    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    console.log('💾 Saving response to ticket...');
    await ticket.save();
    console.log('✅ Response added successfully');

    res.json({
      success: true,
      message: 'Response added successfully',
      data: ticket
    });
  } catch (error) {
    console.error('❌ Error adding response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: error.message
    });
  }
};

// Get ticket statistics
const getTicketStats = async (req, res) => {
  try {
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Ticket.countDocuments();
    
    const formattedStats = {
      total,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  addResponse,
  getTicketStats
};