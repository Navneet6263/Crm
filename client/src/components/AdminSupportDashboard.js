import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, User, Calendar, Tag } from 'lucide-react';
import supportService from '../services/supportService';

const AdminSupportDashboard = ({ darkMode, currentUser }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  
  // Load tickets from service
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const ticketsData = await supportService.getAllTickets();
        setTickets(ticketsData);
      } catch (error) {
        console.error('Error loading tickets:', error);
      }
    };
    
    loadTickets();
  }, []);
  
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetail(true);
  };
  
  const handleAddResponse = async (ticketId, responseText) => {
    if (!responseText.trim()) return;
    
    try {
      const responseData = {
        text: responseText
      };
      
      const updatedTicket = await supportService.addResponse(ticketId, responseData);
      
      const updatedTickets = tickets.map(ticket => 
        (ticket._id || ticket.id) === ticketId ? updatedTicket : ticket
      );
      
      setTickets(updatedTickets);
      setSelectedTicket(updatedTicket);
    } catch (error) {
      console.error('Error adding response:', error);
      // Fallback to local update
      const updatedTickets = tickets.map(ticket => {
        if ((ticket._id || ticket.id) === ticketId) {
          const newResponse = {
            id: `RES-${Date.now()}`,
            text: responseText,
            createdAt: new Date().toISOString(),
            createdBy: currentUser?.name || 'Support Team',
            isStaff: true
          };
          
          const newStatus = ticket.status === 'open' ? 'in_progress' : ticket.status;
          
          return {
            ...ticket,
            status: newStatus,
            responses: [...(ticket.responses || []), newResponse]
          };
        }
        return ticket;
      });
      
      setTickets(updatedTickets);
      setSelectedTicket(updatedTickets.find(t => (t._id || t.id) === ticketId));
    }
  };
  
  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const updatedTicket = await supportService.updateTicket(ticketId, { status: newStatus });
      
      const updatedTickets = tickets.map(ticket => 
        (ticket._id || ticket.id) === ticketId ? updatedTicket : ticket
      );
      
      setTickets(updatedTickets);
      setSelectedTicket(updatedTicket);
    } catch (error) {
      console.error('Error updating status:', error);
      // Fallback to local update
      const updatedTickets = tickets.map(ticket => {
        if ((ticket._id || ticket.id) === ticketId) {
          return {
            ...ticket,
            status: newStatus
          };
        }
        return ticket;
      });
      
      setTickets(updatedTickets);
      setSelectedTicket(updatedTickets.find(t => (t._id || t.id) === ticketId));
    }
  };
  
  const getStatusIcon = (status, size = 20) => {
    switch(status) {
      case 'open':
        return <Clock size={size} color="#6b7280" />;
      case 'in_progress':
        return <MessageSquare size={size} color="#2563eb" />;
      case 'resolved':
        return <CheckCircle size={size} color="#059669" />;
      default:
        return <AlertCircle size={size} color="#dc2626" />;
    }
  };
  
  return (
    <div style={{
      padding: '1.5rem',
      background: darkMode ? '#111827' : '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: darkMode ? 'white' : '#111827',
          marginBottom: '2rem'
        }}>
          Support Management
        </h1>
        
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {[
            { label: 'Open Tickets', value: tickets.filter(t => t.status === 'open').length, icon: <Clock size={24} />, color: '#6b7280' },
            { label: 'In Progress', value: tickets.filter(t => t.status === 'in_progress').length, icon: <MessageSquare size={24} />, color: '#2563eb' },
            { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, icon: <CheckCircle size={24} />, color: '#059669' },
            { label: 'Total Tickets', value: tickets.length, icon: <AlertCircle size={24} />, color: '#dc2626' }
          ].map((stat, index) => (
            <div key={index} style={{
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
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
                    color: darkMode ? 'white' : '#111827',
                    margin: 0
                  }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{ color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: showTicketDetail ? '1fr 2fr' : '1fr',
          gap: '1.5rem'
        }}>
          {/* Tickets List */}
          <div style={{
            background: darkMode ? '#1f2937' : 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
          }}>
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#111827',
                marginBottom: '1rem'
              }}>
                Support Tickets
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tickets.map(ticket => (
                  <div
                    key={ticket._id || ticket.id}
                    onClick={() => handleViewTicket(ticket)}
                    style={{
                      padding: '1rem',
                      background: darkMode ? '#374151' : '#f9fafb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = darkMode ? '#4b5563' : '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = darkMode ? '#374151' : '#f9fafb';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <h4 style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: darkMode ? 'white' : '#111827',
                        margin: 0
                      }}>
                        {ticket.subject}
                      </h4>
                      {getStatusIcon(ticket.status, 16)}
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {ticket.customerName} • {ticket._id || ticket.id}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: ticket.priority === 'urgent' || ticket.priority === 'high'
                          ? (darkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2')
                          : (darkMode ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7'),
                        color: ticket.priority === 'urgent' || ticket.priority === 'high'
                          ? (darkMode ? '#f87171' : '#dc2626')
                          : (darkMode ? '#fbbf24' : '#d97706'),
                        textTransform: 'capitalize'
                      }}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Ticket Detail */}
          {showTicketDetail && selectedTicket && (
            <div style={{
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#111827',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {selectedTicket.subject}
                  </h2>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      {selectedTicket._id || selectedTicket.id}
                    </span>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      <Calendar size={12} />
                      {new Date(selectedTicket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket._id || selectedTicket.id, e.target.value)}
                    style={{
                      padding: '0.5rem',
                      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#111827',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              
              {/* Customer Info */}
              <div style={{
                background: darkMode ? '#111827' : '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1.125rem'
                }}>
                  {selectedTicket.customerName.charAt(0)}
                </div>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#111827'
                  }}>
                    {selectedTicket.customerName}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <User size={12} />
                    {selectedTicket.customerEmail}
                  </div>
                </div>
                <div style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    background: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5',
                    color: darkMode ? '#34d399' : '#059669'
                  }}>
                    <Tag size={12} />
                    {selectedTicket.type}
                  </span>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    background: selectedTicket.priority === 'high' || selectedTicket.priority === 'urgent'
                      ? (darkMode ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2')
                      : (darkMode ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7'),
                    color: selectedTicket.priority === 'high' || selectedTicket.priority === 'urgent'
                      ? (darkMode ? '#f87171' : '#dc2626')
                      : (darkMode ? '#fbbf24' : '#d97706'),
                    textTransform: 'capitalize'
                  }}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>
              
              {/* Ticket Description */}
              <div style={{
                background: darkMode ? '#111827' : '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#111827',
                  marginBottom: '0.75rem'
                }}>
                  Description
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: darkMode ? '#d1d5db' : '#374151',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedTicket.description}
                </p>
              </div>
              
              {/* Responses */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#111827',
                  marginBottom: '1rem'
                }}>
                  Conversation History
                </h3>
                
                {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {selectedTicket.responses.map(response => (
                      <div key={response.id} style={{
                        background: response.isStaff 
                          ? (darkMode ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe') 
                          : (darkMode ? '#111827' : '#f9fafb'),
                        padding: '1rem',
                        borderRadius: '8px',
                        borderLeft: `3px solid ${response.isStaff ? '#3b82f6' : '#9ca3af'}`
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: darkMode ? 'white' : '#111827'
                          }}>
                            {response.createdBy}
                            {response.isStaff && (
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#3b82f6',
                                marginLeft: '0.5rem',
                                padding: '0.125rem 0.375rem',
                                background: darkMode ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
                                borderRadius: '9999px'
                              }}>
                                Staff
                              </span>
                            )}
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            color: darkMode ? '#9ca3af' : '#6b7280'
                          }}>
                            {new Date(response.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p style={{
                          fontSize: '0.875rem',
                          color: darkMode ? '#d1d5db' : '#374151',
                          margin: 0,
                          whiteSpace: 'pre-wrap'
                        }}>
                          {response.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    No responses yet
                  </p>
                )}
              </div>
              
              {/* Reply Form */}
              {selectedTicket.status !== 'resolved' && (
                <div>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#111827',
                    marginBottom: '0.75rem'
                  }}>
                    Reply to Customer
                  </h3>
                  <textarea
                    id="adminResponseText"
                    placeholder="Type your response here..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#111827',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      marginBottom: '1rem'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                  }}>
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket._id || selectedTicket.id, 'resolved')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: darkMode ? '#374151' : '#f3f4f6',
                        color: darkMode ? '#d1d5db' : '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <CheckCircle size={16} />
                      Mark as Resolved
                    </button>
                    <button
                      onClick={() => {
                        const responseText = document.getElementById('adminResponseText').value;
                        handleAddResponse(selectedTicket._id || selectedTicket.id, responseText);
                        document.getElementById('adminResponseText').value = '';
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <MessageSquare size={16} />
                      Send Response
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportDashboard;