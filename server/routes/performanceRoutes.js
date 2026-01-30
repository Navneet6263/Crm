const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const User = require('../models/User');
const { auth: authenticateToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send performance report to manager
router.post('/send-report', authenticateToken, async (req, res) => {
  try {
    const { userName, userEmail, managerEmail, month, stats } = req.body;

    if (!managerEmail || !managerEmail.includes('@')) {
      return res.status(400).json({ message: 'Valid manager email is required' });
    }

    // Check if email is configured
    const emailConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

    if (emailConfigured) {
      // Get detailed logs for the user
      const userId = req.user.id;
      const leads = await Lead.find({ assignedTo: userId })
        .populate('createdBy', 'name email')
        .populate('assignedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(20);

      const logsHTML = leads.map(lead => {
        const assignedDate = lead.assignedAt || lead.createdAt;
        const workDuration = lead.lastContactedAt 
          ? Math.ceil((lead.lastContactedAt - assignedDate) / (1000 * 60 * 60 * 24))
          : Math.ceil((new Date() - assignedDate) / (1000 * 60 * 60 * 24));

        const statusClass = lead.status === 'closed-won' ? 'status-won' : 
                           ['qualified', 'proposal', 'negotiation', 'contacted'].includes(lead.status) ? 'status-active' : 'status-other';

        return `
          <tr>
            <td>
              <div class="company-cell">${lead.companyName}</div>
              <span class="sub-text">${lead.contactPerson}</span>
            </td>
            <td style="text-align: center;">
              <div>${new Date(lead.createdAt).toLocaleDateString('en-GB')}</div>
              <span class="sub-text">${lead.createdBy?.name || 'Unknown'}</span>
            </td>
            <td style="text-align: center;">
              <div>${new Date(assignedDate).toLocaleDateString('en-GB')}</div>
              <span class="sub-text">${lead.assignedBy?.name || 'Auto'}</span>
            </td>
            <td style="text-align: center;">
              <span class="duration-badge">${workDuration} days</span>
            </td>
            <td style="text-align: center;">
              <span class="status-badge ${statusClass}">${lead.status}</span>
            </td>
            <td style="text-align: center; font-weight: 700; font-size: 16px; color: #10b981;">
              ${lead.totalInteractions || 0}
            </td>
          </tr>
        `;
      }).join('');

      // Create HTML email template
      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; background: #f3f4f6; }
            .email-wrapper { max-width: 800px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
            .header p { font-size: 16px; opacity: 0.95; }
            .content { padding: 40px 30px; }
            .employee-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #10b981; }
            .employee-info h2 { font-size: 20px; color: #111827; margin-bottom: 8px; }
            .employee-info p { color: #6b7280; font-size: 14px; }
            .performance-badge { display: inline-block; padding: 12px 24px; background: ${stats.performanceScore >= 70 ? '#10b981' : stats.performanceScore >= 40 ? '#f59e0b' : '#ef4444'}; color: white; border-radius: 24px; font-weight: 700; font-size: 18px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 30px 0; }
            .stat-card { background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #e5e7eb; transition: transform 0.2s; }
            .stat-icon { font-size: 24px; margin-bottom: 8px; }
            .stat-label { color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
            .stat-value { color: #111827; font-size: 32px; font-weight: 800; line-height: 1; }
            .section-title { font-size: 20px; font-weight: 700; color: #111827; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #10b981; }
            .table-wrapper { overflow-x: auto; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .details-table { width: 100%; border-collapse: collapse; background: white; }
            .details-table thead { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
            .details-table th { padding: 16px 12px; text-align: left; font-size: 13px; font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 0.5px; }
            .details-table tbody tr { border-bottom: 1px solid #e5e7eb; transition: background 0.2s; }
            .details-table tbody tr:hover { background: #f9fafb; }
            .details-table tbody tr:last-child { border-bottom: none; }
            .details-table td { padding: 16px 12px; font-size: 14px; color: #374151; }
            .company-cell { font-weight: 600; color: #111827; }
            .sub-text { display: block; font-size: 12px; color: #9ca3af; margin-top: 4px; }
            .status-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
            .status-won { background: #d1fae5; color: #065f46; }
            .status-active { background: #fef3c7; color: #92400e; }
            .status-other { background: #e0e7ff; color: #3730a3; }
            .duration-badge { display: inline-block; padding: 6px 12px; background: #dbeafe; color: #1e40af; border-radius: 6px; font-weight: 700; font-size: 13px; }
            .footer { background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer p { color: #6b7280; font-size: 13px; margin: 4px 0; }
            .footer-logo { font-size: 18px; font-weight: 700; color: #10b981; margin-bottom: 8px; }
            @media only screen and (max-width: 600px) {
              .stats-grid { grid-template-columns: repeat(2, 1fr); }
              .details-table { font-size: 12px; }
              .details-table th, .details-table td { padding: 10px 8px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <h1>📊 Monthly Performance Report</h1>
              <p>${month}</p>
            </div>
            
            <div class="content">
              <div class="employee-info">
                <h2>${userName}</h2>
                <p>📧 ${userEmail}</p>
              </div>
              
              <div style="text-align: center;">
                <div class="performance-badge">
                  🏆 Performance Score: ${stats.performanceScore}%
                </div>
              </div>

              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">📋</div>
                  <div class="stat-label">Total Leads</div>
                  <div class="stat-value">${stats.totalLeads || 0}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">✅</div>
                  <div class="stat-label">Assigned</div>
                  <div class="stat-value">${stats.assignedLeads || 0}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🎯</div>
                  <div class="stat-label">Won</div>
                  <div class="stat-value">${stats.wonLeads || 0}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🔥</div>
                  <div class="stat-label">Active</div>
                  <div class="stat-value">${stats.activeLeads || 0}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">📈</div>
                  <div class="stat-label">Conversion</div>
                  <div class="stat-value">${stats.conversionRate || 0}%</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">⚡</div>
                  <div class="stat-label">Activities</div>
                  <div class="stat-value">${stats.activities || 0}</div>
                </div>
              </div>

              <h3 class="section-title">📋 Detailed Lead Performance</h3>
              <div class="table-wrapper">
                <table class="details-table">
                  <thead>
                    <tr>
                      <th>Company & Contact</th>
                      <th style="text-align: center;">Generated</th>
                      <th style="text-align: center;">Assigned</th>
                      <th style="text-align: center;">Duration</th>
                      <th style="text-align: center;">Status</th>
                      <th style="text-align: center;">Activities</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${logsHTML || '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #9ca3af;">No leads data available</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-logo">GreenCrm</div>
              <p>This report was automatically generated by GreenCrm</p>
              <p>© ${new Date().getFullYear()} GreenCrm. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email
      const mailOptions = {
        from: `"GreenCrm Performance" <${process.env.SMTP_FROM}>`,
        to: managerEmail,
        subject: `📊 Monthly Performance Report - ${userName} (${month})`,
        html: emailHTML
      };

      await transporter.sendMail(mailOptions);

      res.json({ 
        success: true, 
        message: 'Performance report sent successfully',
        sentTo: managerEmail
      });
    } else {
      // Email not configured - return success with note
      console.log('📧 Email not configured. Performance report prepared for:', managerEmail);
      console.log('📊 Report data:', { userName, userEmail, month, stats });
      
      res.json({ 
        success: true, 
        message: 'Performance report prepared successfully (Email service not configured)',
        sentTo: managerEmail,
        note: 'Email functionality requires configuration. Report data logged to console.'
      });
    }

  } catch (error) {
    console.error('Error sending performance report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send performance report',
      error: error.message 
    });
  }
});

// Get user's monthly performance stats
router.get('/monthly-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all leads for the user this month
    const monthLeads = await Lead.find({
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ],
      createdDate: { $gte: monthStart }
    });

    // Calculate stats
    const stats = {
      totalLeads: monthLeads.length,
      assignedLeads: monthLeads.filter(l => l.assignedTo && l.assignedTo.toString() === userId).length,
      wonLeads: monthLeads.filter(l => l.status === 'closed-won' || l.status === 'converted').length,
      activeLeads: monthLeads.filter(l => ['qualified', 'proposal', 'negotiation', 'contacted'].includes(l.status)).length,
      activities: monthLeads.length * 3, // Approximate activities
      conversionRate: monthLeads.length > 0 
        ? Math.round((monthLeads.filter(l => l.status === 'closed-won' || l.status === 'converted').length / monthLeads.length) * 100)
        : 0
    };

    res.json({ success: true, stats });

  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch monthly stats',
      error: error.message 
    });
  }
});

// Get detailed performance logs
router.get('/detailed-logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const leads = await Lead.find({ assignedTo: userId })
      .populate('createdBy', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    const logs = leads.map(lead => {
      const assignedDate = lead.assignedAt || lead.createdAt;
      const workDuration = lead.lastContactedAt 
        ? Math.ceil((lead.lastContactedAt - assignedDate) / (1000 * 60 * 60 * 24))
        : Math.ceil((new Date() - assignedDate) / (1000 * 60 * 60 * 24));

      return {
        leadId: lead._id,
        companyName: lead.companyName,
        contactPerson: lead.contactPerson,
        generatedAt: lead.createdAt,
        generatedBy: lead.createdBy?.name || 'Unknown',
        assignedAt: lead.assignedAt || lead.createdAt,
        assignedBy: lead.assignedBy?.name || 'Auto-assigned',
        workDuration: `${workDuration} days`,
        status: lead.status,
        lastContacted: lead.lastContactedAt || 'Not contacted',
        totalInteractions: lead.totalInteractions || 0,
        activities: lead.activities?.length || 0,
        notes: lead.notes?.length || 0
      };
    });

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching performance logs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
