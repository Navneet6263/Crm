const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const Lead = require('../models/Lead');
const { auth } = require('../middleware/auth');

// AI Lead Scoring
router.get('/lead-scoring', auth, async (req, res) => {
  try {
    const leads = await Lead.find({ companyId: req.user.companyId });
    const scoredLeads = await aiService.scoreLeads(leads);
    
    res.json({
      success: true,
      scoredLeads,
      totalLeads: leads.length,
      highPriorityCount: scoredLeads.filter(l => l.aiAnalysis?.priority === 'High').length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// AI Insights
router.get('/insights', auth, async (req, res) => {
  try {
    const leads = await Lead.find({ companyId: req.user.companyId });
    const insights = await aiService.generateLeadInsights(leads);
    
    res.json({
      success: true,
      insights,
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Sales Analytics
router.get('/sales-analytics', auth, async (req, res) => {
  try {
    const leads = await Lead.find({ 
      companyId: req.user.companyId,
      status: { $in: ['qualified', 'proposal', 'negotiation', 'closed'] }
    });
    
    const analytics = await aiService.generateSalesInsights(leads);
    
    res.json({
      success: true,
      analytics,
      dataPoints: leads.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// AI Recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const leads = await Lead.find({ companyId: req.user.companyId });
    const recommendations = aiService.generateRecommendations(leads);
    
    res.json({
      success: true,
      recommendations,
      basedOnLeads: leads.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test AI Scoring with sample data
router.get('/test-scoring', auth, async (req, res) => {
  try {
    const sampleLeads = [
      {
        _id: '1',
        contactPerson: 'John Doe',
        companyName: 'Tech Solutions Pvt Ltd',
        email: 'john@techsolutions.com',
        phone: '9876543210',
        industry: 'technology',
        leadSource: 'website',
        status: 'qualified',
        estimatedValue: 150000,
        createdAt: new Date()
      },
      {
        _id: '2',
        contactPerson: 'Jane Smith',
        companyName: 'Healthcare Corp',
        email: 'jane@healthcare.com',
        phone: '9876543211',
        industry: 'healthcare',
        leadSource: 'referral',
        status: 'contacted',
        estimatedValue: 75000,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        _id: '3',
        contactPerson: 'Bob Wilson',
        companyName: 'Small Business',
        email: 'bob@smallbiz.com',
        phone: '9876543212',
        industry: 'retail',
        leadSource: 'cold call',
        status: 'new',
        estimatedValue: 25000,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ];
    
    const scoredLeads = await aiService.scoreLeads(sampleLeads);
    
    res.json({
      success: true,
      scoredLeads,
      totalLeads: sampleLeads.length,
      highPriorityCount: scoredLeads.filter(l => l.aiAnalysis?.priority === 'High').length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;