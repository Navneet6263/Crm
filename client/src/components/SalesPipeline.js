import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Target, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  User, 
  Building, 
  Clock,
  TrendingUp,
  Plus,
  Filter,
  Search
} from 'lucide-react';

const SalesPipeline = ({ darkMode = false, crmData, updateCrmData }) => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  const stages = [
    { id: 'new', title: 'New Leads', color: '#3b82f6', count: 0 },
    { id: 'contacted', title: 'Contacted', color: '#f59e0b', count: 0 },
    { id: 'qualified', title: 'Qualified', color: '#8b5cf6', count: 0 },
    { id: 'proposal', title: 'Proposal', color: '#06b6d4', count: 0 },
    { id: 'negotiation', title: 'Negotiation', color: '#ef4444', count: 0 },
    { id: 'converted', title: 'Won', color: '#22c55e', count: 0 }
  ];

  useEffect(() => {
    if (crmData?.leads) {
      const leadsArray = Array.isArray(crmData.leads) ? crmData.leads : (crmData.leads?.leads || []);
      setLeads(leadsArray.map((lead, index) => ({
        ...lead,
        id: lead.id || lead._id || `lead-${index}`,
        status: lead.leadStatus || lead.status || 'new'
      })));
    }
  }, [crmData]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
      lead.priority === filterBy ||
      lead.assignedTo?.toLowerCase().includes(filterBy.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const getLeadsByStage = (stageId) => {
    return filteredLeads.filter(lead => lead.status === stageId);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const updatedLeads = leads.map(lead => {
      const leadId = lead.id || lead._id;
      return leadId === draggableId 
        ? { ...lead, status: destination.droppableId }
        : lead;
    });

    setLeads(updatedLeads);
    
    // Update parent CRM data
    if (updateCrmData) {
      updateCrmData({ leads: updatedLeads });
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const containerStyle = {
    padding: '2rem',
    background: darkMode ? '#0f172a' : '#f9fafb',
    minHeight: '100vh',
    color: darkMode ? '#f8fafc' : '#1f2937'
  };

  const headerStyle = {
    marginBottom: '2rem'
  };

  const controlsStyle = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap'
  };

  const searchStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: darkMode ? '#1e293b' : 'white',
    borderRadius: '8px',
    border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
    minWidth: '300px'
  };

  const filterStyle = {
    padding: '0.75rem',
    background: darkMode ? '#1e293b' : 'white',
    borderRadius: '8px',
    border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
    color: darkMode ? '#f8fafc' : '#1f2937'
  };

  const pipelineStyle = {
    display: 'flex',
    gap: '1.5rem',
    overflowX: 'auto',
    paddingBottom: '1rem'
  };

  const stageStyle = {
    minWidth: '300px',
    background: darkMode ? '#1e293b' : 'white',
    borderRadius: '12px',
    boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
  };

  const stageHeaderStyle = (color) => ({
    padding: '1rem',
    borderBottom: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: `${color}15`,
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px'
  });

  const leadCardStyle = {
    padding: '1rem',
    margin: '0.5rem',
    background: darkMode ? '#334155' : '#f8fafc',
    borderRadius: '8px',
    border: `1px solid ${darkMode ? '#475569' : '#e5e7eb'}`,
    cursor: 'grab',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <Target style={{ color: '#22c55e' }} size={32} />
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: darkMode ? '#f8fafc' : '#1f2937',
              margin: 0
            }}>
              Sales Pipeline
            </h1>
            <p style={{
              color: darkMode ? '#cbd5e1' : '#6b7280',
              fontSize: '1.125rem',
              margin: 0
            }}>
              Track your deals through every stage
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={controlsStyle}>
        <div style={searchStyle}>
          <Search size={20} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: darkMode ? '#f8fafc' : '#1f2937',
              fontSize: '1rem',
              flex: 1
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={20} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            style={filterStyle}
          >
            <option value="all">All Leads</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {stages.map(stage => {
          const stageLeads = getLeadsByStage(stage.id);
          const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
          
          return (
            <div key={stage.id} style={{
              padding: '1rem',
              background: darkMode ? '#1e293b' : 'white',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: stage.color,
                marginBottom: '0.25rem'
              }}>
                {stageLeads.length}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: darkMode ? '#cbd5e1' : '#6b7280',
                marginBottom: '0.25rem'
              }}>
                {stage.title}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                {formatCurrency(totalValue)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      {leads.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={pipelineStyle}>
          {stages.map(stage => {
            const stageLeads = getLeadsByStage(stage.id);
            
            return (
              <div key={stage.id} style={stageStyle}>
                <div style={stageHeaderStyle(stage.color)}>
                  <div>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: darkMode ? '#f8fafc' : '#1f2937',
                      margin: 0
                    }}>
                      {stage.title}
                    </h3>
                  </div>
                  <div style={{
                    background: stage.color,
                    color: 'white',
                    borderRadius: '12px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {stageLeads.length}
                  </div>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: '400px',
                        padding: '0.5rem',
                        background: snapshot.isDraggingOver 
                          ? (darkMode ? '#374151' : '#f3f4f6')
                          : 'transparent'
                      }}
                    >
                      {stageLeads.map((lead, index) => {
                        const leadId = lead.id || lead._id || `lead-${stage.id}-${index}`;
                        return (
                        <Draggable
                          key={leadId}
                          draggableId={leadId}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...leadCardStyle,
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging 
                                  ? `${provided.draggableProps.style?.transform} rotate(5deg)`
                                  : provided.draggableProps.style?.transform,
                                boxShadow: snapshot.isDragging
                                  ? '0 8px 25px rgba(0, 0, 0, 0.2)'
                                  : 'none'
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '0.75rem'
                              }}>
                                <div>
                                  <h4 style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: darkMode ? '#f8fafc' : '#1f2937',
                                    margin: '0 0 0.25rem 0'
                                  }}>
                                    {lead.contactPerson}
                                  </h4>
                                  <p style={{
                                    fontSize: '0.75rem',
                                    color: darkMode ? '#cbd5e1' : '#6b7280',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}>
                                    <Building size={12} />
                                    {lead.companyName}
                                  </p>
                                </div>
                                <div style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: getPriorityColor(lead.priority)
                                }} />
                              </div>

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.75rem'
                              }}>
                                <DollarSign size={14} style={{ color: '#22c55e' }} />
                                <span style={{
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#22c55e'
                                }}>
                                  {formatCurrency(lead.estimatedValue)}
                                </span>
                              </div>

                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.75rem',
                                color: darkMode ? '#9ca3af' : '#6b7280'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <User size={12} />
                                  {typeof lead.assignedTo === 'object' ? lead.assignedTo?.name || 'Unassigned' : lead.assignedTo || 'Unassigned'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Clock size={12} />
                                  {new Date(lead.createdDate).toLocaleDateString()}
                                </div>
                              </div>

                              <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                marginTop: '0.75rem'
                              }}>
                                <button
                                  onClick={() => window.open(`tel:${lead.phone}`)}
                                  style={{
                                    padding: '0.25rem',
                                    background: '#22c55e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Phone size={12} />
                                </button>
                                <button
                                  onClick={() => window.open(`mailto:${lead.email}`)}
                                  style={{
                                    padding: '0.25rem',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Mail size={12} />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default SalesPipeline;