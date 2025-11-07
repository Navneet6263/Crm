const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const emailService = {
  sendOTPEmail: async (email, otp) => {
    return await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@greencrm.com',
      to: email,
      subject: 'Green CRM - OTP Verification',
      html: `
        <h2>🔐 Your OTP Code</h2>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>Valid for 10 minutes only.</p>
      `
    });
  },

  sendLeadNotification: async (email, leadData) => {
    return await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@greencrm.com',
      to: email,
      subject: '🎯 New Lead Assigned',
      html: `
        <h2>New Lead Assignment</h2>
        <p><strong>Contact:</strong> ${leadData.contactPerson}</p>
        <p><strong>Company:</strong> ${leadData.companyName}</p>
        <p><strong>Phone:</strong> ${leadData.phone}</p>
      `
    });
  },

  sendTicketCreatedEmail: async (email, ticketData) => {
    return await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@greencrm.com',
      to: email,
      subject: `🎫 Support Ticket Created - ${ticketData.ticketId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🎫 Support Ticket Created</h2>
          <p>Dear ${ticketData.customerName},</p>
          <p>Your support ticket has been successfully created. Our team will review it and respond shortly.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">Ticket Details:</h3>
            <p><strong>Ticket ID:</strong> ${ticketData.ticketId}</p>
            <p><strong>Title:</strong> ${ticketData.title}</p>
            <p><strong>Status:</strong> Open</p>
          </div>
          
          <p>You can track your ticket status and add replies by logging into your account.</p>
          <p>Thank you for contacting our support team!</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `
    });
  },

  sendTicketReplyEmail: async (email, replyData) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `💬 New Reply on Ticket ${replyData.ticketId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">💬 New Reply on Your Ticket</h2>
          <p>Dear ${replyData.customerName},</p>
          <p>You have received a new reply on your support ticket.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">Ticket Details:</h3>
            <p><strong>Ticket ID:</strong> ${replyData.ticketId}</p>
            <p><strong>Title:</strong> ${replyData.title}</p>
            <p><strong>Replied by:</strong> ${replyData.repliedBy}</p>
          </div>
          
          <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #374151;">Reply:</h4>
            <p style="margin: 0; line-height: 1.6;">${replyData.replyMessage}</p>
          </div>
          
          <p>You can view the full conversation and reply by logging into your account.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `
    };
    
    return await transporter.sendMail(mailOptions);
  },

  sendTicketResolvedEmail: async (email, resolvedData) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `✅ Ticket Resolved - ${resolvedData.ticketId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">✅ Your Ticket Has Been Resolved</h2>
          <p>Dear ${resolvedData.customerName},</p>
          <p>Great news! Your support ticket has been resolved by our team.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">Ticket Details:</h3>
            <p><strong>Ticket ID:</strong> ${resolvedData.ticketId}</p>
            <p><strong>Title:</strong> ${resolvedData.title}</p>
            <p><strong>Status:</strong> Resolved</p>
          </div>
          
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #065f46;">Resolution:</h4>
            <p style="margin: 0; line-height: 1.6; color: #047857;">${resolvedData.resolution}</p>
          </div>
          
          <p>If you're satisfied with the resolution, you can now delete this ticket from your account. If you need further assistance, feel free to create a new ticket.</p>
          
          <p>Thank you for using our support services!</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `
    };
    
    return await transporter.sendMail(mailOptions);
  },

  sendPasswordResetOTP: async (email, otp) => {
    return await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@greencrm.com',
      to: email,
      subject: '🔐 Password Reset OTP',
      html: `
        <h2>🔐 Password Reset Request</h2>
        <p>Your password reset OTP is: <strong>${otp}</strong></p>
        <p>Valid for 10 minutes only.</p>
      `
    });
  },

  sendPasswordResetSuccess: async (email) => {
    return await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@greencrm.com',
      to: email,
      subject: '✅ Password Reset Successful',
      html: `
        <h2>✅ Password Reset Successful</h2>
        <p>Your password has been successfully reset.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `
    });
  },

  sendEmail: async ({ to, subject, html }) => {
    return await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@greencrm.com',
      to,
      subject,
      html
    });
  }
};

module.exports = emailService;