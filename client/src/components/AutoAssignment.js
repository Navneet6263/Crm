import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Users, 
  Settings, 
  Play, 
  Pause, 
  Plus, 
  Edit, 
  Trash2, 
  Target,
  CheckCircle,
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import { showToast } from './ToastNotification';

const AutoAssignment = ({ crmData, updateCrmData, darkMode = false }) => {
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [assignmentRules, setAssignmentRules] = useState([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'round_robin',
    conditions: [],
    assignTo: '',
    priority: 1,
    active: true
  });

  const predefinedRuleNames = {
    'round_robin': [
      'Round Robin Assignment',
      'Equal Distribution',
      'Fair Share Assignment',
      'Rotation Based Assignment'
    ],
    'load_balance': [
      'Load Balancing',
      'Workload Distribution',
      'Capacity Based Assignment',
      'Smart Load Balancer'
    ],
    'conditional': [
      'High Value Leads',
      'Industry Specific',
      'Priority Based Assignment',
      'Experience Based Assignment',
      'Geographic Assignment',
      'Product Specific Assignment'
    ]
  };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch users from backend
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5004'}/api/auth/users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const usersData = await response.json();
          setUsers(usersData || []);
        }
        
        // Load assignment rules from localStorage or set defaults
        const savedRules = localStorage.getItem('assignmentRules');
        if (savedRules) {
          setAssignmentRules(JSON.parse(savedRules));
        } else {
          const defaultRules = [
            {
              id: 1,
              name: 'Round Robin',
              type: 'round_robin',
              active: true,
              assignedCount: 0,
              createdDate: new Date().toISOString()
            }
          ];
          setAssignmentRules(defaultRules);
          localStorage.setItem('assignmentRules', JSON.stringify(defaultRules));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate current leads for each user from crmData
  const salesTeam = users.map(user => {
    const currentLeads = (crmData.leads || []).filter(lead => 
      lead.assignedTo === user.name || lead.assignedTo === user._id
    ).length;
    
    return {
      id: user._id,
      name: user.name,
      role: user.role,
      currentLeads: currentLeads,
      expertise: [] // Can be enhanced later
    };
  });

  const getNextAssignee = (rule, lead) => {
    switch(rule.type) {
      case 'round_robin':
        const currentIndex = rule.lastAssignedIndex || 0;
        const nextIndex = (currentIndex + 1) % rule.salesTeam.length;
        rule.lastAssignedIndex = nextIndex;
        return rule.salesTeam[nextIndex];
        
      case 'load_balance':
        return salesTeam
          .filter(person => person.currentLeads < rule.maxLeadsPerPerson)
          .sort((a, b) => a.currentLeads - b.currentLeads)[0]?.name;
          
      case 'expertise':
        return rule.assignments[lead.industry] || salesTeam[0].name;
        
      default:
        return salesTeam[0].name;
    }
  };

  const assignLeads = () => {
    const leads = crmData.leads || [];
    const unassignedLeads = leads.filter(lead => !lead.assignedTo);
    const activeRule = assignmentRules.find(rule => rule.active);
    
    if (!activeRule || unassignedLeads.length === 0) {
      alert('No active rules or unassigned leads found');
      return;
    }

    const updatedLeads = leads.map(lead => {
      if (!lead.assignedTo) {
        const assignee = getNextAssignee(activeRule, lead);
        return {
          ...lead,
          assignedTo: assignee,
          assignedDate: new Date().toISOString(),
          assignmentRule: activeRule.name
        };
      }
      return lead;
    });

    updateCrmData({ leads: updatedLeads });
    alert(`${unassignedLeads.length} leads assigned using ${activeRule.name} rule`);
  };

  const toggleRule = (ruleId) => {
    const updatedRules = assignmentRules.map(rule => 
      rule.id === ruleId ? { ...rule, active: !rule.active } : rule
    );
    setAssignmentRules(updatedRules);
    localStorage.setItem('assignmentRules', JSON.stringify(updatedRules));
    showToast('success', '🔄 Rule status updated');
  };

  const handleAddRule = () => {
    if (!newRule.name.trim()) {
      showToast('error', '❌ Please enter rule name');
      return;
    }

    const rule = {
      id: Date.now(),
      ...newRule,
      assignedCount: 0,
      createdDate: new Date().toISOString()
    };

    const updatedRules = [...assignmentRules, rule];
    setAssignmentRules(updatedRules);
    localStorage.setItem('assignmentRules', JSON.stringify(updatedRules));
    
    setNewRule({
      name: '',
      type: 'round_robin',
      conditions: [],
      assignTo: '',
      priority: 1,
      active: true
    });
    setShowAddRule(false);
    showToast('success', '✅ Assignment rule created successfully!');
  };

  const deleteRule = (ruleId) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      const updatedRules = assignmentRules.filter(rule => rule.id !== ruleId);
      setAssignmentRules(updatedRules);
      localStorage.setItem('assignmentRules', JSON.stringify(updatedRules));
      showToast('success', '🗑️ Rule deleted successfully');
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Zap style={{ color: '#8b5cf6' }} size={32} />
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
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setAutoAssignEnabled(!autoAssignEnabled)}
              style={{
                padding: '0.75rem 1.5rem',
                background: autoAssignEnabled 
                  ? 'linear-gradient(135deg, #22c55e, #4ade80)'
                  : 'linear-gradient(135deg, #ef4444, #f87171)',
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
              {autoAssignEnabled ? <Play size={20} /> : <Pause size={20} />}
              {autoAssignEnabled ? 'Enabled' : 'Disabled'}
            </button>
            
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
            value: assignmentRules.filter(r => r.active).length,
            icon: CheckCircle, 
            color: '#22c55e' 
          },
          { 
            label: 'Total Assignments', 
            value: assignmentRules.reduce((sum, r) => sum + (r.assignedCount || 0), 0),
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
            value: Math.round(salesTeam.reduce((sum, m) => sum + m.currentLeads, 0) / salesTeam.length),
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

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={assignLeads}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
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
          <Zap size={20} />
          Assign Unassigned Leads
        </button>
      </div>

      {/* Assignment Rules */}
      <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '2rem' }}>
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
              border: `2px solid ${rule.active ? '#22c55e' : '#6b7280'}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {rule.active ? (
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
                      background: rule.active ? '#22c55e' : '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    {rule.active ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    style={{
                      padding: '0.5rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                fontSize: '0.875rem',
                color: darkMode ? '#d1d5db' : '#374151'
              }}>
                <div>
                  <strong>Type:</strong> {rule.type.replace('_', ' ').toUpperCase()}
                </div>
                <div>
                  <strong>Assigned:</strong> {rule.assignedCount || 0} leads
                </div>
                {rule.assignTo && (
                  <div>
                    <strong>Assigns to:</strong> {rule.assignTo}
                  </div>
                )}
                {rule.priority && (
                  <div>
                    <strong>Priority:</strong> {rule.priority}
                  </div>
                )}
              </div>
              
              {rule.type === 'round_robin' && rule.salesTeam && (
                <div style={{ marginTop: '1rem' }}>
                  <strong style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Team Members:</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {rule.salesTeam.map(member => (
                      <span key={member} style={{
                        padding: '0.25rem 0.75rem',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem'
                      }}>
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {rule.conditions && rule.conditions.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Conditions:</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    {rule.conditions.map((condition, index) => (
                      <div key={index} style={{
                        padding: '0.5rem',
                        background: darkMode ? '#4b5563' : '#e5e7eb',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        marginBottom: '0.25rem'
                      }}>
                        {condition.field} {condition.operator.replace('_', ' ')} {condition.value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Workload */}
      <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: darkMode ? 'white' : '#1f2937',
          marginBottom: '1.5rem'
        }}>
          Team Workload
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {salesTeam.map(member => (
            <div key={member.name} style={{
              background: darkMode ? '#374151' : '#f9fafb',
              padding: '1.5rem',
              borderRadius: '12px',
              border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  margin: '0 0 0.25rem 0'
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
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.875rem', color: darkMode ? '#d1d5db' : '#374151' }}>Workload</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? 'white' : '#1f2937' }}>
                    {member.currentLeads} leads
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
                    width: `${Math.min((member.currentLeads / 20) * 100, 100)}%`,
                    height: '100%',
                    background: member.currentLeads > 15 ? '#ef4444' : member.currentLeads > 10 ? '#f59e0b' : '#22c55e',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
              
              <div>
                <h5 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Expertise:
                </h5>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {member.expertise.map(skill => (
                    <span key={skill} style={{
                      padding: '0.25rem 0.75rem',
                      background: '#8b5cf6',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '0.75rem'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
            maxWidth: '500px',
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
                    Rule Name
                  </label>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <select
                      value={newRule.name}
                      onChange={(e) => setNewRule({...newRule, name: e.target.value})}
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
                      <option value="">Select a rule name...</option>
                      {predefinedRuleNames[newRule.type]?.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newRule.name}
                      onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                      placeholder="Or enter custom rule name..."
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
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Rule Type
                  </label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule({...newRule, type: e.target.value, name: ''})}
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
                    <option value="round_robin">Round Robin - Equal distribution among team</option>
                    <option value="load_balance">Load Balance - Assign to least busy member</option>
                    <option value="conditional">Conditional - Assign based on conditions</option>
                  </select>
                </div>
                
                {newRule.type === 'conditional' && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Assign To
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
                      {users.map(user => (
                        <option key={user._id} value={user.name}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <button
                  onClick={() => setShowAddRule(false)}
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
                  onClick={handleAddRule}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
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

export default AutoAssignment;