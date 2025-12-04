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
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      // Find leads that are:
      // 1. Assigned to someone
      // 2. Assigned more than 2 days ago
      // 3. Not viewed yet (lastViewedAt is null or before assignedAt)
      const pendingLeads = await Lead.find({
        assignedTo: { $exists: true, $ne: null },
        assignedAt: { $lte: twoDaysAgo },
        isActive: true,
        $or: [
          { lastViewedAt: { $exists: false } },
          { lastViewedAt: null },
          { $expr: { $lt: ['$lastViewedAt', '$assignedAt'] } }
        ]
      })
      .populate('assignedTo', 'name email managerName managerEmail')
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
          
          if (daysSinceLastNote < 2) {
            console.log(`✅ Skipping lead ${lead._id} - recent activity found (note added ${daysSinceLastNote} days ago)`);
            continue;
          }
        }
        
        const daysPending = Math.floor((new Date() - new Date(lead.assignedAt)) / (1000 * 60 * 60 * 24));
        
        // Send email to manager if available, otherwise to assigner
        const recipientEmail = lead.assignedTo.managerEmail || lead.assignedBy.email;
        const recipientName = lead.assignedTo.managerName || lead.assignedBy.name;
        
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
          console.error(`❌ Failed to send reminder for lead ${lead._id}:`, emailError);
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
