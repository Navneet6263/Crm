import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { showToast } from './ToastNotification';


const CommunicationHub = ({ darkMode, lead, onClose }) => {
  const [activeTab, setActiveTab] = useState('call');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const emailTemplates = [
    {
      id: 'intro',
      name: 'Introduction Email',
      subject: 'Partnership Opportunity with Green Call',
      body: `Dear ${lead?.contactPerson || '[Name]'},

I hope this email finds you well. My name is [Your Name] from Green Call, and I'm reaching out regarding a potential partnership opportunity that could benefit ${lead?.companyName || '[Company]'}.

We specialize in providing comprehensive CRM solutions that help businesses like yours streamline operations and increase revenue by up to 30%.

I'd love to schedule a brief 15-minute call to discuss how we can help ${lead?.companyName || '[Company]'} achieve its goals.

Best regards,
[Your Name]
Green Call Team`
    },
    {
      id: 'followup',
      name: 'Follow-up Email',
      subject: 'Following up on our conversation',
      body: `Hi ${lead?.contactPerson || '[Name]'},

Thank you for taking the time to speak with me earlier. I wanted to follow up on our discussion about ${lead?.companyName || '[Company]'}'s growth objectives.

As promised, I've attached some relevant case studies that demonstrate how similar companies have achieved remarkable results with our solutions.

Would you be available for a quick call this week to discuss the next steps?

Looking forward to hearing from you.

Best regards,
[Your Name]`
    },
    {
      id: 'proposal',
      name: 'Proposal Email',
      subject: 'Customized Solution Proposal for ' + (lead?.companyName || '[Company]'),
      body: `Dear ${lead?.contactPerson || '[Name]'},

Based on our recent conversation, I've prepared a customized proposal specifically tailored to ${lead?.companyName || '[Company]'}'s needs.

Key benefits you can expect:
• Increased efficiency by 40%
• Reduced operational costs
• Enhanced customer satisfaction
• Real-time analytics and reporting

I've attached the detailed proposal for your review. I'm confident this solution will deliver exceptional value to your organization.

Shall we schedule a call to discuss the proposal in detail?

Best regards,
[Your Name]
Green Call Solutions`
    }
  ];

  const handleCall = () => {
    if (lead?.phone) {
      // In a real app, this would integrate with a calling service
      window.open(`tel:${lead.phone}`);
      showToast('info', `📞 Initiating call to ${lead.contactPerson}...`);
    } else {
      showToast('error', '❌ No phone number available');
    }
  };

  const handleWhatsApp = () => {
    if (lead?.phone) {
      const message = customMessage || `Hi ${lead.contactPerson}, this is regarding your inquiry about our CRM solutions. I'd love to discuss how we can help ${lead.companyName} grow!`;
      const whatsappUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      showToast('success', '💬 WhatsApp message sent!');
    } else {
      showToast('error', '❌ No phone number available');
    }
  };

  const handleEmail = () => {
    if (lead?.email && emailTemplate) {
      const template = emailTemplates.find(t => t.id === emailTemplate);
      const subject = template?.subject || 'Business Inquiry';
      const body = template?.body || customMessage;
      
      const mailtoUrl = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl);
      showToast('success', '📧 Email client opened!');
    } else {
      showToast('error', '❌ Please select a template and ensure email is available');
    }
  };

  const generateMeetingLink = () => {
    // Generate a mock meeting link
    const meetingId = Math.random().toString(36).substring(2, 15);
    const meetingLink = `https://meet.google.com/${meetingId}`;
    
    navigator.clipboard.writeText(meetingLink).then(() => {
      setCopied(true);
      showToast('success', '🔗 Meeting link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
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
          borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: darkMode ? 'white' : '#1f2937',
              margin: '0 0 0.5rem 0'
            }}>
              Communication Hub
            </h2>
            <p style={{
              color: darkMode ? '#9ca3af' : '#6b7280',
              margin: 0
            }}>
              Connect with {lead?.contactPerson} at {lead?.companyName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Contact Info */}
        <div style={{
          padding: '1.5rem 2rem',
          background: darkMode ? '#374151' : '#f9fafb',
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={16} style={{ color: '#22c55e' }} />
            <span style={{ color: darkMode ? 'white' : '#1f2937', fontWeight: '500' }}>
              {lead?.phone || 'No phone'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={16} style={{ color: '#3b82f6' }} />
            <span style={{ color: darkMode ? 'white' : '#1f2937', fontWeight: '500' }}>
              {lead?.email || 'No email'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          padding: '1.5rem 2rem 0',
          display: 'flex',
          gap: '0.5rem',
          borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <button
            onClick={() => setActiveTab('call')}
            style={tabStyle(activeTab === 'call')}
          >
            <PhoneCall size={16} />
            Call
          </button>
          <button
            onClick={() => setActiveTab('email')}
            style={tabStyle(activeTab === 'email')}
          >
            <Mail size={16} />
            Email
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            style={tabStyle(activeTab === 'whatsapp')}
          >
            <MessageCircle size={16} />
            WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('meeting')}
            style={tabStyle(activeTab === 'meeting')}
          >
            <Video size={16} />
            Meeting
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '2rem' }}>
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  Select Email Template
                </label>
                <select
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Choose a template...</option>
                  {emailTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {emailTemplate && (
                <div style={{
                  background: darkMode ? '#374151' : '#f9fafb',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#1f2937',
                    marginBottom: '1rem'
                  }}>
                    Preview:
                  </h4>
                  <div style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#d1d5db' : '#374151',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line'
                  }}>
                    <strong>Subject:</strong> {emailTemplates.find(t => t.id === emailTemplate)?.subject}
                    <br /><br />
                    {emailTemplates.find(t => t.id === emailTemplate)?.body}
                  </div>
                </div>
              )}

              <button
                onClick={handleEmail}
                disabled={!emailTemplate}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: emailTemplate 
                    ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                    : (darkMode ? '#4b5563' : '#d1d5db'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: emailTemplate ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Send size={20} />
                Send Email
              </button>
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

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
                    gap: '0.5rem'
                  }}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  {copied ? 'Copied!' : 'Generate Link'}
                </button>
                
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
                  <ExternalLink size={20} />
                  Open Calendar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;