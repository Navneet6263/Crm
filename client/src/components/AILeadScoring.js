import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, Target, AlertCircle, Clock } from 'lucide-react';
import apiService from '../services/apiService';

const AILeadScoring = ({ leads = [], darkMode }) => {
  const [scoredLeads, setScoredLeads] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // AI Scoring Algorithm
  const calculateAIScore = (lead) => {
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

    // Normalize score to 0-100
    const finalScore = Math.min(100, Math.max(0, score));
    
    return {
      score: finalScore,
      factors,
      priority: finalScore >= 70 ? 'High' : finalScore >= 40 ? 'Medium' : 'Low',
      recommendation: getRecommendation(finalScore)
    };
  };

  const getRecommendation = (score) => {
    if (score >= 80) {
      return {
        action: 'Immediate Follow-up',
        message: 'High-priority lead! Contact within 24 hours.',
        icon: Zap,
        color: '#22c55e'
      };
    } else if (score >= 60) {
      return {
        action: 'Schedule Follow-up',
        message: 'Good potential. Follow up within 3 days.',
        icon: Clock,
        color: '#f59e0b'
      };
    } else {
      return {
        action: 'Nurture Campaign',
        message: 'Add to nurture sequence for future engagement.',
        icon: Target,
        color: '#6b7280'
      };
    }
  };

  // const analyzeLeads = async () => {
  //   setIsAnalyzing(true);
  //   
  //   try {
  //     // Try backend AI analysis first
  //     const aiData = await apiService.getAILeadScoring();
  //     if (aiData.success && aiData.scoredLeads) {
  //       setScoredLeads(aiData.scoredLeads);
  //       setIsAnalyzing(false);
  //       return;
  //     }
  //   } catch (error) {
  //     console.log('Using local AI analysis');
  //   }
  //   
  //   // Fallback to local analysis
  //   await new Promise(resolve => setTimeout(resolve, 1000));
  //   
  //   const analyzed = leads.map(lead => {
  //     const aiAnalysis = calculateAIScore(lead);
  //     return {
  //       ...lead,
  //       aiAnalysis: aiAnalysis || {
  //         score: 0,
  //         factors: [],
  //         priority: 'Low',
  //         recommendation: {
  //           action: 'Review Required',
  //           message: 'Lead needs manual review.',
  //           icon: AlertCircle,
  //           color: '#6b7280'
  //         }
  //       }
  //     };
  //   });
  //   
  //   analyzed.sort((a, b) => (b.aiAnalysis?.score || 0) - (a.aiAnalysis?.score || 0));
  //   setScoredLeads(analyzed);
  //   setIsAnalyzing(false);
  // };

  useEffect(() => {
    const initializeComponent = async () => {
      setIsLoading(true);
      try {
        if (!leads || leads.length === 0) {
          setScoredLeads([]);
          setIsLoading(false);
          return;
        }

        // Try to get AI scoring from backend first
        try {
          const aiData = await apiService.getAILeadScoring();
          if (aiData.success && aiData.scoredLeads && aiData.scoredLeads.length > 0) {
            setScoredLeads(aiData.scoredLeads);
            setIsLoading(false);
            return;
          }
        } catch (backendError) {
          console.log('AI backend not available, using local analysis');
        }

        // Fallback to local analysis
        const analyzed = leads.map(lead => {
          const aiAnalysis = calculateAIScore(lead);
          return {
            ...lead,
            aiAnalysis: aiAnalysis || {
              score: 0,
              factors: [],
              priority: 'Low',
              recommendation: {
                action: 'Review Required',
                message: 'Lead needs manual review.',
                icon: AlertCircle,
                color: '#6b7280'
              }
            }
          };
        });
        analyzed.sort((a, b) => (b.aiAnalysis?.score || 0) - (a.aiAnalysis?.score || 0));
        setScoredLeads(analyzed);
      } catch (error) {
        console.error('Error in AI Lead Scoring:', error);
        setScoredLeads([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeComponent();
  }, [leads]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return { bg: '#dcfce7', text: '#166534', border: '#22c55e' };
      case 'Medium': return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' };
      case 'Low': return { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' };
      default: return { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' };
    }
  };

  const containerStyle = {
    padding: '2rem',
    background: darkMode ? '#111827' : '#f9fafb',
    minHeight: '100vh'
  };

  const cardStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
  };

  // Show loading state initially
  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, padding: '3rem', textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Loading AI Lead Scoring...
          </h3>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            Initializing AI analysis engine
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

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
              AI Lead Scoring
            </h1>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
              Intelligent lead prioritization powered by machine learning
            </p>
          </div>
        </div>
      </div>

      {/* AI Analysis Status */}
      {isAnalyzing && (
        <div style={{ ...cardStyle, padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            AI is Analyzing Your Leads...
          </h3>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            Processing {leads.length} leads with advanced scoring algorithms
          </p>
        </div>
      )}

      {/* No Leads Message */}
      {!isAnalyzing && (!leads || leads.length === 0) && (
        <div style={{ ...cardStyle, padding: '3rem', textAlign: 'center' }}>
          <Brain size={64} style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem' }} />
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            No Leads to Analyze
          </h3>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1.5rem' }}>
            Add some leads to see AI-powered scoring and recommendations
          </p>
          <div style={{
            padding: '1rem',
            background: darkMode ? '#374151' : '#f3f4f6',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: darkMode ? '#d1d5db' : '#374151'
          }}>
            💡 <strong>Tip:</strong> Once you have leads, our AI will analyze factors like company size, industry, lead source, engagement level, and recency to provide intelligent scoring and recommendations.
          </div>
        </div>
      )}

      {/* Scored Leads */}
      {!isAnalyzing && scoredLeads.length > 0 && (
        <>
          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {[
              { 
                label: 'High Priority', 
                value: scoredLeads.filter(l => l.aiAnalysis?.priority === 'High').length,
                icon: Zap, 
                color: '#22c55e' 
              },
              { 
                label: 'Medium Priority', 
                value: scoredLeads.filter(l => l.aiAnalysis?.priority === 'Medium').length,
                icon: Target, 
                color: '#f59e0b' 
              },
              { 
                label: 'Low Priority', 
                value: scoredLeads.filter(l => l.aiAnalysis?.priority === 'Low').length,
                icon: Clock, 
                color: '#ef4444' 
              },
              { 
                label: 'Avg Score', 
                value: Math.round(scoredLeads.reduce((sum, l) => sum + (l.aiAnalysis?.score || 0), 0) / scoredLeads.length),
                icon: TrendingUp, 
                color: '#8b5cf6' 
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} style={{ ...cardStyle, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        {stat.label}
                      </p>
                      <p style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: darkMode ? 'white' : '#1f2937'
                      }}>
                        {stat.value}
                      </p>
                    </div>
                    <Icon style={{ color: stat.color }} size={28} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leads List */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '1.5rem'
          }}>
            {scoredLeads.map(lead => {
              const analysis = lead.aiAnalysis || {
                score: 0,
                factors: [],
                priority: 'Low',
                recommendation: {
                  action: 'Review Required',
                  message: 'Lead needs manual review.',
                  icon: 'AlertCircle',
                  color: '#6b7280'
                }
              };
              const priorityColor = getPriorityColor(analysis.priority);
              const RecommendationIcon = analysis.recommendation.icon === 'Zap' ? Zap : 
                                       analysis.recommendation.icon === 'Clock' ? Clock : 
                                       analysis.recommendation.icon === 'Target' ? Target : AlertCircle;
              
              return (
                <div key={lead._id || lead.id} style={{ ...cardStyle, padding: '1.5rem' }}>
                  {/* Lead Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: darkMode ? 'white' : '#1f2937',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {lead.companyName || lead.company || 'Unknown Company'}
                      </h3>
                      <p style={{
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        fontSize: '0.875rem',
                        margin: 0
                      }}>
                        {lead.contactPerson || lead.name || 'Unknown Contact'}
                      </p>
                    </div>
                    
                    {/* AI Score */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: `conic-gradient(${getScoreColor(analysis.score || 0)} ${(analysis.score || 0) * 3.6}deg, ${darkMode ? '#374151' : '#e5e7eb'} 0deg)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: darkMode ? '#1f2937' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: getScoreColor(analysis.score || 0)
                      }}>
                        {analysis.score || 0}
                      </div>
                    </div>
                  </div>

                  {/* Priority Badge */}
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: priorityColor.bg,
                      color: priorityColor.text,
                      border: `1px solid ${priorityColor.border}`
                    }}>
                      {analysis.priority || 'Low'} Priority
                    </span>
                  </div>

                  {/* AI Recommendation */}
                  <div style={{
                    background: darkMode ? '#374151' : '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <RecommendationIcon 
                        size={16} 
                        style={{ color: analysis.recommendation.color }} 
                      />
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: analysis.recommendation?.color || '#6b7280'
                      }}>
                        {analysis.recommendation?.action || 'Review Required'}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#d1d5db' : '#374151',
                      margin: 0
                    }}>
                      {analysis.recommendation?.message || 'Lead needs manual review.'}
                    </p>
                  </div>

                  {/* Scoring Factors */}
                  <div>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? 'white' : '#1f2937',
                      marginBottom: '0.5rem'
                    }}>
                      Scoring Factors:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {(analysis.factors || []).slice(0, 3).map((factor, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            fontSize: '0.75rem',
                            color: darkMode ? '#9ca3af' : '#6b7280'
                          }}>
                            {factor.factor || 'Unknown Factor'}
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: factor.color || '#6b7280'
                          }}>
                            {factor.impact || '+0'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AILeadScoring;