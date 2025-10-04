import api from '../config/api';

const supportService = {
  // Create new support ticket (Enhanced)
  createTicket: async (ticketData) => {
    try {
      console.log('🎫 Creating ticket:', ticketData);
      const response = await api.post('/support/tickets', ticketData);
      console.log('✅ Ticket created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
      throw error;
    }
  },

  // Get all tickets with filtering (Enhanced)
  getAllTickets: async (filters = {}) => {
    try {
      console.log('📋 Fetching tickets with filters:', filters);
      const response = await api.get('/support/tickets', { params: filters });
      console.log('✅ Tickets fetched:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      return { tickets: [], pagination: { total: 0 } };
    }
  },

  // Get ticket by ID (Enhanced)
  getTicketById: async (id) => {
    try {
      console.log('🔍 Fetching ticket:', id);
      const response = await api.get(`/support/tickets/${id}`);
      console.log('✅ Ticket fetched:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error fetching ticket:', error);
      throw error;
    }
  },

  // Update ticket (Enhanced)
  updateTicket: async (id, updateData) => {
    try {
      console.log('📝 Updating ticket:', id, updateData);
      const response = await api.put(`/support/tickets/${id}`, updateData);
      console.log('✅ Ticket updated:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error updating ticket:', error);
      throw error;
    }
  },

  // Add reply to ticket (Enhanced)
  addReply: async (id, replyData) => {
    try {
      console.log('💬 Adding reply to ticket:', id, replyData);
      const response = await api.post(`/support/tickets/${id}/reply`, replyData);
      console.log('✅ Reply added:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error adding reply:', error);
      throw error;
    }
  },

  // Delete ticket (Enhanced)
  deleteTicket: async (id) => {
    try {
      console.log('🗑️ Deleting ticket:', id);
      const response = await api.delete(`/support/tickets/${id}`);
      console.log('✅ Ticket deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting ticket:', error);
      throw error;
    }
  },

  // Get ticket statistics (Enhanced)
  getTicketStats: async () => {
    try {
      console.log('📊 Fetching ticket stats');
      const response = await api.get('/support/tickets/stats');
      console.log('✅ Stats fetched:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      return {
        total: 0,
        byStatus: { open: 0, 'in-progress': 0, resolved: 0, closed: 0 },
        byPriority: { low: 0, medium: 0, high: 0, urgent: 0 }
      };
    }
  },

  // Get notifications (Enhanced)
  getNotifications: async () => {
    try {
      console.log('🔔 Fetching notifications');
      const response = await api.get('/support/notifications');
      console.log('✅ Notifications fetched:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }
  },

  // Mark notification as read (Enhanced)
  markNotificationRead: async (id) => {
    try {
      console.log('✅ Marking notification as read:', id);
      const response = await api.put(`/support/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }
};

export default supportService;