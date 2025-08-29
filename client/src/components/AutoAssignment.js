import React, { useState } from 'react';
import { Zap, Users, Settings, Play, Pause } from 'lucide-react';

const AutoAssignment = ({ crmData, updateCrmData }) => {
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [assignmentRules, setAssignmentRules] = useState([
    {
      id: 1,
      name: 'Round Robin',
      type: 'round_robin',
      active: true,
      salesTeam: ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Wilson']
    },
    {
      id: 2,
      name: 'Load Balancing',
      type: 'load_balance',
      active: false,
      maxLeadsPerPerson: 10
    },
    {
      id: 3,
      name: 'Industry Expertise',
      type: 'expertise',
      active: false,
      assignments: {
        'Technology': 'John Smith',
        'Healthcare': 'Sarah Johnson',
        'Finance': 'Mike Davis',
        'Manufacturing': 'Lisa Wilson'
      }
    }
  ]);

  const salesTeam = [
    { name: 'John Smith', currentLeads: 8, expertise: ['Technology', 'Software'] },
    { name: 'Sarah Johnson', currentLeads: 6, expertise: ['Healthcare', 'Medical'] },
    { name: 'Mike Davis', currentLeads: 12, expertise: ['Finance', 'Banking'] },
    { name: 'Lisa Wilson', currentLeads: 4, expertise: ['Manufacturing', 'Industrial'] },
    { name: 'Tom Brown', currentLeads: 9, expertise: ['Retail', 'E-commerce'] }
  ];

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
    setAssignmentRules(rules => 
      rules.map(rule => ({
        ...rule,
        active: rule.id === ruleId ? !rule.active : false
      }))
    );
  };

  return (
    <div className="auto-assignment">
      <div className="page-header">
        <h1>Automated Lead Assignment</h1>
        <p>Configure rules for efficient lead distribution</p>
      </div>

      <div className="assignment-controls">
        <div className="auto-toggle">
          <button 
            className={`toggle-btn ${autoAssignEnabled ? 'enabled' : 'disabled'}`}
            onClick={() => setAutoAssignEnabled(!autoAssignEnabled)}
          >
            {autoAssignEnabled ? <Play size={16} /> : <Pause size={16} />}
            Auto Assignment {autoAssignEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <button className="btn-primary" onClick={assignLeads}>
          <Zap size={16} />
          Assign Unassigned Leads
        </button>
      </div>

      <div className="assignment-rules">
        <h3>Assignment Rules</h3>
        <div className="rules-grid">
          {assignmentRules.map(rule => (
            <div key={rule.id} className={`rule-card ${rule.active ? 'active' : ''}`}>
              <div className="rule-header">
                <h4>{rule.name}</h4>
                <button 
                  className={`rule-toggle ${rule.active ? 'active' : ''}`}
                  onClick={() => toggleRule(rule.id)}
                >
                  {rule.active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="rule-description">
                {rule.type === 'round_robin' && (
                  <p>Distributes leads equally among team members in rotation</p>
                )}
                {rule.type === 'load_balance' && (
                  <p>Assigns leads to team members with fewer active leads</p>
                )}
                {rule.type === 'expertise' && (
                  <p>Assigns leads based on industry expertise matching</p>
                )}
              </div>

              {rule.type === 'round_robin' && (
                <div className="rule-config">
                  <h5>Team Members:</h5>
                  <div className="team-list">
                    {rule.salesTeam.map(member => (
                      <span key={member} className="team-member">{member}</span>
                    ))}
                  </div>
                </div>
              )}

              {rule.type === 'load_balance' && (
                <div className="rule-config">
                  <p><strong>Max leads per person:</strong> {rule.maxLeadsPerPerson}</p>
                </div>
              )}

              {rule.type === 'expertise' && (
                <div className="rule-config">
                  <h5>Industry Assignments:</h5>
                  <div className="expertise-mapping">
                    {Object.entries(rule.assignments).map(([industry, assignee]) => (
                      <div key={industry} className="mapping-item">
                        <span className="industry">{industry}</span>
                        <span className="arrow">→</span>
                        <span className="assignee">{assignee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="team-workload">
        <h3>Team Workload</h3>
        <div className="workload-grid">
          {salesTeam.map(member => (
            <div key={member.name} className="workload-card">
              <div className="member-info">
                <h4>{member.name}</h4>
                <div className="workload-bar">
                  <div 
                    className="workload-fill"
                    style={{ width: `${(member.currentLeads / 15) * 100}%` }}
                  ></div>
                </div>
                <span className="workload-count">{member.currentLeads} leads</span>
              </div>
              
              <div className="member-expertise">
                <h5>Expertise:</h5>
                <div className="expertise-tags">
                  {member.expertise.map(skill => (
                    <span key={skill} className="expertise-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="assignment-stats">
        <h3>Assignment Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">
              {(crmData.leads || []).filter(lead => lead.assignedTo).length}
            </div>
            <div className="stat-label">Assigned Leads</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {(crmData.leads || []).filter(lead => !lead.assignedTo).length}
            </div>
            <div className="stat-label">Unassigned Leads</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {Math.round(salesTeam.reduce((sum, member) => sum + member.currentLeads, 0) / salesTeam.length)}
            </div>
            <div className="stat-label">Avg Leads/Person</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {assignmentRules.filter(rule => rule.active).length}
            </div>
            <div className="stat-label">Active Rules</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoAssignment;