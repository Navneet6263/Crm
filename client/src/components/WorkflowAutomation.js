import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Mail, 
  Phone, 
  Calendar,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Edit,
  Trash2
} from 'lucide-react';
import { showToast } from './ToastNotification';

const WorkflowAutomation = ({ darkMode, currentUser, crmData }) => {
  const [workflows, setWorkflows] = useState([]);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [automationStats, setAutomationStats] = useState({});

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: 'new_lead',
    conditions: [],
    actions: [],
    isActive: true
  });

  useEffect(() => {
    // Initialize with sample workflows
    const sampleWorkflows = [
      {
        id: 1,
        name: 'New Lead Welcome Sequence',
        description: 'Automatically send welcome email and assign to sales rep when new lead is created',
        trigger: 'new_lead',
        conditions: [
          { type: 'lead_source', operator: 'equals', value: 'website' }
        ],
        actions: [
          { type: 'send_email', template: 'welcome_email', delay: 0 },
          { type: 'assign_to', user: 'sales_rep', delay: 5 },
          { type: 'create_task', title: 'Follow up with new lead', delay: 60 }
        ],
        isActive: true,
        createdBy: 'Navneet Kumar',
        createdDate: new Date().toISOString(),
        executionCount: 45,
        successRate: 98
      },
      {
        id: 2,
        name: 'Follow-up Reminder System',
        description: 'Send reminder emails and create tasks for leads not contacted in 3 days',
        trigger: 'time_based',
        conditions: [
          { type: 'days_since_created', operator: 'greater_than', value: 3 },
          { type: 'status', operator: 'equals', value: 'new' }
        ],
        actions: [
          { type: 'send_email', template: 'follow_up_reminder', delay: 0 },
          { type: 'create_task', title: 'Urgent: Follow up with lead', delay: 0 },
          { type: 'notify_manager', message: 'Lead requires attention', delay: 1440 }
        ],
        isActive: true,
        createdBy: 'Sales Manager',
        createdDate: new Date().toISOString(),
        executionCount: 23,
        successRate: 87
      },
      {
        id: 3,
        name: 'High-Value Lead Alert',
        description: 'Immediately notify sales manager for leads with value > ₹10L',
        trigger: 'lead_updated',
        conditions: [
          { type: 'estimated_value', operator: 'greater_than', value: 1000000 }
        ],
        actions: [
          { type: 'notify_manager', message: 'High-value lead detected', delay: 0 },
          { type: 'assign_to', user: 'senior_sales', delay: 0 },
          { type: 'schedule_call', duration: 30, delay: 60 }
        ],
        isActive: true,
        createdBy: 'Admin User',
        createdDate: new Date().toISOString(),
        executionCount: 8,
        successRate: 100
      }
    ];

    setWorkflows(sampleWorkflows);
    
    // Calculate automation stats
    const stats = {
      totalWorkflows: sampleWorkflows.length,
      activeWorkflows: sampleWorkflows.filter(w => w.isActive).length,
      totalExecutions: sampleWorkflows.reduce((sum, w) => sum + w.executionCount, 0),
      avgSuccessRate: Math.round(sampleWorkflows.reduce((sum, w) => sum + w.successRate, 0) / sampleWorkflows.length)
    };
    setAutomationStats(stats);
  }, []);

  const triggerOptions = [
    { value: 'new_lead', label: 'New Lead Created', icon: Users },
    { value: 'lead_updated', label: 'Lead Updated', icon: Edit },
    { value: 'status_changed', label: 'Status Changed', icon: Target },
    { value: 'time_based', label: 'Time-based', icon: Clock },
    { value: 'email_opened', label: 'Email Opened', icon: Mail }
  ];

  const actionOptions = [
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'create_task', label: 'Create Task', icon: CheckCircle },
    { value: 'assign_to', label: 'Assign to User', icon: Users },
    { value: 'schedule_call', label: 'Schedule Call', icon: Phone },
    { value: 'notify_manager', label: 'Notify Manager', icon: AlertTriangle },
    { value: 'update_status', label: 'Update Status', icon: Target }
  ];

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name.trim()) {
      showToast('error', '❌ Workflow name is required');
      return;
    }

    const workflow = {
      id: Date.now(),
      ...newWorkflow,
      createdBy: currentUser?.name || 'Unknown',
      createdDate: new Date().toISOString(),
      executionCount: 0,
      successRate: 100
    };

    setWorkflows([...workflows, workflow]);
    setNewWorkflow({
      name: '',
      description: '',
      trigger: 'new_lead',
      conditions: [],
      actions: [],
      isActive: true
    });
    setShowCreateWorkflow(false);
    showToast('success', '✅ Workflow created successfully!');
  };

  const toggleWorkflow = (workflowId) => {
    setWorkflows(workflows.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, isActive: !workflow.isActive }
        : workflow
    ));
    
    const workflow = workflows.find(w => w.id === workflowId);
    showToast('success', `${workflow.isActive ? '⏸️ Workflow paused' : '▶️ Workflow activated'}`);
  };

  const deleteWorkflow = (workflowId) => {
    setWorkflows(workflows.filter(w => w.id !== workflowId));
    showToast('success', '🗑️ Workflow deleted successfully');
  };

  const executeWorkflow = (workflowId) => {
    const workflow = workflows.find(w => w.id === workflowId);
    showToast('info', `🚀 Executing workflow: ${workflow.name}`);
    
    // Simulate workflow execution
    setTimeout(() => {
      setWorkflows(workflows.map(w => 
        w.id === workflowId 
          ? { ...w, executionCount: w.executionCount + 1 }
          : w
      ));
      showToast('success', '✅ Workflow executed successfully!');
    }, 2000);
  };

  const getActionIcon = (actionType) => {
    const action = actionOptions.find(a => a.value === actionType);
    return action ? action.icon : CheckCircle;
  };

  const getTriggerIcon = (triggerType) => {
    const trigger = triggerOptions.find(t => t.value === triggerType);
    return trigger ? trigger.icon : Zap;
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
            <Zap style={{ color: '#f59e0b' }} size={32} />
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Workflow Automation
              </h1>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
                Automate repetitive tasks and streamline your sales process
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateWorkflow(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
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
            Create Workflow
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
            label: 'Total Workflows', 
            value: automationStats.totalWorkflows || 0,
            icon: Zap, 
            color: '#f59e0b' 
          },
          { 
            label: 'Active Workflows', 
            value: automationStats.activeWorkflows || 0,
            icon: Play, 
            color: '#22c55e' 
          },
          { 
            label: 'Total Executions', 
            value: automationStats.totalExecutions || 0,
            icon: Target, 
            color: '#3b82f6' 
          },
          { 
            label: 'Success Rate', 
            value: `${automationStats.avgSuccessRate || 0}%`,
            icon: CheckCircle, 
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

      {/* Workflows List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        {workflows.map(workflow => {
          const TriggerIcon = getTriggerIcon(workflow.trigger);
          
          return (
            <div key={workflow.id} style={{ ...cardStyle, padding: '1.5rem' }}>
              {/* Workflow Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <TriggerIcon size={20} style={{ color: '#f59e0b' }} />
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: darkMode ? 'white' : '#1f2937',
                      margin: 0
                    }}>
                      {workflow.name}
                    </h3>
                  </div>
                  <p style={{
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: '0.875rem',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    {workflow.description}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  background: workflow.isActive ? '#dcfce7' : '#fee2e2',
                  border: `1px solid ${workflow.isActive ? '#22c55e' : '#ef4444'}`
                }}>
                  {workflow.isActive ? (
                    <Play size={14} style={{ color: '#22c55e' }} />
                  ) : (
                    <Pause size={14} style={{ color: '#ef4444' }} />
                  )}
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: workflow.isActive ? '#166534' : '#dc2626'
                  }}>
                    {workflow.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>

              {/* Workflow Flow */}
              <div style={{
                background: darkMode ? '#374151' : '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  Workflow Steps:
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Trigger */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: darkMode ? '#4b5563' : '#e5e7eb',
                    borderRadius: '6px'
                  }}>
                    <TriggerIcon size={16} style={{ color: '#f59e0b' }} />
                    <span style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}>
                      Trigger: {triggerOptions.find(t => t.value === workflow.trigger)?.label}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  {workflow.actions.slice(0, 3).map((action, index) => {
                    const ActionIcon = getActionIcon(action.type);
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        background: darkMode ? '#4b5563' : '#e5e7eb',
                        borderRadius: '6px'
                      }}>
                        <ArrowRight size={12} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                        <ActionIcon size={16} style={{ color: '#22c55e' }} />
                        <span style={{
                          fontSize: '0.75rem',
                          color: darkMode ? '#d1d5db' : '#374151'
                        }}>
                          {actionOptions.find(a => a.value === action.type)?.label}
                          {action.delay > 0 && ` (${action.delay}min delay)`}
                        </span>
                      </div>
                    );
                  })}
                  
                  {workflow.actions.length > 3 && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      textAlign: 'center',
                      padding: '0.5rem'
                    }}>
                      +{workflow.actions.length - 3} more actions
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: 0
                  }}>
                    {workflow.executionCount}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    margin: 0
                  }}>
                    Executions
                  </p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#22c55e',
                    margin: 0
                  }}>
                    {workflow.successRate}%
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    margin: 0
                  }}>
                    Success Rate
                  </p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: 0
                  }}>
                    {workflow.actions.length}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    margin: 0
                  }}>
                    Actions
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'space-between'
              }}>
                <button
                  onClick={() => toggleWorkflow(workflow.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: workflow.isActive ? '#fee2e2' : '#dcfce7',
                    color: workflow.isActive ? '#dc2626' : '#166534',
                    border: `1px solid ${workflow.isActive ? '#ef4444' : '#22c55e'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {workflow.isActive ? <Pause size={14} /> : <Play size={14} />}
                  {workflow.isActive ? 'Pause' : 'Activate'}
                </button>
                
                <button
                  onClick={() => executeWorkflow(workflow.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Zap size={14} />
                  Test Run
                </button>
                
                <button
                  style={{
                    padding: '0.5rem',
                    background: darkMode ? '#374151' : '#f3f4f6',
                    color: darkMode ? '#d1d5db' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  title="Edit"
                >
                  <Edit size={14} />
                </button>
                
                <button
                  onClick={() => deleteWorkflow(workflow.id)}
                  style={{
                    padding: '0.5rem',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Workflow Modal */}
      {showCreateWorkflow && (
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
            maxHeight: '90vh',
            overflow: 'auto',
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
                Create New Workflow
              </h3>
              <button
                onClick={() => setShowCreateWorkflow(false)}
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
                    Workflow Name *
                  </label>
                  <input
                    type="text"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                    placeholder="Enter workflow name"
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
                    Description
                  </label>
                  <textarea
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                    placeholder="Describe what this workflow does"
                    rows="3"
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

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Trigger Event
                  </label>
                  <select
                    value={newWorkflow.trigger}
                    onChange={(e) => setNewWorkflow({...newWorkflow, trigger: e.target.value})}
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
                    {triggerOptions.map(trigger => (
                      <option key={trigger.value} value={trigger.value}>
                        {trigger.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{
                  background: darkMode ? '#374151' : '#f9fafb',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    margin: 0
                  }}>
                    💡 Advanced workflow builder with conditions and multiple actions will be available in the full version.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <button
                  onClick={() => setShowCreateWorkflow(false)}
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
                  onClick={handleCreateWorkflow}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Zap size={16} />
                  Create Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowAutomation;