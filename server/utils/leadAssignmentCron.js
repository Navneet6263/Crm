const cron = require('node-cron');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { sendLeadReminderEmail } = require('../services/emailService');

// ⏸️ TEMPORARILY DISABLED - Lead assignment reminder emails band kiye gaye hain
// Yeh cron job manager ko email bhejti thi jab sales person 2 din se lead pe kaam nahi karta
const startLeadAssignmentReminderCron = () => {
  console.log('⏸️ Lead assignment reminder cron job is DISABLED');
  console.log('⏸️ Reason: AWS IP block issue due to bulk emails');
  
  /*
  // Run every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running lead assignment reminder check...');
    
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      // Find leads assigned 2+ days ago that haven't been viewed
      const pendingLeads = await Lead.find({
        assignedTo: { $exists: true, $ne: null },
        assignedAt: { $lte: twoDaysAgo },
        lastViewedAt: { $exists: false },
        isActive: true
      })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
      
      console.log(`Found ${pendingLeads.length} pending leads for reminder`);
      
      for (const lead of pendingLeads) {
        if (lead.assignedBy && lead.assignedTo) {
          try {
            await sendLeadReminderEmail(lead.assignedBy, lead.assignedTo, lead);
            console.log(`Reminder sent for lead ${lead._id} to ${lead.assignedBy.email}`);
          } catch (emailError) {
            console.error(`Failed to send reminder for lead ${lead._id}:`, emailError);
          }
        }
      }
    } catch (error) {
      console.error('Error in lead assignment reminder cron:', error);
    }
  });
  
  console.log('Lead assignment reminder cron job started - runs daily at 9 AM');
  */
};

module.exports = { startLeadAssignmentReminderCron };