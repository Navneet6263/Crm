const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/workflow';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow all file types
    cb(null, true);
  }
});

// Get leads for workflow dashboard (Legal/Finance)
router.get('/my-assigned', auth, async (req, res) => {
  try {
    const { role, _id } = req.user;
    let query = {};

    if (role === 'legal-team') {
      query = { 
        assignedToLegal: _id,
        workflowStage: 'legal'
      };
    } else if (role === 'finance-team') {
      query = { 
        assignedToFinance: _id,
        workflowStage: 'finance'
      };
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedToLegal', 'name email')
      .populate('assignedToFinance', 'name email')
      .populate('product', 'name')
      .sort({ updatedAt: -1 });

    res.json({ leads });
  } catch (error) {
    console.error('Error fetching assigned leads:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Transfer lead to Legal team
router.post('/:id/transfer-to-legal', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToLegal, notes } = req.body;
    const { role, _id } = req.user;

    // Only sales can transfer to legal
    if (role !== 'sales' && role !== 'admin' && role !== 'super-admin') {
      return res.status(403).json({ message: 'Only sales team can transfer to legal' });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if lead is closed-won
    if (lead.status !== 'closed-won') {
      return res.status(400).json({ message: 'Only closed-won leads can be transferred to legal' });
    }

    // Update lead
    lead.workflowStage = 'legal';
    lead.assignedToLegal = assignedToLegal;
    lead.transferHistory.push({
      from: 'sales',
      to: 'legal',
      transferredBy: _id,
      transferredTo: assignedToLegal,
      notes: notes || ''
    });

    await lead.save();

    res.json({ 
      message: 'Lead transferred to legal team successfully',
      lead 
    });
  } catch (error) {
    console.error('Error transferring to legal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Transfer lead to Finance team
router.post('/:id/transfer-to-finance', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, notes } = req.body;
    const { role, _id } = req.user;

    // Only legal team can transfer to finance
    if (role !== 'legal-team' && role !== 'admin' && role !== 'super-admin') {
      return res.status(403).json({ message: 'Only legal team can transfer to finance' });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if lead is in legal stage
    if (lead.workflowStage !== 'legal') {
      return res.status(400).json({ message: 'Lead must be in legal stage' });
    }

    // Update lead
    lead.workflowStage = 'finance';
    lead.assignedToFinance = assignedTo;
    lead.agreementStatus = 'approved';
    lead.legalApprovedAt = new Date();
    lead.legalApprovedBy = _id;
    lead.transferHistory.push({
      from: 'legal',
      to: 'finance',
      transferredBy: _id,
      transferredTo: assignedTo,
      notes: notes || ''
    });

    await lead.save();

    res.json({ 
      message: 'Lead transferred to finance team successfully',
      lead 
    });
  } catch (error) {
    console.error('Error transferring to finance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload legal documents
router.post('/:id/legal/upload', auth, upload.array('documents', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.body;
    const { role, _id } = req.user;

    if (role !== 'legal-team' && role !== 'admin' && role !== 'super-admin') {
      return res.status(403).json({ message: 'Only legal team can upload documents' });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const documents = req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/workflow/${file.filename}`,
      fileSize: file.size,
      uploadedBy: _id,
      documentType: documentType || 'agreement'
    }));

    lead.legalDocuments.push(...documents);
    lead.agreementStatus = 'uploaded';
    await lead.save();

    res.json({ 
      message: 'Documents uploaded successfully',
      documents,
      lead 
    });
  } catch (error) {
    console.error('Error uploading legal documents:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload finance documents
router.post('/:id/finance/upload', auth, upload.array('documents', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, invoiceNumber, invoiceAmount, taxInvoiceNumber } = req.body;
    const { role, _id } = req.user;

    if (role !== 'finance-team' && role !== 'admin' && role !== 'super-admin') {
      return res.status(403).json({ message: 'Only finance team can upload documents' });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const documents = req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/workflow/${file.filename}`,
      fileSize: file.size,
      uploadedBy: _id,
      documentType: documentType || 'invoice'
    }));

    lead.financeDocuments.push(...documents);
    
    if (invoiceNumber) lead.invoiceNumber = invoiceNumber;
    if (invoiceAmount) lead.invoiceAmount = invoiceAmount;
    if (taxInvoiceNumber) lead.taxInvoiceNumber = taxInvoiceNumber;
    
    await lead.save();

    res.json({ 
      message: 'Documents uploaded successfully',
      documents,
      lead 
    });
  } catch (error) {
    console.error('Error uploading finance documents:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete legal document
router.delete('/:id/legal/delete/:docId', auth, async (req, res) => {
  try {
    const { id, docId } = req.params;
    const { role } = req.user;

    if (role !== 'legal-team' && role !== 'admin' && role !== 'super-admin') {
      return res.status(403).json({ message: 'Only legal team can delete documents' });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.legalDocuments = lead.legalDocuments.filter(doc => doc._id.toString() !== docId);
    await lead.save();

    res.json({ 
      message: 'Document deleted successfully',
      lead 
    });
  } catch (error) {
    console.error('Error deleting legal document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete finance document
router.delete('/:id/finance/delete/:docId', auth, async (req, res) => {
  try {
    const { id, docId } = req.params;
    const { role } = req.user;

    if (role !== 'finance-team' && role !== 'admin' && role !== 'super-admin') {
      return res.status(403).json({ message: 'Only finance team can delete documents' });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.financeDocuments = lead.financeDocuments.filter(doc => doc._id.toString() !== docId);
    await lead.save();

    res.json({ 
      message: 'Document deleted successfully',
      lead 
    });
  } catch (error) {
    console.error('Error deleting finance document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark workflow as completed
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const { role, _id } = req.user;

    if (role !== 'finance-team' && role !== 'admin' && role !== 'super-admin') {
      return res.status(403).json({ message: 'Only finance team can complete workflow' });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.workflowStage = 'completed';
    lead.paymentStatus = 'completed';
    lead.paymentCompletedAt = new Date();
    lead.transferHistory.push({
      from: 'finance',
      to: 'completed',
      transferredBy: _id,
      notes: notes || 'Workflow completed'
    });

    await lead.save();

    res.json({ 
      message: 'Workflow completed successfully',
      lead 
    });
  } catch (error) {
    console.error('Error completing workflow:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get workflow tracker data (Admin/Manager view)
router.get('/tracker', auth, async (req, res) => {
  try {
    const { role } = req.user;

    if (!['admin', 'manager', 'senior-manager', 'super-admin'].includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const leads = await Lead.find({ 
      workflowStage: { $in: ['legal', 'finance', 'completed'] }
    })
      .populate('assignedTo', 'name email')
      .populate('assignedToLegal', 'name email')
      .populate('assignedToFinance', 'name email')
      .populate('product', 'name')
      .sort({ updatedAt: -1 });

    res.json({ leads });
  } catch (error) {
    console.error('Error fetching workflow tracker:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get work history for Legal/Finance team
router.get('/my-history', auth, async (req, res) => {
  try {
    const { role, _id } = req.user;
    let query = {};

    if (role === 'legal-team') {
      query = { assignedToLegal: _id };
    } else if (role === 'finance-team') {
      query = { assignedToFinance: _id };
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedToLegal', 'name email')
      .populate('assignedToFinance', 'name email')
      .sort({ updatedAt: -1 });

    // Format history with assignedBy info from transferHistory
    const history = leads.map(lead => {
      const transferEntry = lead.transferHistory?.find(t => 
        (role === 'legal-team' && t.to === 'legal') || 
        (role === 'finance-team' && t.to === 'finance')
      );

      return {
        _id: lead._id,
        contactPerson: lead.contactPerson,
        email: lead.email,
        companyName: lead.companyName,
        workflowStage: lead.workflowStage,
        legalDocuments: lead.legalDocuments,
        financeDocuments: lead.financeDocuments,
        assignedAt: transferEntry?.transferredAt || lead.updatedAt,
        assignedByName: transferEntry?.transferredBy?.name || 'System'
      };
    });

    res.json({ history });
  } catch (error) {
    console.error('Error fetching work history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get users by role (for assignment dropdown)
router.get('/users/:role', auth, async (req, res) => {
  try {
    const { role } = req.params;
    
    const users = await User.find({ 
      role: role,
      isActive: true 
    }).select('name email');

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send document via email
router.post('/send-document-email', auth, async (req, res) => {
  try {
    const { documentId, leadId, customerEmail, documentName, documentUrl, teamType } = req.body;
    const { role, email: senderEmail, companyId } = req.user;

    if (!['legal-team', 'finance-team', 'admin', 'super-admin'].includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Get company SMTP settings
    const Company = require('../models/Company');
    const company = await Company.findById(companyId);
    
    let transportConfig;
    
    // Use company SMTP if configured, otherwise use default
    if (company?.settings?.smtp?.enabled) {
      transportConfig = {
        host: company.settings.smtp.host,
        port: company.settings.smtp.port,
        secure: company.settings.smtp.secure,
        auth: {
          user: company.settings.smtp.user,
          pass: company.settings.smtp.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      };
    } else {
      // Fallback to default Green Call SMTP
      transportConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const teamName = teamType === 'legal' ? 'Legal' : 'Finance';
    const fromEmail = company?.settings?.smtp?.from || process.env.SMTP_FROM;
    const companyName = company?.name || 'Green Call CRM';
    
    // Get production URL from company settings or env
    const baseUrl = company?.settings?.baseUrl || process.env.PRODUCTION_URL || process.env.BASE_URL || 'http://localhost:5004';
    const documentFullUrl = `${baseUrl}${documentUrl}`;
    
    // Read file for attachment
    const filePath = path.join(__dirname, '..', documentUrl.startsWith('/') ? documentUrl.substring(1) : documentUrl);
    
    console.log(`📂 Looking for file at: ${filePath}`);
    console.log(`📄 File exists: ${fs.existsSync(filePath)}`);
    
    let attachments = [];
    if (fs.existsSync(filePath)) {
      attachments.push({
        filename: documentName,
        path: filePath
      });
      console.log(`✅ File attached: ${documentName}`);
    } else {
      console.log(`❌ File not found at: ${filePath}`);
    }

    const mailOptions = {
      from: fromEmail,
      to: customerEmail,
      subject: `Document from ${teamName} Team - ${companyName}`,
      attachments: attachments,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Document from ${teamName} Team</h2>
          <p>Dear ${lead.contactPerson},</p>
          <p>Please find the document attached with this email.</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Document Name:</strong> ${documentName}</p>
            <p><strong>Company:</strong> ${lead.companyName}</p>
            <p><strong>Team:</strong> ${teamName}</p>
          </div>
          ${attachments.length === 0 ? `
          <p>
            <a href="${documentFullUrl}" 
               style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Download Document
            </a>
          </p>
          ` : '<p style="color: #22c55e; font-weight: 600;">📎 Document is attached with this email</p>'}
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            ${teamName} Team<br>
            ${companyName}
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${customerEmail} from ${fromEmail}`);

    res.json({ 
      message: 'Email sent successfully',
      success: true
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

module.exports = router;
