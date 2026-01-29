const nodemailer = require('nodemailer');

// SMTP Configuration for Green Call
const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s/g, '') // Remove spaces from app password
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  requireTLS: true,
  authMethod: 'PLAIN',
  debug: true,
  logger: true
});

const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER;

console.log('✅ SMTP Email Service initialized');
console.log('📧 SMTP Config:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  from: SMTP_FROM
});

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

  sendLeadReminderEmail: async (managerEmail, managerName, leadData, assignedUserName, daysPending) => {
    try {
      console.log('📧 Sending reminder email to:', { managerEmail, managerName, assignedUserName, daysPending });
      
      return await sendSMTPEmail({
        to: managerEmail,
        subject: '⚠️ Lead Pending - No Activity Detected',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⚠️ Lead Pending Reminder</h2>
            <p>Hi ${managerName || 'Manager'},</p>
            <p>The lead assigned to <strong>${assignedUserName || 'Sales Person'}</strong> has not been actioned yet.</p>
            <p>It has been <strong>${daysPending || 0} days</strong> since assignment.</p>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #991b1b;">Pending Lead Details:</h3>
              <p><strong>Contact Person:</strong> ${leadData.contactPerson || 'N/A'}</p>
              <p><strong>Company:</strong> ${leadData.companyName || 'N/A'}</p>
              <p><strong>Phone:</strong> ${leadData.phone || 'N/A'}</p>
              <p><strong>Assigned To:</strong> ${assignedUserName || 'N/A'}</p>
              <p><strong>Assigned On:</strong> ${leadData.assignedAt ? new Date(leadData.assignedAt).toLocaleDateString('en-IN') : 'N/A'}</p>
            </div>
            
            <p>Please follow up with ${assignedUserName || 'the sales person'} to ensure timely action on this lead.</p>
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

  sendNewUserCredentials: async (userData) => {
    try {
      const expiryTime = new Date(userData.expiresAt).toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
      });

      return await sendSMTPEmail({
        to: userData.email,
        subject: `🎉 Welcome to ${userData.companyName} - Your CRM Account`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e, #4ade80); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to ${userData.companyName}!</h1>
              <p style="color: white; margin: 10px 0 0 0;">Your CRM account has been created</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 16px; color: #374151;">Hi ${userData.name},</p>
              <p style="font-size: 16px; color: #374151;">Your account has been created successfully! Here are your login credentials:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0;">🔑 Login Credentials:</h3>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${userData.email}</p>
                <p style="margin: 8px 0;"><strong>Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${userData.password}</code></p>
                <p style="margin: 8px 0;"><strong>Role:</strong> ${userData.role.toUpperCase()}</p>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ IMPORTANT: This password expires at ${expiryTime}</p>
                <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">You must change your password within 1 hour of first login.</p>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">Login to CRM</a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">If you have any questions, please contact your administrator.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; text-align: center;">Green CRM - Automated Email</p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error('❌ Failed to send new user credentials email:', error.message);
      throw error;
    }
  },

  sendCompanyWelcomeEmail: async (companyData) => {
    try {
      return await sendSMTPEmail({
        to: companyData.adminEmail,
        subject: `🎊 Welcome to Green CRM - ${companyData.companyName} Account Created!`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f8fafc;">
            <!-- Header with gradient -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                <span style="font-size: 48px;">🏢</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Welcome to Green CRM!</h1>
              <p style="color: #d1fae5; margin: 12px 0 0 0; font-size: 18px; font-weight: 500;">Your company account is ready</p>
            </div>

            <!-- Main content -->
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">🎉 Congratulations!</h2>
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">Your company <strong style="color: #10b981;">${companyData.companyName}</strong> has been successfully registered with Green CRM.</p>
              </div>

              <!-- Company Details Card -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #10b981;">
                <h3 style="color: #047857; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                  <span style="font-size: 24px; margin-right: 10px;">🏢</span> Company Details
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-weight: 600;">Company Name:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 700;">${companyData.companyName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-weight: 600;">Company ID:</td>
                    <td style="padding: 8px 0; color: #1f2937;"><code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${companyData.companyId}</code></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-weight: 600;">Admin Email:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${companyData.adminEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-weight: 600;">Plan:</td>
                    <td style="padding: 8px 0;"><span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">${companyData.planName.toUpperCase()}</span></td>
                  </tr>
                </table>
              </div>

              <!-- Admin Credentials Card -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #f59e0b;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                  <span style="font-size: 24px; margin-right: 10px;">🔐</span> Admin Login Credentials
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #78350f; font-weight: 600;">Email:</td>
                    <td style="padding: 8px 0; color: #92400e; font-weight: 700;">${companyData.adminEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #78350f; font-weight: 600;">Password:</td>
                    <td style="padding: 8px 0;"><code style="background: #fbbf24; color: #78350f; padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 16px; font-weight: 700;">${companyData.tempPassword}</code></td>
                  </tr>
                </table>
                <div style="background: #fef3c7; border: 2px dashed #f59e0b; padding: 12px; border-radius: 8px; margin-top: 15px;">
                  <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">⚠️ Please change this password after your first login for security.</p>
                </div>
              </div>

              <!-- Plan Features -->
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                  <span style="font-size: 24px; margin-right: 10px;">✨</span> Your Plan Includes
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
                  <li style="margin: 8px 0; line-height: 1.6;">👥 <strong>${companyData.usersLimit === -1 ? 'Unlimited' : companyData.usersLimit}</strong> Team Members</li>
                  <li style="margin: 8px 0; line-height: 1.6;">📊 <strong>${companyData.leadsLimit === -1 ? 'Unlimited' : companyData.leadsLimit}</strong> Leads</li>
                  <li style="margin: 8px 0; line-height: 1.6;">👤 <strong>${companyData.customersLimit === -1 ? 'Unlimited' : companyData.customersLimit}</strong> Customers</li>
                  <li style="margin: 8px 0; line-height: 1.6;">💾 <strong>${companyData.storageLimit === -1 ? 'Unlimited' : companyData.storageLimit + ' GB'}</strong> Storage</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.3s;">🚀 Login to Dashboard</a>
              </div>

              <!-- Support Section -->
              <div style="background: #f9fafb; padding: 20px; border-radius: 10px; text-align: center; margin-top: 30px;">
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Need help getting started?</p>
                <p style="color: #374151; margin: 0; font-size: 14px;">📧 Contact us at <a href="mailto:support@greencrm.com" style="color: #10b981; text-decoration: none; font-weight: 600;">support@greencrm.com</a></p>
              </div>

              <!-- Footer -->
              <hr style="margin: 30px 0; border: none; border-top: 2px solid #e5e7eb;">
              <div style="text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">© 2024 Green CRM. All rights reserved.</p>
                <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error('❌ Failed to send company welcome email:', error.message);
      throw error;
    }
  },

  sendUserReactivationEmail: async (userData) => {
    try {
      return await sendSMTPEmail({
        to: userData.email,
        subject: `✅ Your Account Has Been Reactivated - ${userData.companyName}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%); padding: 35px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <div style="background: white; width: 70px; height: 70px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 12px rgba(0,0,0,0.15);">
                <span style="font-size: 40px;">✅</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Account Reactivated!</h1>
              <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px;">Welcome back to ${userData.companyName}</p>
            </div>

            <!-- Main content -->
            <div style="background: white; padding: 35px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">Hi <strong>${userData.name}</strong>,</p>
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">Great news! Your account has been <strong style="color: #3b82f6;">reactivated</strong> and you now have full access to the CRM system.</p>

              <!-- Account Info Card -->
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px;">👤 Account Information</h3>
                <p style="margin: 6px 0; color: #1e3a8a;"><strong>Email:</strong> ${userData.email}</p>
                <p style="margin: 6px 0; color: #1e3a8a;"><strong>Role:</strong> <span style="background: #3b82f6; color: white; padding: 3px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">${userData.role.toUpperCase()}</span></p>
                <p style="margin: 6px 0; color: #1e3a8a;"><strong>Status:</strong> <span style="color: #10b981; font-weight: 700;">● Active</span></p>
              </div>

              ${userData.sendNewPassword ? `
              <!-- New Password Card -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px;">🔑 New Login Credentials</h3>
                <p style="margin: 6px 0; color: #78350f;"><strong>Email:</strong> ${userData.email}</p>
                <p style="margin: 6px 0; color: #78350f;"><strong>New Password:</strong> <code style="background: #fbbf24; color: #78350f; padding: 5px 10px; border-radius: 5px; font-family: monospace; font-size: 15px; font-weight: 700;">${userData.newPassword}</code></p>
                <div style="background: #fef3c7; border: 2px dashed #f59e0b; padding: 10px; border-radius: 6px; margin-top: 12px;">
                  <p style="margin: 0; color: #92400e; font-size: 12px; font-weight: 600;">⚠️ Password expires in 1 hour. Please change it after login.</p>
                </div>
              </div>
              ` : ''}

              <!-- What's Next -->
              <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin: 25px 0;">
                <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 16px;">🎯 What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #6b7280; line-height: 1.8;">
                  <li>Login to your dashboard using your credentials</li>
                  ${userData.sendNewPassword ? '<li>Change your temporary password immediately</li>' : ''}
                  <li>Access all CRM features and tools</li>
                  <li>Continue managing your leads and customers</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);">🚀 Login Now</a>
              </div>

              <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 25px;">If you have any questions, please contact your administrator.</p>

              <!-- Footer -->
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">Green CRM - Automated Email | Do not reply to this email</p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error('❌ Failed to send user reactivation email:', error.message);
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