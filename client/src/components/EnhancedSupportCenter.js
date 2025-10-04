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
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchStats();
    if (currentUser) {
      fetchNotifications();
    }
  }, [filters, currentUser]);

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

  const fetchNotifications = async () => {
    try {
      const data = await supportService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await supportService.getAllTickets(filters);
      setTickets(response.tickets || []);
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

  const markNotificationRead = async (notificationId) => {
    try {
      await supportService.markNotificationRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
    <div className="enhanced-support-center">
      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Tickets</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔓</div>
          <div className="stat-info">
            <h3>{stats.open}</h3>
            <p>Open Tickets</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>

      <div className="support-header">
        <h2>🎧 Enhanced Support Center</h2>
        <div className="header-actions">
          {currentUser && (
            <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
              🔔
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="notification-count">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </div>
          )}
          <button 
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            + New Ticket
          </button>
        </div>
      </div>

      {showNotifications && (
        <div className="notifications-dropdown">
          <h4>Notifications</h4>
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => {
                  markNotificationRead(notification._id);
                  fetchTicketDetails(notification.ticketId);
                  setShowNotifications(false);
                }}
              >
                <div className="notification-content">
                  <strong>#{notification.ticketNumber}</strong>
                  <p>{notification.message}</p>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search tickets..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
        
        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
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
        >
          <option value="">All Categories</option>
          <option value="general">General</option>
          <option value="technical">Technical</option>
          <option value="billing">Billing</option>
          <option value="feature-request">Feature Request</option>
        </select>
      </div>

      <div className="support-main">
        <div className="tickets-section">
          <h3>Support Tickets</h3>
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
                    <h4>{ticket.title}</h4>
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
          <div className="ticket-details">
            <div className="ticket-details-header">
              <h3>#{selectedTicket.ticketId} - {selectedTicket.title}</h3>
              <div className="ticket-actions">
                {currentUser && ['admin', 'super-admin'].includes(currentUser.role) && (
                  <select 
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket._id, e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                )}
                {selectedTicket.canCustomerDelete && (
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
              <div className="info-row">
                <strong>Customer:</strong> {selectedTicket.customerName}
              </div>
              <div className="info-row">
                <strong>Email:</strong> {selectedTicket.customerEmail}
              </div>
              <div className="info-row">
                <strong>Priority:</strong> 
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(selectedTicket.priority) }}
                >
                  {selectedTicket.priority}
                </span>
              </div>
              <div className="info-row">
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
              <h4>Description</h4>
              <p>{selectedTicket.description}</p>
            </div>

            <div className="ticket-replies">
              <h4>Conversation</h4>
              <div className="replies-list">
                {selectedTicket.replies?.map((reply, index) => (
                  <div key={index} className={`reply ${reply.isStaff ? 'staff-reply' : 'customer-reply'}`}>
                    <div className="reply-header">
                      <strong>{reply.repliedBy}</strong>
                      <span className="reply-date">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p>{reply.message}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={addReply} className="reply-form">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  required
                />
                <button type="submit" className="btn-primary">
                  Send Reply
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Ticket</h3>
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
                />
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                  rows={4}
                  required
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