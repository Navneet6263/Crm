import api from '../config/api';

const supportService = {
  // Create new support ticket
  createTicket: async (ticketData) => {
    try {
      const response = await api.post('/support', ticketData);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Get all tickets with filtering (for admin/super-admin)
  getAllTickets: async (filters = {}) => {
    try {
      const response = await api.get('/support', { params: filters });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    try {
      const response = await api.get(`/support/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  // Update ticket
  updateTicket: async (id, updateData) => {
    try {
      const response = await api.put(`/support/${id}`, updateData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  },

  // Add response to ticket
  addResponse: async (id, responseData) => {
    try {
      const response = await api.post(`/support/${id}/response`, responseData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error adding response:', error);
      throw error;
    }
  },

  // Delete ticket
  deleteTicket: async (id) => {
    try {
      const response = await api.delete(`/support/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  },

  // Get tickets by customer
  getTicketsByCustomer: async (customerId) => {
    try {
      const response = await api.get(`/support/customer/${customerId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching customer tickets:', error);
      throw error;
    }
  },

  // Get ticket statistics
  getTicketStats: async () => {
    try {
      const response = await api.get('/support/stats');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0
      };
    }
  }
};

export default supportService;