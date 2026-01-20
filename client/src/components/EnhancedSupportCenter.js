import React, { useState, useEffect } from 'react';
import supportService from '../services/supportService';
import './EnhancedSupportCenter.css';

const EnhancedSupportCenter = ({ darkMode, currentUser }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: ''
  });

  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    customerName: currentUser?.name || '',
    customerEmail: currentUser?.email || '',
    customerPhone: '',
    companyName: ''
  });
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [filters]);

  const fetchStats = async () => {
    try {
      const response = await supportService.getTicketStats();
      setStats({
        total: response.total || 0,
        open: response.byStatus?.open || 0,
        inProgress: response.byStatus?.['in-progress'] || 0,
        resolved: response.byStatus?.resolved || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };



  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await supportService.getAllTickets(filters);
      let ticketList = response.tickets || [];
      
      // Apply client-side search if search term exists
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase();
        ticketList = ticketList.filter(ticket => 
          ticket.title?.toLowerCase().includes(searchTerm) ||
          ticket.description?.toLowerCase().includes(searchTerm) ||
          ticket.customerName?.toLowerCase().includes(searchTerm) ||
          ticket.customerEmail?.toLowerCase().includes(searchTerm) ||
          ticket.ticketId?.toString().includes(searchTerm)
        );
      }
      
      setTickets(ticketList);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await supportService.createTicket(ticketForm);
      
      if (response.success) {
        setTicketForm({
          title: '',
          description: '',
          priority: 'medium',
          category: 'general',
          customerName: currentUser?.name || '',
          customerEmail: currentUser?.email || '',
          customerPhone: '',
          companyName: ''
        });
        setShowCreateForm(false);
        fetchTickets();
        fetchStats();
        alert('Ticket created successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating ticket');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const ticket = await supportService.getTicketById(ticketId);
      setSelectedTicket(ticket);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const addReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      await supportService.addReply(selectedTicket._id, { message: replyMessage });
      setReplyMessage('');
      fetchTicketDetails(selectedTicket._id);
      alert('Reply sent successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding reply');
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
      await supportService.deleteTicket(ticketId);
      setSelectedTicket(null);
      fetchTickets();
      alert('Ticket deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting ticket');
    }
  };



  const updateTicketStatus = async (ticketId, status) => {
    try {
      await supportService.updateTicket(ticketId, { status });
      fetchTicketDetails(ticketId);
      fetchTickets();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating ticket');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545'
    };
    return colors[priority] || '#6c757d';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#007bff',
      'in-progress': '#ffc107',
      resolved: '#28a745',
      closed: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className={`enhanced-support-center ${darkMode ? 'dark' : ''}`} style={{
      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
      color: darkMode ? '#ffffff' : '#000000',
      minHeight: '100vh'
    }}>
      {/* Stats Cards */}
      <div className="stats-section">
        <div className={`stat-card ${darkMode ? 'dark' : ''}`}>
          <div className="stat-info">
            <h3 style={{ 
              color: darkMode ? '#ffffff' : '#1f2937',
              textShadow: 'none',
              background: 'none',
              WebkitTextFillColor: 'initial'
            }}>{stats.total}</h3>
            <p style={{ 
              color: darkMode ? '#d1d5db' : '#6b7280',
              textShadow: 'none',
              background: 'none',
              WebkitTextFillColor: 'initial'
            }}>Total Tickets</p>
          </div>
        </div>
        <div className={`stat-card ${darkMode ? 'dark' : ''}`}>
          <div className="stat-info">
            <h3 style={{ 
              color: darkMode ? '#ffffff' : '#1f2937',
              textShadow: 'none',
              background: 'none',
              WebkitTextFillColor: 'initial'
            }}>{stats.open}</h3>
            <p style={{ 
              color: darkMode ? '#d1d5db' : '#6b7280',
              textShadow: 'none',
              background: 'none',
              WebkitTextFillColor: 'initial'
            }}>Open Tickets</p>
          </div>
        </div>
        <div className={`stat-card ${darkMode ? 'dark' : ''}`}>
          <div className="stat-info">
            <h3 style={{ 
              color: darkMode ? '#ffffff' : '#1f2937',
              textShadow: 'none',
              background: 'none',
              WebkitTextFillColor: 'initial'
            }}>{stats.inProgress}</h3>
            <p style={{ 
              color: darkMode ? '#d1d5db' : '#6b7280',
              textShadow: 'none',
              background: 'none',
              WebkitTextFillColor: 'initial'
            }}>In Progress</p>
          </div>
        </div>
        <div className={`stat-card ${darkMode ? 'dark' : ''}`}>
          <div className="stat-info">
            <h3 style={{ 
              color: darkMode ? '#ffffff' : '#1f2937',
              textShadow: 'none',
              background: 'none',
              WebkitTextFillColor: 'initial'
            }}>{stats.resolved}</h3>
            <p style={{ 
              color: darkMode ? '#d1d5db' : '#6b7280',
              textShadow: 'none',
              background: 'none',
              WebkitTextFillColor: 'initial'
            }}>Resolved</p>
          </div>
        </div>
      </div>

      <div className={`support-header ${darkMode ? 'dark' : ''}`} style={{
        backgroundColor: darkMode ? '#374151' : 'white',
        color: darkMode ? '#ffffff' : '#1f2937'
      }}>
        <h2 style={{ 
          color: darkMode ? '#ffffff' : '#1f2937',
          textShadow: 'none',
          background: 'none',
          WebkitTextFillColor: 'initial'
        }}>Support Center</h2>
        <div className="header-actions">
          <button 
            className={`btn-primary ${darkMode ? 'dark' : ''}`}
            onClick={() => setShowCreateForm(true)}
            style={{
              backgroundColor: darkMode ? '#2563eb' : '#3b82f6',
              color: '#ffffff'
            }}
          >
            New Ticket
          </button>
        </div>
      </div>



      <div className="filters-section" style={{
        backgroundColor: darkMode ? '#374151' : 'white',
        color: darkMode ? '#ffffff' : '#000000'
      }}>
        <input
          type="text"
          placeholder="Search tickets..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          style={{
            backgroundColor: darkMode ? '#1f2937' : 'white',
            color: darkMode ? '#ffffff' : '#000000',
            border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
          }}
        />
        
        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          style={{
            backgroundColor: darkMode ? '#1f2937' : 'white',
            color: darkMode ? '#ffffff' : '#000000',
            border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
          }}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({...filters, priority: e.target.value})}
          style={{
            backgroundColor: darkMode ? '#1f2937' : 'white',
            color: darkMode ? '#ffffff' : '#000000',
            border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
          }}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
          style={{
            backgroundColor: darkMode ? '#1f2937' : 'white',
            color: darkMode ? '#ffffff' : '#000000',
            border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
          }}
        >
          <option value="">All Categories</option>
          <option value="general">General</option>
          <option value="technical">Technical</option>
          <option value="billing">Billing</option>
          <option value="feature-request">Feature Request</option>
        </select>
      </div>

      <div className="support-main">
        <div className="tickets-section" style={{
          backgroundColor: darkMode ? '#374151' : 'white',
          color: darkMode ? '#ffffff' : '#000000'
        }}>
          <h3 style={{ 
            color: darkMode ? '#ffffff' : '#1f2937',
            textShadow: 'none',
            background: 'none',
            WebkitTextFillColor: 'initial'
          }}>Support Tickets</h3>
          {loading ? (
            <div className="loading">Loading tickets...</div>
          ) : (
            <div className="tickets-list">
              {tickets.length === 0 ? (
                <div className="no-tickets">
                  <p>No tickets found</p>
                </div>
              ) : (
                tickets.map(ticket => (
                  <div 
                    key={ticket._id}
                    className={`ticket-item ${selectedTicket?._id === ticket._id ? 'selected' : ''}`}
                    onClick={() => fetchTicketDetails(ticket._id)}
                    style={{
                      backgroundColor: selectedTicket?._id === ticket._id 
                        ? (darkMode ? '#4b5563' : '#eff6ff')
                        : (darkMode ? '#1f2937' : 'white'),
                      color: darkMode ? '#ffffff' : '#000000',
                      border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
                    }}
                  >
                    <div className="ticket-header">
                      <span className="ticket-id">#{ticket.ticketId}</span>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <h4 style={{ 
                      color: darkMode ? '#ffffff' : '#1f2937',
                      textShadow: 'none',
                      background: 'none',
                      WebkitTextFillColor: 'initial'
                    }}>{ticket.title}</h4>
                    <div className="ticket-meta">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(ticket.status) }}
                      >
                        {ticket.status}
                      </span>
                      <span className="date">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {selectedTicket && (
          <div className="ticket-details" style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            color: darkMode ? '#ffffff' : '#000000'
          }}>
            <div className="ticket-details-header" style={{
              borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
            }}>
              <h3 style={{ 
                color: darkMode ? '#ffffff' : '#1f2937',
                textShadow: 'none',
                background: 'none',
                WebkitTextFillColor: 'initial'
              }}>#{selectedTicket.ticketId} - {selectedTicket.title}</h3>
              <div className="ticket-actions">
                {currentUser && ['admin', 'super-admin'].includes(currentUser.role) && (
                  <select 
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket._id, e.target.value)}
                    style={{
                      backgroundColor: darkMode ? '#1f2937' : 'white',
                      color: darkMode ? '#ffffff' : '#000000',
                      border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                )}
                {(currentUser && ['admin', 'super-admin'].includes(currentUser.role)) && (
                  <button 
                    className="btn-danger"
                    onClick={() => deleteTicket(selectedTicket._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div className="ticket-info">
              <div className="info-row" style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                <strong>Customer:</strong> {selectedTicket.customerName || 'N/A'}
              </div>
              <div className="info-row" style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                <strong>Email:</strong> {selectedTicket.customerEmail || 'N/A'}
              </div>
              <div className="info-row" style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                <strong>Priority:</strong> 
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(selectedTicket.priority) }}
                >
                  {selectedTicket.priority}
                </span>
              </div>
              <div className="info-row" style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                <strong>Status:</strong> 
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(selectedTicket.status) }}
                >
                  {selectedTicket.status}
                </span>
              </div>
            </div>

            <div className="ticket-description">
              <h4 style={{ 
                color: darkMode ? '#ffffff' : '#1f2937',
                textShadow: 'none',
                background: 'none',
                WebkitTextFillColor: 'initial'
              }}>Description</h4>
              <p style={{ color: darkMode ? '#ffffff' : '#000000' }}>{selectedTicket.description}</p>
            </div>

            <div className="ticket-replies">
              <h4 style={{ 
                color: darkMode ? '#ffffff' : '#1f2937',
                textShadow: 'none',
                background: 'none',
                WebkitTextFillColor: 'initial'
              }}>Conversation</h4>
              <div className="replies-list">
                {selectedTicket.replies?.map((reply, index) => (
                  <div key={index} className={`reply ${reply.isStaff ? 'staff-reply' : 'customer-reply'}`} style={{
                    backgroundColor: reply.isStaff 
                      ? (darkMode ? '#1e3a8a' : '#f0f9ff')
                      : (darkMode ? '#374151' : '#f9fafb'),
                    color: darkMode ? '#ffffff' : '#000000'
                  }}>
                    <div className="reply-header">
                      <strong style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                        {typeof reply.repliedBy === 'object' ? reply.repliedBy?.name || 'User' : reply.repliedBy}
                      </strong>
                      <span className="reply-date" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ color: darkMode ? '#ffffff' : '#000000' }}>{reply.message}</p>
                  </div>
                ))}
              </div>

              {/* Show reply form only if ticket is not resolved or closed */}
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <form onSubmit={addReply} className="reply-form">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    required
                    style={{
                      backgroundColor: darkMode ? '#1f2937' : 'white',
                      color: darkMode ? '#ffffff' : '#000000',
                      border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
                    }}
                  />
                  <button type="submit" className="btn-primary" style={{
                    backgroundColor: darkMode ? '#2563eb' : '#3b82f6',
                    color: '#ffffff'
                  }}>
                    Send Reply
                  </button>
                </form>
              )}
              
              {/* Show message when ticket is resolved/closed */}
              {(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe',
                  borderRadius: '8px',
                  marginTop: '1rem',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    color: darkMode ? '#93c5fd' : '#1e40af',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    ✅ This ticket has been {selectedTicket.status}. No further replies can be added.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal" style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            color: darkMode ? '#ffffff' : '#000000'
          }}>
            <div className="modal-header" style={{
              borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
            }}>
              <h3 style={{ 
                color: darkMode ? '#ffffff' : '#1f2937',
                textShadow: 'none',
                background: 'none',
                WebkitTextFillColor: 'initial'
              }}>Create New Ticket</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={createTicket} className="ticket-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({...ticketForm, title: e.target.value})}
                  required
                  style={{
                    backgroundColor: darkMode ? '#1f2937' : 'white',
                    color: darkMode ? '#ffffff' : '#000000',
                    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
                  }}
                />
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                  rows={4}
                  required
                  style={{
                    backgroundColor: darkMode ? '#1f2937' : 'white',
                    color: darkMode ? '#ffffff' : '#000000',
                    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
                  }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="feature-request">Feature Request</option>
                  </select>
                </div>
              </div>

              {!currentUser && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Your Name *</label>
                      <input
                        type="text"
                        value={ticketForm.customerName}
                        onChange={(e) => setTicketForm({...ticketForm, customerName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={ticketForm.customerEmail}
                        onChange={(e) => setTicketForm({...ticketForm, customerEmail: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={ticketForm.customerPhone}
                        onChange={(e) => setTicketForm({...ticketForm, customerPhone: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Company</label>
                      <input
                        type="text"
                        value={ticketForm.companyName}
                        onChange={(e) => setTicketForm({...ticketForm, companyName: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSupportCenter;