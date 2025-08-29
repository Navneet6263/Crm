const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const emailService = {
  sendOTPEmail: async (email, otp) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Green CRM - OTP Verification',
      html: `
        <h2>🔐 Your OTP Code</h2>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>Valid for 10 minutes only.</p>
      `
    };
    
    return await transporter.sendMail(mailOptions);
  },

  sendLeadNotification: async (email, leadData) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎯 New Lead Assigned',
      html: `
        <h2>New Lead Assignment</h2>
        <p><strong>Contact:</strong> ${leadData.contactPerson}</p>
        <p><strong>Company:</strong> ${leadData.companyName}</p>
        <p><strong>Phone:</strong> ${leadData.phone}</p>
      `
    };
    
    return await transporter.sendMail(mailOptions);
  }
};

module.exports = emailService;