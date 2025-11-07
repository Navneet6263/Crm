const { createLeadAssignmentNotification } = require('../controllers/notificationController');

// Middleware to handle lead assignment notifications
const handleLeadAssignmentNotification = async (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to intercept response
  res.json = function(data) {
    // Check if this is a successful lead assignment
    if (data.success && data.assignment && req.body.leadId && req.body.assignedTo) {
      // Create notification asynchronously (don't block response)
      setImmediate(async () => {
        try {
          console.log('🔔 Creating lead assignment notification...');
          await createLeadAssignmentNotification(
            req.body.leadId, 
            req.body.assignedTo, 
            req.user._id
          );
        } catch (error) {
          console.error('❌ Error in lead assignment notification middleware:', error);
        }
      });
    }
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = { handleLeadAssignmentNotification };