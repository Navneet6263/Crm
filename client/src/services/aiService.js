// AI Service for integrating multiple AI APIs
class AIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_AI_API_KEY;
    this.provider = process.env.REACT_APP_AI_PROVIDER || 'huggingface'; // huggingface, cohere, openai, gemini, claude
    this.baseURL = this.getBaseURL();
  }

  getBaseURL() {
    switch (this.provider) {
      case 'huggingface':
        return 'https://api-inference.huggingface.co/models';
      case 'cohere':
        return 'https://api.cohere.ai/v1';
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'gemini':
        return 'https://generativelanguage.googleapis.com/v1beta';
      case 'claude':
        return 'https://api.anthropic.com/v1';
      default:
        return 'https://api-inference.huggingface.co/models';
    }
  }

  async generateResponse(userMessage, context = {}) {
    console.log('AI Service - API Key:', this.apiKey ? 'Present' : 'Missing');
    console.log('AI Service - Provider:', this.provider);
    
    if (!this.apiKey || this.apiKey === 'your_huggingface_api_key_here') {
      console.log('Using fallback response - no valid API key');
      return this.getFallbackResponse(userMessage, context);
    }

    try {
      switch (this.provider) {
        case 'huggingface':
          return await this.callHuggingFace(userMessage, context);
        case 'cohere':
          return await this.callCohere(userMessage, context);
        case 'openai':
          return await this.callOpenAI(userMessage, context);
        case 'gemini':
          return await this.callGemini(userMessage, context);
        case 'claude':
          return await this.callClaude(userMessage, context);
        default:
          return await this.callHuggingFace(userMessage, context);
      }
    } catch (error) {
      console.error('AI API Error:', error);
      return this.getFallbackResponse(userMessage, context);
    }
  }

  async callOpenAI(userMessage, context) {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      type: this.detectResponseType(userMessage),
      actions: this.generateActions(userMessage)
    };
  }

  async callGemini(userMessage, context) {
    const prompt = `${this.buildSystemPrompt(context)}\n\nUser: ${userMessage}\nAssistant:`;
    
    const response = await fetch(`${this.baseURL}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7
        }
      })
    });

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      type: this.detectResponseType(userMessage),
      actions: this.generateActions(userMessage)
    };
  }

  async callHuggingFace(userMessage, context) {
    try {
      const response = await fetch(`${this.baseURL}/microsoft/DialoGPT-medium`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: userMessage,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (!response.ok) {
        console.error('HuggingFace API Error:', response.status, response.statusText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('HuggingFace Response:', data);
      
      return {
        content: data[0]?.generated_text || this.getFallbackResponse(userMessage, context).content,
        type: this.detectResponseType(userMessage),
        actions: this.generateActions(userMessage)
      };
    } catch (error) {
      console.error('HuggingFace API Error:', error);
      return this.getFallbackResponse(userMessage, context);
    }
  }

  async callCohere(userMessage, context) {
    const prompt = `${this.buildSystemPrompt(context)}\n\nUser: ${userMessage}\nAssistant:`;
    
    const response = await fetch(`${this.baseURL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'command-light',
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return {
      content: data.generations[0]?.text || 'Sorry, I could not generate a response.',
      type: this.detectResponseType(userMessage),
      actions: this.generateActions(userMessage)
    };
  }

  async callClaude(userMessage, context) {
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        system: this.buildSystemPrompt(context),
        messages: [
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();
    return {
      content: data.content[0].text,
      type: this.detectResponseType(userMessage),
      actions: this.generateActions(userMessage)
    };
  }

  buildSystemPrompt(context) {
    const { currentUser, crmData } = context;
    
    return `You are an AI assistant for Green Call CRM system. You help with:
- Email generation and templates
- Lead analysis and prioritization  
- Sales performance insights
- Meeting summaries and notes
- Business recommendations

Current Context:
- User: ${currentUser?.name || 'User'}
- Role: ${currentUser?.role || 'Unknown'}
- Total Leads: ${crmData?.leads?.length || 0}
- Active Customers: ${crmData?.customers?.length || 0}

Provide helpful, professional responses focused on CRM and sales activities. Keep responses concise and actionable.`;
  }

  detectResponseType(message) {
    const msg = message.toLowerCase();
    if (msg.includes('email') || msg.includes('template')) return 'email';
    if (msg.includes('performance') || msg.includes('analytics')) return 'analysis';
    if (msg.includes('lead') || msg.includes('prioritize')) return 'recommendations';
    if (msg.includes('meeting') || msg.includes('summary')) return 'template';
    return 'general';
  }

  generateActions(message) {
    const msg = message.toLowerCase();
    if (msg.includes('email')) return ['Copy Email', 'Send to Lead', 'Save Template'];
    if (msg.includes('performance')) return ['View Report', 'Export Data', 'Set Goals'];
    if (msg.includes('lead')) return ['Call Lead', 'Send Email', 'Schedule Meeting'];
    if (msg.includes('meeting')) return ['Use Template', 'Save Template', 'Share'];
    return ['Learn More', 'Get Help', 'Try Example'];
  }

  getFallbackResponse(userMessage, context) {
    // Fallback responses when API is not available
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('email')) {
      return {
        type: 'email',
        content: `Here's a professional email template:\n\nSubject: Following up on our conversation\n\nDear [Client Name],\n\nThank you for your time yesterday. Based on our discussion, I believe our CRM solution can help you achieve your business goals.\n\nI've prepared a customized proposal that addresses your specific needs. Would you be available for a brief call this week to discuss the next steps?\n\nBest regards,\n${context.currentUser?.name || '[Your Name]'}`,
        actions: ['Copy Email', 'Send to Lead', 'Save Template']
      };
    }

    if (msg.includes('performance') || msg.includes('analytics')) {
      const leads = context.crmData?.leads || [];
      return {
        type: 'analysis',
        content: `📊 Performance Summary:\n\n• Total Leads: ${leads.length}\n• Active Pipeline: ${leads.filter(l => l.status !== 'closed').length}\n• Conversion Rate: ${leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0}%\n\nRecommendation: Focus on following up with contacted leads to improve conversion.`,
        actions: ['View Report', 'Export Data', 'Set Goals']
      };
    }

    return {
      type: 'general',
      content: `I understand you're asking about "${userMessage}". Here's how I can help:\n\n• Generate professional emails\n• Analyze sales performance\n• Prioritize leads\n• Create meeting templates\n• Provide business insights\n\nNote: Connect an AI API key for enhanced responses!`,
      actions: ['Learn More', 'Get Help', 'Setup API']
    };
  }
}

const aiService = new AIService();
export default aiService;