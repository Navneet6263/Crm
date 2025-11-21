const Lead = require('../models/Lead');

const updateLeadViewTime = async (req, res, next) => {
  try {
    const leadId = req.params.id;
    const userId = req.user._id || req.user.id;
    
    // Find the lead
    const lead = await Lead.findById(leadId);
    
    if (lead && lead.assignedTo && lead.assignedTo.toString() === userId.toString()) {
      // Update lastViewedAt only if the current user is the assigned user
      await Lead.findByIdAndUpdate(leadId, { 
        lastViewedAt: new Date() 
      });
      console.log(`Lead ${leadId} viewed by assigned user ${userId}`);
    }
    
    next();
  } catch (error) {
    console.error('Error updating lead view time:', error);
    next(); // Continue even if this fails
  }
};

module.exports = { updateLeadViewTime };