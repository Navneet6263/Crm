const DemoRequest = require('../models/DemoRequest');
const { formatResponse } = require('../utils/helpers');
const emailService = require('../services/emailService');

// Get all demo requests
const getDemoRequests = async (req, res) => {
  try {
    const demoRequests = await DemoRequest.find()
      .populate('processedBy', 'name email')
      .sort({ submittedAt: -1 });
    
    res.json(formatResponse(demoRequests, 'Demo requests retrieved successfully'));
  } catch (error) {
    console.error('Error fetching demo requests:', error);
    res.status(500).json(formatResponse(null, error.message, 500));
  }
};

// Create new demo request
const createDemoRequest = async (req, res) => {
  try {
    const { name, email, phone, company, employees, date, time } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !company || !employees || !date || !time) {
      return res.status(400).json(formatResponse(null, 'All fields are required', 400));
    }
    
    // Check if slot is already booked
    const existingRequest = await DemoRequest.findOne({
      date,
      time,
      status: 'approved'
    });
    
    if (existingRequest) {
      return res.status(400).json(formatResponse(null, 'This time slot is already booked', 400));
    }
    
    const demoRequest = new DemoRequest({
      name,
      email,
      phone,
      company,
      employees,
      date,
      time,
      status: 'pending'
    });
    
    await demoRequest.save();
    
    res.status(201).json(formatResponse(demoRequest, 'Demo request created successfully'));
  } catch (error) {
    console.error('Error creating demo request:', error);
    res.status(500).json(formatResponse(null, error.message, 500));
  }
};

// Approve demo request
const approveDemoRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const demoRequest = await DemoRequest.findById(id);
    if (!demoRequest) {
      return res.status(404).json(formatResponse(null, 'Demo request not found', 404));
    }
    
    if (demoRequest.status !== 'pending') {
      return res.status(400).json(formatResponse(null, 'Demo request already processed', 400));
    }
    
    demoRequest.status = 'approved';
    demoRequest.processedAt = new Date();
    demoRequest.processedBy = req.user._id;
    
    await demoRequest.save();
    
    // Send approval email with Google Meet link
    try {
      await emailService.sendDemoApprovalEmail(demoRequest.email, demoRequest);
      console.log('✅ Demo approval email sent to:', demoRequest.email);
    } catch (emailError) {
      console.error('❌ Error sending approval email:', emailError);
      // Don't fail the approval if email fails
    }
    
    res.json(formatResponse(demoRequest, 'Demo request approved successfully'));
  } catch (error) {
    console.error('Error approving demo request:', error);
    res.status(500).json(formatResponse(null, error.message, 500));
  }
};

// Reject demo request
const rejectDemoRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const demoRequest = await DemoRequest.findById(id);
    if (!demoRequest) {
      return res.status(404).json(formatResponse(null, 'Demo request not found', 404));
    }
    
    if (demoRequest.status !== 'pending') {
      return res.status(400).json(formatResponse(null, 'Demo request already processed', 400));
    }
    
    demoRequest.status = 'rejected';
    demoRequest.processedAt = new Date();
    demoRequest.processedBy = req.user._id;
    
    await demoRequest.save();
    
    res.json(formatResponse(demoRequest, 'Demo request rejected successfully'));
  } catch (error) {
    console.error('Error rejecting demo request:', error);
    res.status(500).json(formatResponse(null, error.message, 500));
  }
};

// Delete demo request
const deleteDemoRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const demoRequest = await DemoRequest.findById(id);
    if (!demoRequest) {
      return res.status(404).json(formatResponse(null, 'Demo request not found', 404));
    }
    
    await DemoRequest.findByIdAndDelete(id);
    
    res.json(formatResponse(null, 'Demo request deleted successfully'));
  } catch (error) {
    console.error('Error deleting demo request:', error);
    res.status(500).json(formatResponse(null, error.message, 500));
  }
};



module.exports = {
  getDemoRequests,
  createDemoRequest,
  approveDemoRequest,
  rejectDemoRequest,
  deleteDemoRequest
};