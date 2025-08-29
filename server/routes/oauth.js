const express = require('express');
const router = express.Router();
const { googleAuth, googleCallback, linkedinAuth, linkedinCallback, getUserInfo } = require('../controllers/oauthController');
const { auth } = require('../middleware/auth');

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/google/callback', googleCallback);

// LinkedIn OAuth routes
router.get('/linkedin', linkedinAuth);
router.get('/linkedin/callback', linkedinCallback);
router.post('/linkedin/callback', linkedinCallback);

// Get user info from token
router.get('/me', auth, getUserInfo);

// Test routes to verify OAuth is working
router.get('/test', (req, res) => {
    res.json({
        message: 'OAuth routes are working!',
        availableRoutes: {
            google: '/api/auth/google',
            googleCallback: '/api/auth/google/callback',
            linkedin: '/api/auth/linkedin',
            linkedinCallback: '/api/auth/linkedin/callback'
        },
        environment: {
            googleConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here'),
            linkedinConfigured: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_ID !== 'demo-linkedin-client-id')
        }
    });
});

module.exports = router;