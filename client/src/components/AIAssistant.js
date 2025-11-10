import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Send, 
  Sparkles,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { showToast } from './ToastNotification';

const AIAssistant = ({ darkMode, currentUser, crmData }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage = {
      id: 1,
      type: 'ai',
      content: `Hello ${currentUser?.name || 'there'}! 👋 I'm your AI assistant. I can help you with:

• 📧 Generate professional emails
• 📞 Suggest next best actions for leads
• 📊 Analyze your sales performance
• 📝 Create meeting summaries
• 🎯 Provide lead insights

What would you like help with today?`,
      timestamp: new Date().toISOString()
    };

    setMessages([welcomeMessage]);
    generateSuggestions();
  }, [currentUser, crmData, generateSuggestions]);

  const generateSuggestions = () => {
    const leadCount = crmData.leads?.length || 0;
    const suggestions = [
      `📧 Write follow-up email for ${leadCount} leads`,
      '📊 Analyze my sales performance this month',
      '🎯 What leads should I prioritize today?',
      '📝 Generate meeting summary template',
      '💡 Suggest ways to improve conversion rate'
    ];
    setSuggestions(suggestions);
  };

  const generateAIResponse = async (userMessage) => {
    try {
      // Try to use real AI API first
      const aiService = await import('../services/aiService');
      const response = await aiService.default.generateResponse(userMessage, {
        currentUser,
        crmData
      });
      return response;
    } catch (error) {
      console.error('AI Service Error:', error);
      // Fallback to local responses
      return generateLocalResponse(userMessage);
    }
  };

  const generateLocalResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Email generation
    if (message.includes('email') || message.includes('follow-up')) {
      return {
        type: 'email',
        content: `Here's a professional follow-up email template:

**Subject:** Following up on our conversation - Next Steps

Dear [Client Name],

I hope this email finds you well. Thank you for taking the time to discuss your business needs with us yesterday.

Based on our conversation, I believe our CRM solution can help you:
• Increase lead conversion by 30%
• Streamline your sales process
• Improve customer relationship management

I've attached a customized proposal that addresses your specific requirements. Would you be available for a brief 15-minute call this week to discuss the next steps?

Looking forward to hearing from you.

Best regards,
${currentUser?.name || '[Your Name]'}
Green Call CRM Team`,
        actions: ['Copy Email', 'Send to Lead', 'Save Template']
      };
    }

    // Performance analysis
    if (message.includes('performance') || message.includes('analyze')) {
      const leads = crmData.leads || [];
      const conversionRate = leads.length > 0 ? 
        Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0;
      
      return {
        type: 'analysis',
        content: `📊 **Your Sales Performance Analysis:**

**Current Metrics:**
• Total Leads: ${leads.length}
• Conversion Rate: ${conversionRate}%
• Pipeline Value: ₹${((leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)) / 100000).toFixed(1)}L

**AI Insights:**
${conversionRate < 20 ? '🔴 Your conversion rate is below average. Focus on lead qualification.' : '🟢 Good conversion rate! Keep up the momentum.'}

**Recommendations:**
• Follow up with ${leads.filter(l => l.status === 'contacted').length} contacted leads
• Prioritize high-value prospects (>₹5L)
• Schedule demos for qualified leads`,
        actions: ['View Detailed Report', 'Export Analysis', 'Set Goals']
      };
    }

    // Lead prioritization
    if (message.includes('prioritize') || message.includes('leads')) {
      const highValueLeads = (crmData.leads || [])
        .filter(lead => (lead.estimatedValue || 0) > 500000)
        .slice(0, 3);

      return {
        type: 'recommendations',
        content: `🎯 **Top Priority Leads for Today:**

${highValueLeads.map((lead, index) => `
**${index + 1}. ${lead.companyName}**
• Contact: ${lead.contactPerson}
• Value: ₹${(lead.estimatedValue / 100000).toFixed(1)}L
• Status: ${lead.status}
• Action: ${lead.status === 'new' ? 'Initial contact' : 'Follow-up call'}`).join('\n')}

**Next Best Actions:**
• Call high-value prospects first
• Send personalized proposals
• Schedule product demos`,
        actions: ['Call Lead', 'Send Email', 'Schedule Meeting']
      };
    }

    // Meeting summary
    if (message.includes('meeting') || message.includes('summary')) {
      return {
        type: 'template',
        content: `📝 **Meeting Summary Template:**

**Meeting Details:**
• Date: [Date]
• Attendees: [Names]
• Duration: [Time]
• Type: [Call/In-person/Video]

**Key Discussion Points:**
• [Point 1]
• [Point 2]
• [Point 3]

**Decisions Made:**
• [Decision 1]
• [Decision 2]

**Action Items:**
• [Action] - [Owner] - [Due Date]
• [Action] - [Owner] - [Due Date]

**Next Steps:**
• [Next meeting date]
• [Follow-up actions]`,
        actions: ['Use Template', 'Save to Library', 'Share Template']
      };
    }

    // Conversion improvement
    if (message.includes('improve') || message.includes('conversion')) {
      return {
        type: 'insights',
        content: `💡 **AI-Powered Conversion Improvement Tips:**

**Immediate Actions:**
• Respond to new leads within 5 minutes (increases conversion by 400%)
• Use personalized email templates
• Follow up 5-7 times before giving up

**Process Improvements:**
• Implement lead scoring system
• Create nurture campaigns for cold leads
• Use social proof in proposals

**Technology Leverage:**
• Set up automated follow-up sequences
• Use CRM analytics for insights
• Implement chatbots for initial qualification

**Expected Impact:** 25-40% increase in conversion rate`,
        actions: ['Implement Tips', 'Create Action Plan', 'Track Progress']
      };
    }

    // Default response
    return {
      type: 'general',
      content: `I understand you're asking about "${userMessage}". Here are some ways I can help:

• 📧 **Email Generation** - Create professional emails and templates
• 📊 **Performance Analysis** - Analyze your sales metrics and trends
• 🎯 **Lead Prioritization** - Identify high-value prospects to focus on
• 📝 **Meeting Summaries** - Generate structured meeting notes
• 💡 **Business Insights** - Provide actionable recommendations

Try asking me something like:
"Generate a follow-up email" or "Analyze my performance"

💡 **Tip:** Add an AI API key in settings for enhanced responses!`,
      actions: ['View Examples', 'Get Started', 'Setup API']
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(inputMessage);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse.content,
        responseType: aiResponse.type,
        actions: aiResponse.actions,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion.replace(/📧|📊|🎯|📝|💡/g, '').trim());
  };

  const handleAction = (action, message) => {
    switch (action) {
      case 'Copy Email':
        navigator.clipboard.writeText(message.content);
        showToast('success', '📋 Email template copied to clipboard!');
        break;
      case 'Send to Lead':
        showToast('info', '📧 Opening email client...');
        break;
      case 'View Detailed Report':
        showToast('info', '📊 Generating detailed report...');
        break;
      case 'Call Lead':
        showToast('info', '📞 Initiating call...');
        break;
      default:
        showToast('info', `🤖 ${action} feature coming soon!`);
    }
  };

  const containerStyle = {
    padding: '0',
    background: darkMode ? '#111827' : '#f9fafb',
    minHeight: '100vh'
  };

  const cardStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <Brain style={{ color: '#8b5cf6' }} size={32} />
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0
            }}>
              AI Assistant
            </h1>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
              Your intelligent CRM companion powered by advanced AI
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem',
        height: 'calc(100vh - 200px)'
      }}>
        {/* Chat Interface */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Brain size={20} color="white" />
            </div>
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                AI Assistant
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#22c55e',
                margin: 0
              }}>
                Online • Ready to help
              </p>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {messages.map(message => (
              <div key={message.id} style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '1rem 1.5rem',
                  borderRadius: message.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: message.type === 'user' 
                    ? 'linear-gradient(135deg, #22c55e, #4ade80)'
                    : (darkMode ? '#374151' : '#f3f4f6'),
                  color: message.type === 'user' ? 'white' : (darkMode ? 'white' : '#1f2937')
                }}>
                  <div style={{
                    whiteSpace: 'pre-line',
                    lineHeight: '1.6',
                    fontSize: '0.875rem'
                  }}>
                    {message.content}
                  </div>
                  
                  {message.actions && (
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      {message.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleAction(action, message)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '20px 20px 20px 4px',
                  background: darkMode ? '#374151' : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '0.25rem'
                  }}>
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        style={{
                          width: '8px',
                          height: '8px',
                          background: '#8b5cf6',
                          borderRadius: '50%',
                          animation: `bounce 1.4s infinite ${i * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                  <span style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    AI is thinking...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '1.5rem',
            borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about your CRM data, leads, or business..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '1rem',
                    resize: 'none',
                    outline: 'none'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                style={{
                  padding: '1rem',
                  background: inputMessage.trim() && !isTyping 
                    ? 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                    : (darkMode ? '#4b5563' : '#d1d5db'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions Panel */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles style={{ color: '#f59e0b' }} size={20} />
            Quick Actions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: '1rem',
                  background: darkMode ? '#374151' : '#f9fafb',
                  border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  color: darkMode ? 'white' : '#1f2937',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = darkMode ? '#4b5563' : '#f3f4f6';
                  e.target.style.borderColor = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = darkMode ? '#374151' : '#f9fafb';
                  e.target.style.borderColor = darkMode ? '#4b5563' : '#e5e7eb';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* AI Capabilities */}
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1rem'
            }}>
              AI Capabilities
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: Mail, label: 'Email Generation', color: '#3b82f6' },
                { icon: TrendingUp, label: 'Performance Analysis', color: '#22c55e' },
                { icon: Target, label: 'Lead Prioritization', color: '#f59e0b' },
                { icon: Calendar, label: 'Meeting Summaries', color: '#8b5cf6' },
                { icon: Lightbulb, label: 'Business Insights', color: '#ef4444' }
              ].map((capability, index) => {
                const Icon = capability.icon;
                return (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: darkMode ? '#374151' : '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <Icon size={16} style={{ color: capability.color }} />
                    <span style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}>
                      {capability.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;