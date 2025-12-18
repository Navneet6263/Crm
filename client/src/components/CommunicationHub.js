import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Video, 
  Send, 
  Template, 
  PhoneCall,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Calendar,
  Clock,
  User,
  Building2,
  Sparkles
} from 'lucide-react';
import { showToast } from './ToastNotification';

const CommunicationHub = ({ darkMode, lead, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState('email');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' });
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(lead?.email || '');
  const [sending, setSending] = useState(false);

  // Check if user has company or is admin/super-admin (allow them full access)
  // Only restrict random users who signed up without company
  const hasCompanyAccess = currentUser?.companyId || currentUser?.tenantId || 
                           ['super-admin', 'admin', 'manager', 'senior-manager', 'sales', 'marketing'].includes(currentUser?.role);
  const hasPaidPlan = hasCompanyAccess;

  // Load custom templates from localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('emailTemplates');
    if (savedTemplates) {
      setCustomTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  const defaultTemplates = [
    {
      id: 'intro',
      name: '🤝 Introduction Email',
      subject: 'Partnership Opportunity with Green Call',
      body: `Dear ${lead?.contactPerson || '[Name]'},

I hope this email finds you well. My name is [Your Name] from Green Call, and I'm reaching out regarding a potential partnership opportunity that could benefit ${lead?.companyName || '[Company]'}.

We specialize in providing comprehensive CRM solutions that help businesses like yours:
✅ Streamline operations and increase efficiency
✅ Boost revenue by up to 30%
✅ Enhance customer satisfaction
✅ Provide real-time analytics and insights

I'd love to schedule a brief 15-minute call to discuss how we can help ${lead?.companyName || '[Company]'} achieve its goals.

Best regards,
[Your Name]
Green Call Team

P.S. I've helped similar companies in ${lead?.industry || 'your industry'} achieve remarkable growth. Let's explore what's possible for you!`
    },
    {
      id: 'followup',
      name: '📞 Follow-up Email',
      subject: 'Following up on our conversation - Next Steps',
      body: `Hi ${lead?.contactPerson || '[Name]'},

Thank you for taking the time to speak with me earlier about ${lead?.companyName || '[Company]'}'s growth objectives.

As discussed, here's a quick recap of what we covered:
• Your current challenges with [specific challenge]
• How our solution can address these pain points
• The potential ROI you could see within 3-6 months

I've attached some relevant case studies that demonstrate how similar companies have achieved remarkable results with our solutions.

Next Steps:
1. Review the attached materials
2. Schedule a demo call this week
3. Discuss implementation timeline

Would you be available for a 30-minute demo call this week? I have slots available on [Day] at [Time] or [Day] at [Time].

Looking forward to hearing from you!

Best regards,
[Your Name]`
    },
    {
      id: 'proposal',
      name: '📋 Proposal Email',
      subject: 'Customized Solution Proposal for ' + (lead?.companyName || '[Company]'),
      body: `Dear ${lead?.contactPerson || '[Name]'},

Based on our recent conversation, I've prepared a customized proposal specifically tailored to ${lead?.companyName || '[Company]'}'s unique needs and objectives.

🎯 Key Benefits You Can Expect:
• Increased operational efficiency by 40%
• Reduced costs through automation
• Enhanced customer satisfaction scores
• Real-time analytics and reporting
• Seamless integration with existing systems

💰 Investment & ROI:
The proposed solution is designed to pay for itself within 6 months through increased efficiency and cost savings.

📊 Success Metrics:
We'll track specific KPIs to ensure you're seeing measurable results from day one.

I've attached the detailed proposal for your review. I'm confident this solution will deliver exceptional value to your organization.

Shall we schedule a call to discuss the proposal in detail? I'm available this week for a 45-minute deep-dive session.

Best regards,
[Your Name]
Green Call Solutions

P.S. This proposal is valid for 30 days. Let's move forward while the momentum is strong!`
    },
    {
      id: 'demo',
      name: '🎥 Demo Invitation',
      subject: 'Exclusive Demo: See How We Can Transform ' + (lead?.companyName || '[Company]'),
      body: `Hi ${lead?.contactPerson || '[Name]'},

I hope you're having a great week!

I wanted to personally invite you to an exclusive demo of our CRM solution, specifically customized for companies like ${lead?.companyName || '[Company]'}.

🎯 What You'll See in This Demo:
• Live walkthrough of features relevant to your needs
• Real-world scenarios similar to your business
• Q&A session tailored to your specific questions
• Pricing and implementation timeline discussion

⏰ Demo Details:
Duration: 30 minutes
Format: Screen share via Google Meet/Zoom
When: [Your preferred time slots]

🎁 Special Bonus:
Attendees will receive a complimentary business analysis report worth $500!

To secure your spot, simply reply with your preferred time, or click here to book directly: [Calendar Link]

Looking forward to showing you what's possible!

Best regards,
[Your Name]

P.S. Spots are limited, so please book soon to avoid disappointment.`
    }
  ];

  const allTemplates = [...defaultTemplates, ...customTemplates];

  const handleCall = async () => {
    if (!hasPaidPlan) {
      showToast('error', '🔒 This feature is only available for paid plans');
      return;
    }
    if (lead?.phone) {
      try {
        // Log call activity
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
        await fetch(`${apiUrl}/communications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            type: 'call',
            subject: `Call to ${lead.contactPerson}`,
            content: `Initiated call to ${lead.phone}`,
            recipient: lead.phone,
            leadId: lead._id || lead.id,
            status: 'initiated'
          })
        });
        
        // Open dialer
        window.open(`tel:${lead.phone}`);
        showToast('success', `📞 Call initiated to ${lead.contactPerson}`);
      } catch (error) {
        console.error('Error logging call:', error);
        window.open(`tel:${lead.phone}`);
        showToast('info', `📞 Initiating call to ${lead.contactPerson}...`);
      }
    } else {
      showToast('error', '❌ No phone number available');
    }
  };

  const handleWhatsApp = async () => {
    if (!hasPaidPlan) {
      showToast('error', '🔒 This feature is only available for paid plans');
      return;
    }
    if (lead?.phone) {
      try {
        const message = customMessage || `Hi ${lead.contactPerson}, this is regarding your inquiry about our CRM solutions. I'd love to discuss how we can help ${lead.companyName} grow!`;
        
        // Log WhatsApp activity
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
        await fetch(`${apiUrl}/communications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            type: 'whatsapp',
            subject: `WhatsApp to ${lead.contactPerson}`,
            content: message,
            recipient: lead.phone,
            leadId: lead._id || lead.id,
            status: 'sent'
          })
        });
        
        const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        showToast('success', '💬 WhatsApp opened successfully!');
        setCustomMessage(''); // Clear message after sending
      } catch (error) {
        console.error('Error logging WhatsApp:', error);
        const message = customMessage || `Hi ${lead.contactPerson}, this is regarding your inquiry about our CRM solutions.`;
        const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        showToast('success', '💬 WhatsApp opened!');
      }
    } else {
      showToast('error', '❌ No phone number available');
    }
  };

  const handleEmail = async () => {
    if (!hasPaidPlan) {
      showToast('error', '🔒 This feature is only available for paid plans');
      return;
    }
    if (!recipientEmail || !emailSubject || !emailBody) {
      showToast('error', '❌ Please fill all required fields');
      return;
    }

    setSending(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
      const response = await fetch(`${apiUrl}/communications/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: emailSubject,
          body: emailBody,
          leadId: lead?._id || lead?.id,
          type: 'email'
        })
      });

      if (response.ok) {
        showToast('success', '✅ Email sent successfully!');
        // Reset form
        setEmailSubject('');
        setEmailBody('');
        setEmailTemplate('');
      } else {
        const error = await response.json();
        showToast('error', `❌ Failed to send email: ${error.message}`);
      }
    } catch (error) {
      console.error('Email sending error:', error);
      showToast('error', '❌ Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const saveTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      showToast('error', '❌ Please fill all template fields');
      return;
    }

    const templateId = editingTemplate?.id || Date.now().toString();
    const template = {
      id: templateId,
      name: newTemplate.name,
      subject: newTemplate.subject,
      body: newTemplate.body,
      isCustom: true
    };

    let updatedTemplates;
    if (editingTemplate) {
      updatedTemplates = customTemplates.map(t => t.id === templateId ? template : t);
    } else {
      updatedTemplates = [...customTemplates, template];
    }

    setCustomTemplates(updatedTemplates);
    localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
    
    setShowTemplateEditor(false);
    setEditingTemplate(null);
    setNewTemplate({ name: '', subject: '', body: '' });
    showToast('success', '✅ Template saved successfully!');
  };

  const deleteTemplate = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = customTemplates.filter(t => t.id !== templateId);
      setCustomTemplates(updatedTemplates);
      localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
      showToast('success', '🗑️ Template deleted successfully!');
    }
  };

  const editTemplate = (template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      body: template.body
    });
    setShowTemplateEditor(true);
  };

  const replaceVariables = (text) => {
    return text
      .replace(/\[Name\]/g, lead?.contactPerson || '[Name]')
      .replace(/\[Company\]/g, lead?.companyName || '[Company]')
      .replace(/\[Your Name\]/g, '[Your Name]')
      .replace(/\[Day\]/g, '[Day]')
      .replace(/\[Time\]/g, '[Time]')
      .replace(/\[Calendar Link\]/g, '[Calendar Link]');
  };

  const generateMeetingLink = async () => {
    if (!hasPaidPlan) {
      showToast('error', '🔒 This feature is only available for paid plans');
      return;
    }
    try {
      // Generate meeting link
      const meetingId = Math.random().toString(36).substring(2, 15);
      const meetingLink = `https://meet.google.com/${meetingId}`;
      
      // Log meeting activity
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
      await fetch(`${apiUrl}/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          type: 'meeting',
          subject: `Meeting scheduled with ${lead.contactPerson}`,
          content: `Meeting link generated: ${meetingLink}`,
          recipient: lead.email,
          leadId: lead._id || lead.id,
          status: 'scheduled'
        })
      });
      
      // Copy to clipboard
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      showToast('success', '🔗 Meeting link copied! Share with ' + lead.contactPerson);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Error generating meeting link:', error);
      const meetingId = Math.random().toString(36).substring(2, 15);
      const meetingLink = `https://meet.google.com/${meetingId}`;
      
      navigator.clipboard.writeText(meetingLink).then(() => {
        setCopied(true);
        showToast('success', '🔗 Meeting link copied!');
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem'
  };

  const modalStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };

  const tabStyle = (isActive) => ({
    padding: '1rem 1.5rem',
    border: 'none',
    background: isActive 
      ? 'linear-gradient(135deg, #22c55e, #4ade80)'
      : 'transparent',
    color: isActive ? 'white' : (darkMode ? '#9ca3af' : '#6b7280'),
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={containerStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '2rem',
          background: `linear-gradient(135deg, ${darkMode ? '#1f2937' : '#f8fafc'}, ${darkMode ? '#374151' : '#e2e8f0'})`,
          borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
            }}>
              <Sparkles size={28} color="white" />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: '0 0 0.25rem 0',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Communication Hub
              </h2>
              <p style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                margin: 0,
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                Connect with {lead?.contactPerson} at {lead?.companyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: darkMode ? '#374151' : '#f3f4f6',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              cursor: 'pointer',
              color: darkMode ? '#9ca3af' : '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = darkMode ? '#4b5563' : '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = darkMode ? '#374151' : '#f3f4f6';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contact Info */}
        <div style={{
          padding: '1.5rem 2rem',
          background: darkMode ? '#374151' : '#f8fafc',
          borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e2e8f0'}`
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: darkMode ? '#4b5563' : 'white',
              borderRadius: '12px',
              border: `1px solid ${darkMode ? '#6b7280' : '#e5e7eb'}`,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Phone size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', fontWeight: '500' }}>Phone</div>
                <div style={{ color: darkMode ? 'white' : '#1f2937', fontWeight: '600' }}>
                  {lead?.phone || 'No phone available'}
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: darkMode ? '#4b5563' : 'white',
              borderRadius: '12px',
              border: `1px solid ${darkMode ? '#6b7280' : '#e5e7eb'}`,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Mail size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', fontWeight: '500' }}>Email</div>
                <div style={{ color: darkMode ? 'white' : '#1f2937', fontWeight: '600' }}>
                  {lead?.email || 'No email available'}
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: darkMode ? '#4b5563' : 'white',
              borderRadius: '12px',
              border: `1px solid ${darkMode ? '#6b7280' : '#e5e7eb'}`,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', fontWeight: '500' }}>Company</div>
                <div style={{ color: darkMode ? 'white' : '#1f2937', fontWeight: '600' }}>
                  {lead?.companyName || 'No company'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          padding: '1.5rem 2rem 0',
          display: 'flex',
          gap: '0.5rem',
          borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('email')}
            style={{
              ...tabStyle(activeTab === 'email'),
              background: activeTab === 'email' 
                ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                : 'transparent'
            }}
          >
            <Mail size={16} />
            Email
          </button>
          <button
            onClick={() => setActiveTab('call')}
            style={{
              ...tabStyle(activeTab === 'call'),
              background: activeTab === 'call' 
                ? 'linear-gradient(135deg, #22c55e, #4ade80)'
                : 'transparent'
            }}
          >
            <PhoneCall size={16} />
            Call
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            style={{
              ...tabStyle(activeTab === 'whatsapp'),
              background: activeTab === 'whatsapp' 
                ? 'linear-gradient(135deg, #22c55e, #4ade80)'
                : 'transparent'
            }}
          >
            <MessageCircle size={16} />
            WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('meeting')}
            style={{
              ...tabStyle(activeTab === 'meeting'),
              background: activeTab === 'meeting' 
                ? 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                : 'transparent'
            }}
          >
            <Video size={16} />
            Meeting
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '2rem' }}>
          {!hasPaidPlan && (
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Only for Paid Plan</h3>
              <p style={{ fontSize: '0.95rem', opacity: 0.95, marginBottom: '1rem' }}>
                Communication Hub is available only for company users with paid plans. Please contact your administrator or purchase a plan to unlock this feature.
              </p>
              <button
                onClick={() => {
                  showToast('info', '💎 Please contact admin or purchase a plan to access this feature');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'white',
                  color: '#f59e0b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                Contact Admin
              </button>
            </div>
          )}
          {activeTab === 'call' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)'
              }}
              onClick={handleCall}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 15px 35px rgba(34, 197, 94, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 10px 25px rgba(34, 197, 94, 0.3)';
              }}
              >
                <Phone size={40} color="white" />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '0.5rem'
              }}>
                Call {lead?.contactPerson}
              </h3>
              <p style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                marginBottom: '2rem'
              }}>
                Click the button above to initiate a call to {lead?.phone}
              </p>
              <button
                onClick={handleCall}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                <PhoneCall size={20} />
                Start Call
              </button>
            </div>
          )}

          {activeTab === 'email' && (
            <div>
              {/* Template Management */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  margin: 0
                }}>
                  📧 Email Templates
                </h3>
                <button
                  onClick={() => {
                    setShowTemplateEditor(true);
                    setEditingTemplate(null);
                    setNewTemplate({ name: '', subject: '', body: '' });
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Plus size={16} />
                  New Template
                </button>
              </div>

              {/* Template Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Select Template
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {allTemplates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => {
                        setEmailTemplate(template.id);
                        setEmailSubject(template.subject);
                        setEmailBody(replaceVariables(template.body));
                        if (!recipientEmail && lead?.email) {
                          setRecipientEmail(lead.email);
                        }
                      }}
                      style={{
                        padding: '1rem',
                        background: emailTemplate === template.id 
                          ? (darkMode ? '#3b82f6' : '#dbeafe')
                          : (darkMode ? '#374151' : 'white'),
                        border: `2px solid ${emailTemplate === template.id 
                          ? '#3b82f6' 
                          : (darkMode ? '#4b5563' : '#e5e7eb')}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: emailTemplate === template.id 
                          ? (darkMode ? 'white' : '#1f2937')
                          : (darkMode ? '#d1d5db' : '#374151'),
                        marginBottom: '0.25rem'
                      }}>
                        {template.name}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: emailTemplate === template.id 
                          ? (darkMode ? '#e5e7eb' : '#6b7280')
                          : (darkMode ? '#9ca3af' : '#6b7280'),
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {template.subject}
                      </div>
                      
                      {template.isCustom && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          display: 'flex',
                          gap: '0.25rem'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              editTemplate(template);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: darkMode ? '#9ca3af' : '#6b7280',
                              padding: '2px'
                            }}
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTemplate(template.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444',
                              padding: '2px'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Compose Form */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      📧 Recipient Email *
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="Enter recipient email address..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      📝 Subject *
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      💬 Message Body *
                    </label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Write your email message..."
                      rows={8}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    if (recipientEmail && emailSubject && emailBody) {
                      const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                      window.open(mailtoUrl);
                      showToast('success', '📧 Email client opened!');
                    } else {
                      showToast('error', '❌ Please fill all required fields');
                    }
                  }}
                  disabled={!recipientEmail || !emailSubject || !emailBody}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: (recipientEmail && emailSubject && emailBody)
                      ? 'linear-gradient(135deg, #6b7280, #9ca3af)'
                      : (darkMode ? '#4b5563' : '#d1d5db'),
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: (recipientEmail && emailSubject && emailBody) ? 'pointer' : 'not-allowed',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <ExternalLink size={16} />
                  Open in Email Client
                </button>
                
                <button
                  onClick={handleEmail}
                  disabled={!recipientEmail || !emailSubject || !emailBody || sending}
                  style={{
                    flex: 2,
                    padding: '1rem',
                    background: (recipientEmail && emailSubject && emailBody && !sending)
                      ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                      : (darkMode ? '#4b5563' : '#d1d5db'),
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: (recipientEmail && emailSubject && emailBody && !sending) ? 'pointer' : 'not-allowed',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: (recipientEmail && emailSubject && emailBody && !sending) ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                >
                  {sending ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Email Now
                    </>
                  )}
                </button>
              </div>
              
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  Custom Message
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={`Hi ${lead?.contactPerson}, this is regarding your inquiry about our CRM solutions...`}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              <button
                onClick={handleWhatsApp}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <MessageCircle size={20} />
                Send WhatsApp Message
              </button>
            </div>
          )}

          {activeTab === 'meeting' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)'
              }}>
                <Video size={40} color="white" />
              </div>
              
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '0.5rem'
              }}>
                Schedule Video Meeting
              </h3>
              
              <p style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                marginBottom: '2rem'
              }}>
                Generate a meeting link to share with {lead?.contactPerson}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <button
                  onClick={generateMeetingLink}
                  style={{
                    padding: '1rem 1.5rem',
                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  {copied ? 'Copied!' : 'Generate Google Meet'}
                </button>
                
                <button
                  onClick={() => {
                    const zoomUrl = `https://zoom.us/start/videomeeting`;
                    window.open(zoomUrl, '_blank');
                    showToast('info', '📹 Zoom meeting started!');
                  }}
                  style={{
                    padding: '1rem 1.5rem',
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Video size={20} />
                  Start Zoom
                </button>
                
                <button
                  onClick={() => {
                    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${Math.random().toString(36).substring(2, 15)}%40thread.v2/0?context=%7b%22Tid%22%3a%22${Math.random().toString(36).substring(2, 15)}%22%2c%22Oid%22%3a%22${Math.random().toString(36).substring(2, 15)}%22%7d`;
                    navigator.clipboard.writeText(teamsUrl).then(() => {
                      showToast('success', '💼 Teams link copied!');
                    });
                  }}
                  style={{
                    padding: '1rem 1.5rem',
                    background: 'linear-gradient(135deg, #6264a7, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Copy size={20} />
                  Copy Teams Link
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => window.open('https://calendar.google.com', '_blank')}
                  style={{
                    padding: '1rem 1.5rem',
                    background: darkMode ? '#374151' : '#f3f4f6',
                    color: darkMode ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Calendar size={20} />
                  Schedule in Calendar
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Template Editor Modal */}
        {showTemplateEditor && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '2rem'
          }}>
            <div style={{
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{
                padding: '1.5rem',
                borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  margin: 0
                }}>
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button
                  onClick={() => setShowTemplateEditor(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                      placeholder="e.g., Follow-up Email"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                      placeholder="Enter email subject..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Email Body
                    </label>
                    <textarea
                      value={newTemplate.body}
                      onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})}
                      placeholder="Write your email template... Use [Name], [Company], [Your Name] as placeholders"
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                    <div style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      marginTop: '0.5rem'
                    }}>
                      💡 Use placeholders: [Name], [Company], [Your Name], [Day], [Time], [Calendar Link]
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  marginTop: '1.5rem'
                }}>
                  <button
                    onClick={() => setShowTemplateEditor(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'transparent',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      color: darkMode ? '#d1d5db' : '#374151',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTemplate}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Save size={16} />
                    {editingTemplate ? 'Update' : 'Save'} Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationHub;