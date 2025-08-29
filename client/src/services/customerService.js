// Customer Service for backend API integration
import config from '../config';

const API_BASE_URL = config.api.baseUrl || 'http://localhost:5004/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      throw new Error('Session expired. Please login again.');
    }
    
    try {
      const error = await response.json();
      console.error('API Error Response:', error);
      throw new Error(error.message || `API request failed: ${response.status} ${response.statusText}`);
    } catch (e) {
      // If response is not JSON, throw with status info
      if (e.message.includes('API request failed')) {
        throw e; // Re-throw if it's already our formatted error
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
  }
  return response.json();
};

const customerService = {
  // Get all customers
  getCustomers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/customers?${queryParams}`, {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get customer by ID
  getCustomerById: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  },

  // Create new customer
  createCustomer: async (customerData) => {
    try {
      // Clean and validate phone number
      const cleanedData = {
        ...customerData,
        phone: customerData.phone.replace(/[^\d]/g, ''), // Remove non-digits
        email: customerData.email.toLowerCase().trim(),
        name: customerData.name.trim(),
        companyName: customerData.companyName.trim()
      };
      
      console.log('Submitting customer data:', cleanedData);
      
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (customerId, customerData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Delete customer (soft delete)
  deleteCustomer: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Add note to customer
  addNote: async (customerId, noteContent) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}/notes`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: noteContent })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }
};

export default customerService;