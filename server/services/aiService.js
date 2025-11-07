const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.AI_API_KEY;
    this.apiName = process.env.AI_API_NAME;
    this.apiUrl = process.env.AI_API_URL;
    this.model = process.env.AI_MODEL;
  }

  async generateLeadInsights(leads) {
    try {
      const prompt = `Analyze these leads and provide insights: ${JSON.stringify(leads.slice(0, 10))}`;
      
      const response = await axios.post(`${this.apiUrl}/chat/completions`, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are NavneetCrm AI assistant. Analyze CRM data and provide actionable business insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      return 'AI analysis temporarily unavailable. Please try again later.';
    }
  }

  async scoreLeads(leads) {
    try {
      const scores = leads.map(lead => {
        let score = 0;
        let factors = [];
        
        // Email quality (20 points)
        if (lead.email && lead.email.includes('@')) {
          score += 20;
          factors.push({ factor: 'Valid Email', impact: '+20', color: '#22c55e' });
        }
        
        // Phone number (15 points)
        if (lead.phone && lead.phone.length >= 10) {
          score += 15;
          factors.push({ factor: 'Phone Available', impact: '+15', color: '#22c55e' });
        }
        
        // Company information (25 points)
        if (lead.companyName && lead.companyName.trim()) {
          score += 25;
          factors.push({ factor: 'Company Info', impact: '+25', color: '#22c55e' });
        }
        
        // Source quality (20 points)
        const highValueSources = ['website', 'referral', 'linkedin', 'social media'];
        if (lead.leadSource && highValueSources.includes(lead.leadSource.toLowerCase())) {
          score += 20;
          factors.push({ factor: 'High-Value Source', impact: '+20', color: '#22c55e' });
        } else if (lead.leadSource) {
          score += 10;
          factors.push({ factor: 'Standard Source', impact: '+10', color: '#f59e0b' });
        }
        
        // Status engagement (20 points max)
        if (lead.status === 'qualified') {
          score += 20;
          factors.push({ factor: 'Qualified Lead', impact: '+20', color: '#22c55e' });
        } else if (lead.status === 'contacted') {
          score += 15;
          factors.push({ factor: 'Contacted', impact: '+15', color: '#f59e0b' });
        } else if (lead.status === 'assigned') {
          score += 10;
          factors.push({ factor: 'Assigned', impact: '+10', color: '#f59e0b' });
        } else if (lead.status === 'new') {
          score += 5;
          factors.push({ factor: 'New Lead', impact: '+5', color: '#6b7280' });
        }
        
        // Industry bonus (15 points)
        const highValueIndustries = ['technology', 'finance', 'healthcare', 'software', 'it services'];
        if (lead.industry && highValueIndustries.includes(lead.industry.toLowerCase())) {
          score += 15;
          factors.push({ factor: 'High-Value Industry', impact: '+15', color: '#22c55e' });
        } else if (lead.industry) {
          score += 5;
          factors.push({ factor: 'Industry Info', impact: '+5', color: '#f59e0b' });
        }
        
        // Estimated value bonus (20 points max)
        if (lead.estimatedValue > 100000) {
          score += 20;
          factors.push({ factor: 'High Value Deal', impact: '+20', color: '#22c55e' });
        } else if (lead.estimatedValue > 50000) {
          score += 15;
          factors.push({ factor: 'Medium Value Deal', impact: '+15', color: '#f59e0b' });
        } else if (lead.estimatedValue > 10000) {
          score += 10;
          factors.push({ factor: 'Standard Deal', impact: '+10', color: '#f59e0b' });
        }
        
        // Recency bonus (10 points)
        const createdDate = new Date(lead.createdAt || lead.createdDate || Date.now());
        const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreated <= 1) {
          score += 10;
          factors.push({ factor: 'Fresh Lead (Today)', impact: '+10', color: '#22c55e' });
        } else if (daysSinceCreated <= 7) {
          score += 5;
          factors.push({ factor: 'Recent Lead', impact: '+5', color: '#f59e0b' });
        }
        
        const finalScore = Math.min(score, 100);
        const priority = finalScore >= 70 ? 'High' : finalScore >= 40 ? 'Medium' : 'Low';
        
        return {
          ...lead._doc || lead,
          aiAnalysis: {
            score: finalScore,
            factors,
            priority,
            recommendation: this.getRecommendation(finalScore)
          }
        };
      });

      return scores;
    } catch (error) {
      console.error('Lead scoring error:', error);
      return leads.map(lead => ({
        ...lead._doc || lead,
        aiAnalysis: {
          score: 0,
          factors: [{ factor: 'Scoring Error', impact: '+0', color: '#ef4444' }],
          priority: 'Low',
          recommendation: this.getRecommendation(0)
        }
      }));
    }
  }

  async generateSalesInsights(salesData) {
    try {
      const insights = {
        totalRevenue: salesData.reduce((sum, sale) => sum + (parseFloat(sale.value) || 0), 0),
        averageDealSize: salesData.length > 0 ? salesData.reduce((sum, sale) => sum + (parseFloat(sale.value) || 0), 0) / salesData.length : 0,
        conversionRate: salesData.filter(sale => sale.status === 'closed').length / salesData.length * 100,
        topPerformers: this.getTopPerformers(salesData),
        recommendations: this.generateRecommendations(salesData)
      };

      return insights;
    } catch (error) {
      console.error('Sales insights error:', error);
      return null;
    }
  }

  getTopPerformers(salesData) {
    const performers = {};
    salesData.forEach(sale => {
      if (sale.assignedTo) {
        if (!performers[sale.assignedTo]) {
          performers[sale.assignedTo] = { deals: 0, revenue: 0 };
        }
        performers[sale.assignedTo].deals++;
        performers[sale.assignedTo].revenue += parseFloat(sale.value) || 0;
      }
    });

    return Object.entries(performers)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([name, stats]) => ({ name, ...stats }));
  }

  getRecommendation(score) {
    if (score >= 70) {
      return {
        action: 'Immediate Follow-up',
        message: 'High-priority lead! Contact within 24 hours.',
        icon: 'Zap',
        color: '#22c55e'
      };
    } else if (score >= 40) {
      return {
        action: 'Schedule Follow-up',
        message: 'Good potential. Follow up within 3 days.',
        icon: 'Clock',
        color: '#f59e0b'
      };
    } else {
      return {
        action: 'Nurture Campaign',
        message: 'Add to nurture sequence for future engagement.',
        icon: 'Target',
        color: '#6b7280'
      };
    }
  }

  generateRecommendations(salesData) {
    const recommendations = [];
    
    const conversionRate = salesData.filter(sale => sale.status === 'closed').length / salesData.length * 100;
    if (conversionRate < 20) {
      recommendations.push('Focus on lead qualification to improve conversion rates');
    }
    
    const avgDealSize = salesData.reduce((sum, sale) => sum + (parseFloat(sale.value) || 0), 0) / salesData.length;
    if (avgDealSize < 10000) {
      recommendations.push('Consider targeting larger enterprise clients');
    }
    
    recommendations.push('Implement follow-up automation for better engagement');
    
    return recommendations;
  }
}

module.exports = new AIService();