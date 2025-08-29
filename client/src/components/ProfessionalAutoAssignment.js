import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Save
} from 'lucide-react';
import { showToast } from './ToastNotification';

const ProfessionalAutoAssignment = ({ darkMode, crmData, updateCrmData }) => {
  const [assignmentRules, setAssignmentRules] = useState([]);
  const [showAddRule, setShowAddRule] = useState(false);

  const [newRule, setNewRule] = useState({
    name: '',
    conditions: [],
    assignTo: '',
    priority: 1,
    isActive: true
  });

  const salesTeam = [
    { id: 1, name: 'Navneet Kumar', role: 'Senior Sales Rep', workload: 15 },
    { id: 2, name: 'Sales Manager', role: 'Sales Manager', workload: 8 },
    { id: 3, name: 'Junior Sales Rep', role: 'Sales Rep', workload: 12 },
    { id: 4, name: 'Senior Sales Rep', role: 'Senior Sales Rep', workload: 18 }
  ];

  useEffect(() => {
    const sampleRules = [
      {
        id: 1,
        name: 'High Value Leads',
        conditions: [
          { field: 'estimatedValue', operator: 'greater_than', value: 500000 }
        ],
        assignTo: 'Navneet Kumar',
        priority: 1,
        isActive: true,
        assignedCount: 12,
        createdDate: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Technology Industry',
        conditions: [
          { field: 'industry', operator: 'equals', value: 'Technology' }
        ],
        assignTo: 'Senior Sales Rep',
        priority: 2,
        isActive: true,
        assignedCount: 8,
        createdDate: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Website Leads',
        conditions: [
          { field: 'leadSource', operator: 'equals', value: 'Website' }
        ],
        assignTo: 'Sales Manager',
        priority: 3,
        isActive: false,
        assignedCount: 5,
        createdDate: new Date().toISOString()
      }
    ];
    setAssignmentRules(sampleRules);
  }, []);

  const handleAddRule = () => {
    if (!newRule.name.trim() || !newRule.assignTo) {
      showToast('error', '❌ Please fill all required fields');
      return;
    }

    const rule = {
      id: Date.now(),
      ...newRule,
      assignedCount: 0,
      createdDate: new Date().toISOString()
    };

    setAssignmentRules([...assignmentRules, rule]);
    setNewRule({
      name: '',
      conditions: [],
      assignTo: '',
      priority: 1,
      isActive: true
    });
    setShowAddRule(false);
    showToast('success', '✅ Assignment rule created successfully!');
  };

  const toggleRule = (ruleId) => {
    setAssignmentRules(rules => rules.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
    showToast('success', '🔄 Rule status updated');
  };

  const deleteRule = (ruleId) => {
    setAssignmentRules(rules => rules.filter(rule => rule.id !== ruleId));
    showToast('success', '🗑️ Rule deleted successfully');
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Users style={{ color: '#8b5cf6' }} size={32} />
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Auto Assignment
              </h1>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
                Automatically assign leads to sales team members based on rules
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddRule(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            <Plus size={20} />
            Add Rule
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          { 
            label: 'Active Rules', 
            value: assignmentRules.filter(r => r.isActive).length,
            icon: CheckCircle, 
            color: '#22c55e' 
          },
          { 
            label: 'Total Assignments', 
            value: assignmentRules.reduce((sum, r) => sum + r.assignedCount, 0),
            icon: Target, 
            color: '#3b82f6' 
          },
          { 
            label: 'Team Members', 
            value: salesTeam.length,
            icon: Users, 
            color: '#f59e0b' 
          },
          { 
            label: 'Avg Workload', 
            value: Math.round(salesTeam.reduce((sum, m) => sum + m.workload, 0) / salesTeam.length),
            icon: Zap, 
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem'
      }}>
        {/* Assignment Rules */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '1.5rem'
          }}>
            Assignment Rules
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignmentRules.map(rule => (
              <div key={rule.id} style={{
                background: darkMode ? '#374151' : '#f9fafb',
                padding: '1.5rem',
                borderRadius: '12px',
                border: `2px solid ${rule.isActive ? '#22c55e' : '#6b7280'}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {rule.isActive ? (
                      <CheckCircle size={20} style={{ color: '#22c55e' }} />
                    ) : (
                      <AlertCircle size={20} style={{ color: '#6b7280' }} />
                    )}
                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: darkMode ? 'white' : '#1f2937',
                      margin: 0
                    }}>
                      {rule.name}
                    </h4>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => toggleRule(rule.id)}
                      style={{
                        padding: '0.5rem',
                        background: rule.isActive ? '#fee2e2' : '#dcfce7',
                        color: rule.isActive ? '#dc2626' : '#166534',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title={rule.isActive ? 'Pause Rule' : 'Activate Rule'}
                    >
                      {rule.isActive ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    
                    <button
                      style={{
                        padding: '0.5rem',
                        background: darkMode ? '#4b5563' : '#e5e7eb',
                        color: darkMode ? '#d1d5db' : '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Edit Rule"
                    >
                      <Edit size={14} />
                    </button>
                    
                    <button
                      onClick={() => deleteRule(rule.id)}
                      style={{
                        padding: '0.5rem',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Delete Rule"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      Assign To
                    </span>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: darkMode ? 'white' : '#1f2937',
                      margin: 0
                    }}>
                      {rule.assignTo}
                    </p>
                  </div>
                  
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      Priority
                    </span>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: darkMode ? 'white' : '#1f2937',
                      margin: 0
                    }}>
                      {rule.priority}
                    </p>
                  </div>
                  
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      Assigned
                    </span>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#22c55e',
                      margin: 0
                    }}>
                      {rule.assignedCount} leads
                    </p>
                  </div>
                </div>

                <div>
                  <span style={{
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    Conditions
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {rule.conditions.map((condition, index) => (
                      <span key={index} style={{
                        padding: '0.25rem 0.75rem',
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {condition.field} {condition.operator.replace('_', ' ')} {condition.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Workload */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '1.5rem'
          }}>
            Team Workload
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {salesTeam.map(member => (
              <div key={member.id} style={{
                background: darkMode ? '#374151' : '#f9fafb',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <div>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: darkMode ? 'white' : '#1f2937',
                      margin: 0
                    }}>
                      {member.name}
                    </h4>
                    <p style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      margin: 0
                    }}>
                      {member.role}
                    </p>
                  </div>
                  
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: member.workload > 15 ? '#ef4444' : '#22c55e'
                  }}>
                    {member.workload}
                  </span>
                </div>
                
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: darkMode ? '#4b5563' : '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min((member.workload / 20) * 100, 100)}%`,
                    height: '100%',
                    background: member.workload > 15 ? '#ef4444' : '#22c55e',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddRule && (
        <div style={{
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
        }}>
          <div style={{
            background: darkMode ? '#1f2937' : 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '600px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
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
                Create Assignment Rule
              </h3>
              <button
                onClick={() => setShowAddRule(false)}
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

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                    placeholder="Enter rule name"
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
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Assign To *
                  </label>
                  <select
                    value={newRule.assignTo}
                    onChange={(e) => setNewRule({...newRule, assignTo: e.target.value})}
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
                    <option value="">Select team member</option>
                    {salesTeam.map(member => (
                      <option key={member.id} value={member.name}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Priority (1 = Highest)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({...newRule, priority: parseInt(e.target.value)})}
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
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <button
                  onClick={() => setShowAddRule(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: 'transparent',
                    color: darkMode ? '#d1d5db' : '#374151',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRule}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Save size={16} />
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalAutoAssignment;