const Communication = require('../models/Communication');
const Lead = require('../models/Lead');

const createCommunication = async (req, res) => {
  try {
    const communicationData = {
      ...req.body,
      createdBy: req.user._id
    };

    const communication = await Communication.create(communicationData);
    await communication.populate('leadId createdBy', 'contactPerson companyName name email');

    res.status(201).json(communication);
  } catch (error) {
    console.error('Error creating communication:', error);
    res.status(400).json({ message: error.message });
  }
};

const getCommunications = async (req, res) => {
  try {
    const { leadId, type, status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role !== 'super-admin' && req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }
    
    if (leadId) query.leadId = leadId;
    if (type) query.type = type;
    if (status) query.status = status;

    const communications = await Communication.find(query)
      .populate('leadId', 'contactPerson companyName email phone')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Communication.countDocuments(query);

    res.json({
      communications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(400).json({ message: error.message });
  }
};

const updateCommunication = async (req, res) => {
  try {
    const communication = await Communication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('leadId createdBy', 'contactPerson companyName name email');

    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    res.json(communication);
  } catch (error) {
    console.error('Error updating communication:', error);
    res.status(400).json({ message: error.message });
  }
};

const deleteCommunication = async (req, res) => {
  try {
    const communication = await Communication.findById(req.params.id);
    
    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    // Check permissions
    const isAdminOrSuperAdmin = ['admin', 'super-admin'].includes(req.user.role);
    const isOwner = communication.createdBy.toString() === req.user._id.toString();
    
    if (!isAdminOrSuperAdmin && !isOwner) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own communications.' 
      });
    }

    await Communication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Communication deleted successfully' });
  } catch (error) {
    console.error('Error deleting communication:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createCommunication,
  getCommunications,
  updateCommunication,
  deleteCommunication
};