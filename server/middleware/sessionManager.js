const jwt = require('jsonwebtoken');
const { formatResponse } = require('../utils/helpers');

// In-memory session store (use Redis in production)
const activeSessions = new Map();

// Track user session
const trackSession = (req, res, next) => {
  if (req.user) {
    const sessionId = req.headers.authorization?.split(' ')[1];
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      loginTime: new Date(),
      lastActivity: new Date()
    };
    
    const userSessions = activeSessions.get(req.user.id) || [];
    const existingSession = userSessions.find(s => s.sessionId === sessionId);
    
    if (existingSession) {
      existingSession.lastActivity = new Date();
    } else {
      userSessions.push({ sessionId, ...deviceInfo });
      activeSessions.set(req.user.id, userSessions);
    }
  }
  next();
};

// Get user's active sessions
const getActiveSessions = (userId) => {
  return activeSessions.get(userId) || [];
};

// Logout all other sessions
const logoutOtherSessions = (userId, currentSessionId) => {
  const userSessions = activeSessions.get(userId) || [];
  const currentSession = userSessions.find(s => s.sessionId === currentSessionId);
  
  if (currentSession) {
    activeSessions.set(userId, [currentSession]);
    return true;
  }
  
  activeSessions.delete(userId);
  return false;
};

// Logout specific session
const logoutSession = (userId, sessionId) => {
  const userSessions = activeSessions.get(userId) || [];
  const filteredSessions = userSessions.filter(s => s.sessionId !== sessionId);
  
  if (filteredSessions.length > 0) {
    activeSessions.set(userId, filteredSessions);
  } else {
    activeSessions.delete(userId);
  }
};

// Clean expired sessions (run periodically)
const cleanExpiredSessions = () => {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [userId, sessions] of activeSessions.entries()) {
    const validSessions = sessions.filter(session => {
      return (now - session.lastActivity) < maxAge;
    });
    
    if (validSessions.length > 0) {
      activeSessions.set(userId, validSessions);
    } else {
      activeSessions.delete(userId);
    }
  }
};

module.exports = {
  trackSession,
  getActiveSessions,
  logoutOtherSessions,
  logoutSession,
  cleanExpiredSessions
};