const express = require('express');
const { getCRMUsageAnalytics, logUserActivity } = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Get CRM usage analytics (Super Admin only)
router.get('/crm-usage', getCRMUsageAnalytics);

// Log user activity
router.post('/log-activity', logUserActivity);

module.exports = router;
