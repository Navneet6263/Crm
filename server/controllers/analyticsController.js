const User = require('../models/User');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const UserActivity = require('../models/UserActivity');

const getCRMUsageAnalytics = async (req, res) => {
  try {
    const { range = '7days' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch(range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get all users with their status
    const allUsers = await User.find({}).select('name email role isActive createdAt');
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.isActive).length;
    
    // Get user activities
    const activities = await UserActivity.find({
      timestamp: { $gte: startDate }
    }).populate('userId', 'name email role isActive');

    // Get leads and customers count for conversion rate
    const totalLeads = await Lead.countDocuments();
    const closedWonLeads = await Lead.countDocuments({ status: 'closed-won' });
    const conversionRate = totalLeads > 0 ? Math.round((closedWonLeads / totalLeads) * 100) : 0;

    // Get all leads for accurate tracking
    const allLeads = await Lead.find({
      createdAt: { $gte: startDate }
    }).select('createdBy createdAt assignedTo status notes activities').populate('createdBy', 'name email');
    
    // Get all customers
    const allCustomers = await Customer.find({
      createdAt: { $gte: startDate }
    }).select('createdBy createdAt').populate('createdBy', 'name email');

    // Calculate user-wise statistics
    const userStats = {};
    
    // Initialize all users
    allUsers.forEach(user => {
      const userId = user._id.toString();
      userStats[userId] = {
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        isActive: user.isActive,
        sessions: new Set(),
        totalTime: 0,
        leadsAdded: 0,
        customersAdded: 0,
        lastActive: user.createdAt
      };
    });
    
    // Track from activities
    activities.forEach(activity => {
      const userId = activity.userId?._id?.toString();
      if (!userId || !userStats[userId]) return;
      
      userStats[userId].sessions.add(activity.sessionId);
      userStats[userId].totalTime += activity.duration || 0;
      
      if (activity.timestamp > userStats[userId].lastActive) {
        userStats[userId].lastActive = activity.timestamp;
      }
    });
    
    // Track leads created by each user
    allLeads.forEach(lead => {
      const createdById = lead.createdBy?._id?.toString() || lead.createdBy?.toString();
      if (createdById && userStats[createdById]) {
        userStats[createdById].leadsAdded++;
        if (lead.createdAt > userStats[createdById].lastActive) {
          userStats[createdById].lastActive = lead.createdAt;
        }
      }
    });
    
    // Track customers created by each user
    allCustomers.forEach(customer => {
      const createdById = customer.createdBy?._id?.toString() || customer.createdBy?.toString();
      if (createdById && userStats[createdById]) {
        userStats[createdById].customersAdded++;
        if (customer.createdAt > userStats[createdById].lastActive) {
          userStats[createdById].lastActive = customer.createdAt;
        }
      }
    });

    // Convert to array and format
    const userActivity = allUsers.map(user => {
      const userId = user._id.toString();
      const stats = userStats[userId];
      
      return {
        userName: stats.userName,
        userEmail: stats.userEmail,
        userRole: user.role,
        isActive: stats.isActive,
        sessions: stats.sessions.size || 0,
        totalTime: Math.round(stats.totalTime / 60), // Convert to minutes
        leadsAdded: stats.leadsAdded,
        customersAdded: stats.customersAdded,
        lastActive: stats.lastActive
      };
    });

    // Calculate feature usage
    const featureUsage = {};
    activities.forEach(activity => {
      const feature = activity.feature || 'Other';
      featureUsage[feature] = (featureUsage[feature] || 0) + 1;
    });

    const featureUsageArray = Object.entries(featureUsage)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate overall stats
    const totalActiveUsers = Object.values(userStats).filter(s => s.sessions.size > 0 || s.leadsAdded > 0 || s.customersAdded > 0).length;
    const totalSessions = new Set(activities.map(a => a.sessionId)).size;
    const avgSessionTime = totalSessions > 0 
      ? Math.round(activities.reduce((sum, a) => sum + (a.duration || 0), 0) / totalSessions / 60)
      : 0;
    const adoptionRate = totalUsers > 0 
      ? Math.round((totalActiveUsers / totalUsers) * 100)
      : 0;

    res.json({
      totalActiveUsers,
      totalSessions,
      avgSessionTime,
      adoptionRate,
      totalUsers,
      activeUsers,
      totalLeadsProcessed: totalLeads,
      conversionRate,
      userActivity: userActivity.sort((a, b) => b.leadsAdded - a.leadsAdded),
      featureUsage: featureUsageArray,
      message: `Analytics data for ${range} period. Showing ${userActivity.length} users with accurate lead/customer tracking.`
    });
  } catch (error) {
    console.error('Error fetching CRM analytics:', error);
    res.status(500).json({ message: error.message });
  }
};

const logUserActivity = async (req, res) => {
  try {
    const { action, feature, duration, sessionId, metadata } = req.body;
    const userId = req.user._id || req.user.id;

    await UserActivity.create({
      userId,
      action,
      feature,
      duration: duration || 0,
      sessionId: sessionId || `session_${userId}_${Date.now()}`,
      metadata: metadata || {},
      timestamp: new Date()
    });

    res.json({ success: true, message: 'Activity logged successfully' });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCRMUsageAnalytics,
  logUserActivity
};
