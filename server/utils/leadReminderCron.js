const cron = require('node-cron');
const Lead = require('../models/Lead');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Run every day at 9 AM
const startLeadReminderCron = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Running automated lead reminder cron job at 9 AM...');
    console.log('📅 Current time:', new Date().toLocaleString('en-IN'));
    
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      // Find leads that are:
      // 1. Assigned to someone
      // 2. Assigned more than 3 days ago
      // 3. Not viewed yet (lastViewedAt is null or before assignedAt)
      const pendingLeads = await Lead.find({
        assignedTo: { $exists: true, $ne: null },
        assignedAt: { $lte: threeDaysAgo },
        isActive: true,
        $or: [
          { lastViewedAt: { $exists: false } },
          { lastViewedAt: null },
          { $expr: { $lt: ['$lastViewedAt', '$assignedAt'] } }
        ]
      })
      .populate('assignedTo', 'name email managerName managerEmail role')
      .populate('assignedBy', 'name email')
      .populate('notes.createdBy', 'name');
      
      console.log(`📊 Found ${pendingLeads.length} pending leads`);
      
      for (const lead of pendingLeads) {
        if (!lead.assignedBy || !lead.assignedTo) {
          console.log(`⚠️ Skipping lead ${lead._id} - missing assignedBy or assignedTo`);
          continue;
        }
        
        // Check if there are recent notes (activity in last 2 days)
        if (lead.notes && lead.notes.length > 0) {
          const lastNote = lead.notes[lead.notes.length - 1];
          const lastNoteDate = new Date(lastNote.createdAt);
          const daysSinceLastNote = Math.floor((new Date() - lastNoteDate) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastNote < 3) {
            console.log(`✅ Skipping lead ${lead._id} - recent activity found (note added ${daysSinceLastNote} days ago)`);
            continue;
          }
        }
        
        const daysPending = Math.floor((new Date() - new Date(lead.assignedAt)) / (1000 * 60 * 60 * 24));
        
        // Get manager details from assignedTo user
        let recipientEmail = lead.assignedBy?.email;
        let recipientName = lead.assignedBy?.name;
        
        // If assignedTo has manager details, use those
        if (lead.assignedTo?.managerEmail) {
          recipientEmail = lead.assignedTo.managerEmail;
          recipientName = lead.assignedTo.managerName || 'Manager';
          console.log(`📧 Using manager email: ${recipientEmail} for ${lead.assignedTo.name}`);
        } else {
          console.log(`⚠️ No manager email found for ${lead.assignedTo.name}, using assigner: ${recipientEmail}`);
        }
        
        if (!recipientEmail) {
          console.log(`⚠️ Skipping lead ${lead._id} - no recipient email available`);
          continue;
        }
        
        try {
          await emailService.sendLeadReminderEmail(
            recipientEmail,
            recipientName,
            {
              contactPerson: lead.contactPerson,
              companyName: lead.companyName,
              phone: lead.phone,
              assignedAt: lead.assignedAt
            },
            lead.assignedTo.name,
            daysPending
          );
          
          console.log(`✅ Reminder sent for lead ${lead._id} to ${recipientEmail} (${lead.assignedTo.managerEmail ? 'Manager' : 'Assigner'})`);
        } catch (emailError) {
          console.error(`❌ Failed to send reminder for lead ${lead._id}:`, emailError.message);
        }
      }
      
      console.log('✅ Automated lead reminder cron job completed successfully');
      console.log('📅 Next run scheduled for tomorrow at 9 AM');
    } catch (error) {
      console.error('❌ Error in lead reminder cron job:', error);
    }
  });
  
  console.log('✅ Lead reminder cron job scheduled (runs daily at 9 AM)');
};

module.exports = { startLeadReminderCron };
