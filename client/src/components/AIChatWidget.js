import React, { useState, useEffect, useRef } from 'react';
import { Brain, X, Send, Minimize2, Maximize2 } from 'lucide-react';

const AIChatWidget = ({ darkMode, currentUser, crmData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
    }
  }, [isOpen]);

  const generateAIResponse = async (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('help') || message.includes('assist')) {
      return `Hi ${currentUser?.name || 'there'}! 👋 I can help you with:

• 📊 Check your sales performance
• 📧 Generate professional emails
• 🎯 Prioritize your leads
• 📝 Create meeting summaries
• 💡 Business insights and tips

What would you like help with?`;
    }

    if (message.includes('leads') || message.includes('priority')) {
      const leadCount = crmData.leads?.length || 0;
      return `📈 You have ${leadCount} leads in your pipeline.

🎯 Quick Actions:
• High-value leads: ${crmData.leads?.filter(l => (l.estimatedValue || 0) > 500000).length || 0}
• New leads today: ${crmData.leads?.filter(l => {
        const today = new Date().toDateString();
        return new Date(l.createdDate || Date.now()).toDateString() === today;
      }).length || 0}

Would you like me to show you the top priority leads?`;
    }

    if (message.includes('performance') || message.includes('stats')) {
      const leads = crmData.leads || [];
      const converted = leads.filter(l => l.status === 'converted').length;
      const conversionRate = leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;
      
      return `📊 Your Performance Summary:

• Total Leads: ${leads.length}
• Converted: ${converted}
• Conversion Rate: ${conversionRate}%
• Pipeline Value: ₹${((leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)) / 100000).toFixed(1)}L

${conversionRate < 20 ? '💡 Tip: Focus on lead qualification to improve conversion!' : '🎉 Great conversion rate! Keep it up!'}`;
    }

    if (message.includes('email') || message.includes('template')) {
      return `📧 Here's a quick follow-up email template:

**Subject:** Quick follow-up on our conversation

Hi [Client Name],

Hope you're doing well! Just wanted to follow up on our discussion about your business needs.

I believe our CRM solution can help you:
• Increase lead conversion by 30%
• Streamline your sales process
• Improve customer relationships

Would you be available for a quick 15-minute call this week?

Best regards,
${currentUser?.name || '[Your Name]'}

Would you like me to customize this for a specific lead?`;
    }

    // Default helpful response
    return `I'm here to help! 🤖 Try asking me about:

• "Show my leads" - Lead insights
• "Check performance" - Sales stats  
• "Generate email" - Email templates
• "Help" - See all options

What can I assist you with today?`;
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

    setTimeout(async () => {
      const aiResponse = await generateAIResponse(inputMessage);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }, 1000);
  };

  const toggleWidget = () => {
    if (!isOpen) {
      // Initialize with welcome message if first time opening
      if (messages.length === 0) {
        const welcomeMessage = {
          id: 1,
          type: 'ai',
          content: `Hello ${currentUser?.name || 'there'}! 👋 

I'm your AI assistant. I can help you with leads, performance insights, email templates, and more!

Type "help" to see what I can do for you.`,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
    }
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeWidget = () => {
    setIsMinimized(true);
  };

  const maximizeWidget = () => {
    setIsMinimized(false);
  };

  // Floating button styles
  const floatingButtonStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    animation: hasNewMessage ? 'pulse 2s infinite' : 'none'
  };

  // Chat widget styles
  const widgetStyle = {
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    width: isMinimized ? '300px' : '380px',
    height: isMinimized ? '60px' : '500px',
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={toggleWidget}
        style={floatingButtonStyle}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)';
        }}
      >
        <Brain size={24} color="white" />
        {hasNewMessage && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '20px',
            height: '20px',
            background: '#ef4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            !
          </div>
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div style={widgetStyle}>
          {/* Header */}
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={20} />
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                  AI Assistant
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>
                  Online • Ready to help
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={isMinimized ? maximizeWidget : minimizeWidget}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {isMinimized ? <Maximize2 size={16} color="white" /> : <Minimize2 size={16} color="white" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} color="white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1,
                padding: '1rem',
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
                      maxWidth: '85%',
                      padding: '0.75rem 1rem',
                      borderRadius: message.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: message.type === 'user' 
                        ? 'linear-gradient(135deg, #22c55e, #4ade80)'
                        : (darkMode ? '#374151' : '#f3f4f6'),
                      color: message.type === 'user' ? 'white' : (darkMode ? 'white' : '#1f2937'),
                      fontSize: '0.875rem',
                      lineHeight: '1.4',
                      whiteSpace: 'pre-line'
                    }}>
                      {message.content}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '18px 18px 18px 4px',
                      background: darkMode ? '#374151' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            style={{
                              width: '6px',
                              height: '6px',
                              background: '#8b5cf6',
                              borderRadius: '50%',
                              animation: `bounce 1.4s infinite ${i * 0.2}s`
                            }}
                          />
                        ))}
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}>
                        AI is typing...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '1rem',
                borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '20px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    style={{
                      padding: '0.75rem',
                      background: inputMessage.trim() && !isTyping 
                        ? 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                        : (darkMode ? '#4b5563' : '#d1d5db'),
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </>
  );
};

export default AIChatWidget;