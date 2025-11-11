const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Initialize passport
const initializePassport = (app) => {
  app.use(require('express-session')({
    secret: process.env.SESSION_SECRET || 'fallback-session-secret',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
};

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here') {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5004/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            
            if (user) {
                return done(null, user);
            }
            
            // Find or create a default company for OAuth users
            const Company = require('../models/Company');
            let defaultCompany = await Company.findOne({ name: 'Default Company' });
            if (!defaultCompany) {
                // Create super admin if doesn't exist
                let superAdmin = await User.findOne({ role: 'super-admin' });
                if (!superAdmin) {
                    superAdmin = await User.create({
                        name: 'Super Admin',
                        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@greencrm.com',
                        password: process.env.SUPER_ADMIN_PASSWORD || 'super123',
                        role: 'super-admin'
                    });
                }
                
                defaultCompany = await Company.create({
                    name: 'Default Company',
                    slug: 'default-company',
                    contactEmail: 'admin@greencrm.com',
                    contactPhone: '9876543210',
                    status: 'active',
                    createdBy: superAdmin._id
                });
            }
            
            // Create new user
            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
                role: 'sales',
                loginMethod: 'google',
                tenantId: defaultCompany._id,
                isActive: true
            });
            
            await user.save();
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));
} else {
    console.warn('Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file');
}

// Configure LinkedIn OAuth Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET && 
    process.env.LINKEDIN_CLIENT_ID !== 'demo-linkedin-client-id' && 
    process.env.LINKEDIN_CLIENT_ID !== 'your-linkedin-client-id') {
    passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "http://localhost:5004/api/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_liteprofile']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('LinkedIn Profile:', JSON.stringify(profile, null, 2));
        
        let user = await User.findOne({ linkedinId: profile.id });
        
        if (user) {
            return done(null, user);
        }
        
        // Find or create a default company for OAuth users
        const Company = require('../models/Company');
        let defaultCompany = await Company.findOne({ name: 'Default Company' });
        if (!defaultCompany) {
            // Create super admin if doesn't exist
            let superAdmin = await User.findOne({ role: 'super-admin' });
            if (!superAdmin) {
                superAdmin = await User.create({
                    name: 'Super Admin',
                    email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@greencrm.com',
                    password: process.env.SUPER_ADMIN_PASSWORD || 'super123',
                    role: 'super-admin'
                });
            }
            
            defaultCompany = await Company.create({
                name: 'Default Company',
                slug: 'default-company',
                contactEmail: 'admin@greencrm.com',
                contactPhone: '9876543210',
                status: 'active',
                createdBy: superAdmin._id
            });
        }
        
        // Create new user with safe data access
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `linkedin_${profile.id}@temp.com`;
        const name = profile.displayName || profile.name || 'LinkedIn User';
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        
        user = new User({
            linkedinId: profile.id,
            name: name,
            email: email,
            avatar: avatar,
            role: 'sales',
            loginMethod: 'linkedin',
            tenantId: defaultCompany._id,
            isActive: true
        });
        
        await user.save();
        console.log('✅ LinkedIn user created:', user.email);
        return done(null, user);
    } catch (error) {
        console.error('❌ LinkedIn OAuth error:', error);
        return done(error, null);
    }
}));
} else {
    console.warn('LinkedIn OAuth not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env file');
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// OAuth Controllers
const googleAuth = (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your-google-client-id-here') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/login?error=oauth_not_configured&message=Google OAuth not configured. Please use email/password login.`);
    }
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })(req, res, next);
};

const googleCallback = (req, res, next) => {
    console.log('🔄 Google OAuth callback initiated');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    
    passport.authenticate('google', { failureRedirect: '/login' }, (err, user) => {
        if (err) {
            console.error('❌ Google OAuth error:', err);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendUrl}/?error=oauth_failed&message=${encodeURIComponent(err.message)}`);
        }
        
        if (!user) {
            console.log('❌ No user returned from Google OAuth');
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendUrl}/?error=oauth_failed&message=No user data received`);
        }
        
        console.log('✅ Google OAuth successful for user:', user.email);
        
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/?token=${token}`);
    })(req, res, next);
};

const linkedinAuth = (req, res, next) => {
    console.log('🔗 LinkedIn OAuth initiated');
    console.log('LinkedIn Client ID:', process.env.LINKEDIN_CLIENT_ID);
    if (!process.env.LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID === 'demo-linkedin-client-id' || process.env.LINKEDIN_CLIENT_ID === 'your-linkedin-client-id') {
        console.log('❌ LinkedIn OAuth not configured');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/?error=oauth_not_configured&message=LinkedIn OAuth not configured. Please use email/password login.`);
    }
    passport.authenticate('linkedin')(req, res, next);
};

const linkedinCallback = (req, res, next) => {
    console.log('🔄 LinkedIn OAuth callback initiated');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    
    passport.authenticate('linkedin', { failureRedirect: '/login' }, (err, user) => {
        if (err) {
            console.error('❌ LinkedIn OAuth error:', err);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendUrl}/?error=oauth_failed&message=${encodeURIComponent(err.message)}`);
        }
        
        if (!user) {
            console.log('❌ No user returned from LinkedIn OAuth');
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendUrl}/?error=oauth_failed&message=No user data received`);
        }
        
        console.log('✅ LinkedIn OAuth successful for user:', user.email);
        
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/?token=${token}`);
    })(req, res, next);
};

const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    initializePassport,
    googleAuth,
    googleCallback,
    linkedinAuth,
    linkedinCallback,
    getUserInfo
};