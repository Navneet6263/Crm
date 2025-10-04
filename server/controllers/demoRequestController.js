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
      await sendApprovalEmail(demoRequest);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
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

// Send approval email with Google Meet link
const sendApprovalEmail = async (demoRequest) => {
  const googleMeetLink = 'https://meet.google.com/uqk-sjqx-vde';
  const meetingId = 'uqk-sjqx-vde';
  
  const demoDateTime = new Date(`${demoRequest.date} ${demoRequest.time}`).toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const subject = `🎉 Demo Request Approved - ${demoRequest.company} | Green CRM`;
  
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: linear-gradient(135deg, #22c55e, #4ade80); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Demo Request Approved!</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Green CRM demo is confirmed</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${demoRequest.name},</p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">
          Congratulations! Your demo request has been <strong>APPROVED</strong>! 🎉
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📋 Demo Details:</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px; color: #374151;"><strong>Company:</strong> ${demoRequest.company}</li>
            <li style="margin-bottom: 8px; color: #374151;"><strong>Date & Time:</strong> ${demoDateTime}</li>
            <li style="margin-bottom: 8px; color: #374151;"><strong>Attendees:</strong> ${demoRequest.employees} employees</li>
          </ul>
        </div>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0;">🔗 Google Meet Details</h3>
          <p style="margin: 10px 0;"><strong>Meeting Link:</strong></p>
          <a href="${googleMeetLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0;">${googleMeetLink}</a>
          <p style="margin: 10px 0; color: #1e40af;"><strong>Meeting ID:</strong> ${meetingId}</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #166534; margin: 0 0 15px 0;">📝 What to expect:</h3>
          <ul style="color: #166534; margin: 0; padding-left: 20px;">
            <li>Complete CRM walkthrough</li>
            <li>Feature demonstration</li>
            <li>Q&A session</li>
            <li>Pricing discussion</li>
          </ul>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">⏰ Please join the meeting 5 minutes early.</p>
        </div>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Looking forward to showing you how Green CRM can transform your business!
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0;">Best regards,</p>
          <p style="color: #22c55e; font-weight: 600; margin: 5px 0 0 0;">Green CRM Team</p>
        </div>
      </div>
    </div>
  `;
  
  try {
    await emailService.sendEmail({
      to: demoRequest.email,
      subject: subject,
      html: emailBody
    });
  } catch (error) {
    console.error('Failed to send approval email:', error);
  }
};

module.exports = {
  getDemoRequests,
  createDemoRequest,
  approveDemoRequest,
  rejectDemoRequest,
  deleteDemoRequest
};