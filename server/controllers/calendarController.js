const Calendar = require('../models/Calendar');
const Lead = require('../models/Lead');

const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Parse attendees if it's a string
    if (typeof eventData.attendees === 'string') {
      eventData.attendees = eventData.attendees.split(',').map(email => ({
        email: email.trim(),
        name: email.trim().split('@')[0]
      }));
    }

    const event = await Calendar.create(eventData);
    await event.populate('createdBy', 'name email');

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ message: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      type, 
      status, 
      relatedTo, 
      relatedId,
      page = 1, 
      limit = 50 
    } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role !== 'super-admin' && req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }
    
    // Date range filter
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (relatedTo) query.relatedTo = relatedTo;
    if (relatedId) query.relatedId = relatedId;

    const events = await Calendar.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Calendar.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(400).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Calendar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    const isAdminOrSuperAdmin = ['admin', 'super-admin'].includes(req.user.role);
    const isOwner = event.createdBy.toString() === req.user._id.toString();
    
    if (!isAdminOrSuperAdmin && !isOwner) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own events.' 
      });
    }

    await Calendar.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(400).json({ message: error.message });
  }
};

const getTodayEvents = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    let query = {
      startDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    };

    // Role-based filtering
    if (req.user.role !== 'super-admin' && req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    const events = await Calendar.find(query)
      .populate('createdBy', 'name email')
      .sort({ startTime: 1 });

    res.json(events);
  } catch (error) {
    console.error('Error fetching today events:', error);
    res.status(400).json({ message: error.message });
  }
};

const getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    let query = {
      startDate: {
        $gt: today,
        $lte: nextWeek
      }
    };

    // Role-based filtering
    if (req.user.role !== 'super-admin' && req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    const events = await Calendar.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 })
      .limit(10);

    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  getTodayEvents,
  getUpcomingEvents
};