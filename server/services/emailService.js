const nodemailer = require('nodemailer');

// SMTP Configuration for Green Call
const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.greencall.co.in',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true, // Enable debug for troubleshooting
  logger: true
});

const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER;

console.log('✅ SMTP Email Service initialized');
console.log('📧 SMTP From Email:', SMTP_FROM);

// Helper function to send email via SMTP
const sendSMTPEmail = async ({ to, subject, html }) => {
  try {
    const result = await smtpTransporter.sendMail({
      from: SMTP_FROM,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html
    });
    console.log('✅ SMTP Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ SMTP Email failed:', error.message);
    throw error;
  }
};

const emailService = {
  sendOTPEmail: async (email, otp) => {
    try {
      return await sendSMTPEmail({
        to: email,
        subject: 'Green CRM - OTP Verification',
        html: `
          <h2>🔐 Your OTP Code</h2>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>Valid for 10 minutes only.</p>
        `
      });
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error.message);
      throw error;
    }
  },

  sendLeadNotification: async (email, leadData) => {
    try {
      return await sendSMTPEmail({
        to: email,
        subject: '🎯 New Lead Assigned',
        html: `
          <h2>New Lead Assignment</h2>
          <p><strong>Contact:</strong> ${leadData.contactPerson}</p>
          <p><strong>Company:</strong> ${leadData.companyName}</p>
          <p><strong>Phone:</strong> ${leadData.phone}</p>
        `
      });
    } catch (error) {
      console.error('❌ Failed to send lead notification:', error.message);
      throw error;
    }
  },

  sendTicketCreatedEmail: async (email, ticketData) => {
    try {
      const emailContent = {
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
      };
      
      return await sendSMTPEmail(emailContent);
    } catch (error) {
      console.error('❌ Failed to send ticket created email:', error.message);
      throw error;
    }
  },

  sendPasswordResetOTP: async (email, otp, name) => {
    try {
      return await sendSMTPEmail({
        to: email,
        subject: '🔐 Green CRM - Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #22c55e;">🔐 Password Reset Request</h2>
            <p>Hi ${name || 'User'},</p>
            <p>Your password reset OTP is: <strong style="font-size: 24px; color: #dc2626;">${otp}</strong></p>
            <p style="color: #dc2626;">⏰ Valid for 10 minutes only.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style="color: #6b7280; font-size: 12px;">Green CRM Team</p>
          </div>
        `
      });
    } catch (error) {
      console.error('❌ Failed to send password reset OTP:', error.message);
      throw error;
    }
  },

  sendPasswordResetSuccess: async (email) => {
    try {
      return await sendSMTPEmail({
        to: email,
        subject: '✅ Green CRM - Password Reset Successful',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #22c55e;">✅ Password Reset Successful</h2>
            <p>Your password has been successfully reset.</p>
            <p style="color: #dc2626;">If you didn't make this change, please contact support immediately.</p>
            <hr>
            <p style="color: #6b7280; font-size: 12px;">Green CRM Team</p>
          </div>
        `
      });
    } catch (error) {
      console.error('❌ Failed to send password reset success email:', error.message);
      throw error;
    }
  },

  sendEmail: async ({ to, subject, html }) => {
    try {
      return await sendSMTPEmail({ to, subject, html });
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      throw error;
    }
  },

  sendLeadAssignmentEmail: async (assignedUserEmail, assignedUserName, leadData, assignedByName) => {
    try {
      return await sendSMTPEmail({
        to: assignedUserEmail,
        subject: '🎯 New Lead Assigned to You',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎯 New Lead Assigned</h2>
            <p>Hi ${assignedUserName},</p>
            <p>A new lead has been assigned to you by ${assignedByName}.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #374151;">Lead Details:</h3>
              <p><strong>Contact Person:</strong> ${leadData.contactPerson}</p>
              <p><strong>Company:</strong> ${leadData.companyName}</p>
              <p><strong>Email:</strong> ${leadData.email}</p>
              <p><strong>Phone:</strong> ${leadData.phone}</p>
              ${leadData.industry ? `<p><strong>Industry:</strong> ${leadData.industry}</p>` : ''}
              ${leadData.estimatedValue ? `<p><strong>Estimated Value:</strong> ₹${leadData.estimatedValue}</p>` : ''}
            </div>
            
            <p>Please review and follow up with this lead at your earliest convenience.</p>
            <p>Login to your CRM dashboard to view complete details.</p>
            
            <p style="color: #6b7280; font-size: 12px;">This is an automated notification from Green CRM.</p>
          </div>
        `
      });
    } catch (error) {
      console.error('❌ Failed to send lead assignment email:', error.message);
      throw error;
    }
  },

  sendLeadReminderEmail: async (assignerEmail, assignerName, leadData, assignedUserName, daysPending) => {
    try {
      return await sendSMTPEmail({
        to: assignerEmail,
        subject: '⚠️ Lead Pending - No Activity Detected',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⚠️ Lead Pending Reminder</h2>
            <p>Hi ${assignerName},</p>
            <p>The lead assigned to <strong>${assignedUserName}</strong> has not been actioned yet.</p>
            <p>It has been <strong>${daysPending} days</strong> since assignment.</p>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #991b1b;">Pending Lead Details:</h3>
              <p><strong>Contact Person:</strong> ${leadData.contactPerson}</p>
              <p><strong>Company:</strong> ${leadData.companyName}</p>
              <p><strong>Phone:</strong> ${leadData.phone}</p>
              <p><strong>Assigned To:</strong> ${assignedUserName}</p>
              <p><strong>Assigned On:</strong> ${new Date(leadData.assignedAt).toLocaleDateString('en-IN')}</p>
            </div>
            
            <p>Please follow up with ${assignedUserName} to ensure timely action on this lead.</p>
            <p>Login to your CRM dashboard to reassign or take action.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">This is an automated reminder from Green CRM.</p>
          </div>
        `
      });
    } catch (error) {
      console.error('❌ Failed to send lead reminder email:', error.message);
      throw error;
    }
  },

  sendTicketReplyEmail: async (email, ticketData) => {
    try {
      return await sendSMTPEmail({
        to: email,
        subject: `💬 Reply to Support Ticket - ${ticketData.ticketId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">💬 New Reply to Your Support Ticket</h2>
            <p>Dear ${ticketData.customerName},</p>
            <p>Our support team has replied to your ticket.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #374151;">Ticket Details:</h3>
              <p><strong>Ticket ID:</strong> ${ticketData.ticketId}</p>
              <p><strong>Title:</strong> ${ticketData.title}</p>
            </div>
            
            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h4 style="margin: 0 0 10px 0; color: #1e40af;">Reply from ${ticketData.repliedBy}:</h4>
              <p style="margin: 0;">${ticketData.replyMessage}</p>
            </div>
            
            <p>You can view the full conversation and reply by logging into your account.</p>
            <p>Thank you for contacting our support team!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `
      });
    } catch (error) {
      console.error('❌ Failed to send ticket reply email:', error.message);
      throw error;
    }
  },

  sendTicketResolvedEmail: async (email, ticketData) => {
    try {
      return await sendSMTPEmail({
        to: email,
        subject: `✅ Support Ticket Resolved - ${ticketData.ticketId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e;">✅ Support Ticket Resolved</h2>
            <p>Dear ${ticketData.customerName},</p>
            <p>Great news! Your support ticket has been resolved.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #374151;">Ticket Details:</h3>
              <p><strong>Ticket ID:</strong> ${ticketData.ticketId}</p>
              <p><strong>Title:</strong> ${ticketData.title}</p>
              <p><strong>Status:</strong> Resolved</p>
            </div>
            
            ${ticketData.resolution ? `
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h4 style="margin: 0 0 10px 0; color: #15803d;">Resolution:</h4>
              <p style="margin: 0;">${ticketData.resolution}</p>
            </div>
            ` : ''}
            
            <p>If you have any further questions or concerns, please don't hesitate to create a new support ticket.</p>
            <p>Thank you for using our support services!</p>
            
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `
      });
    } catch (error) {
      console.error('❌ Failed to send ticket resolved email:', error.message);
      throw error;
    }
  },

  sendDemoApprovalEmail: async (email, demoData) => {
    try {
      const googleMeetLink = 'https://meet.google.com/uqk-sjqx-vde';
      const meetingId = 'uqk-sjqx-vde';
      
      const demoDateTime = new Date(`${demoData.date} ${demoData.time}`).toLocaleString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return await sendSMTPEmail({
        to: email,
        subject: `🎉 Demo Request Approved - ${demoData.company} | Green CRM`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #22c55e, #4ade80); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Demo Request Approved!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Green CRM demo is confirmed</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${demoData.name},</p>
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">
                Congratulations! Your demo request has been <strong>APPROVED</strong>! 🎉
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📋 Demo Details:</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="margin-bottom: 8px; color: #374151;"><strong>Company:</strong> ${demoData.company}</li>
                  <li style="margin-bottom: 8px; color: #374151;"><strong>Date & Time:</strong> ${demoDateTime}</li>
                  <li style="margin-bottom: 8px; color: #374151;"><strong>Attendees:</strong> ${demoData.employees} employees</li>
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
        `
      });
    } catch (error) {
      console.error('❌ Failed to send demo approval email:', error.message);
      throw error;
    }
  }
};

module.exports = emailService;