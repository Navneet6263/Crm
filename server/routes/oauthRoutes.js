const express = require('express');
const router = express.Router();
const { googleCallback, linkedinCallback } = require('../controllers/oauthController');

// Google OAuth routes
router.post('/google/callback', googleCallback);

// LinkedIn OAuth routes  
router.post('/linkedin/callback', linkedinCallback);

module.exports = router;