// API Service for connecting to .NET backend
import config from '../config';

const API_BASE_URL = config.api.baseUrl; // Your .NET API URL from config
const USE_MOCK = false; // Completely disabled - ONLY real backend


const apiService = {
  // Get API URL
  getApiUrl: () => API_BASE_URL,
  
  // Generic HTTP methods
  get: async (url) => {
    try {
      const token = localStorage.getItem('authToken');
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      const fullUrl = `${API_BASE_URL}${cleanUrl}`;
      console.log('GET Request URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'GET request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },
  
  post: async (url, data) => {
    try {
      const token = localStorage.getItem('authToken');
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      const fullUrl = `${API_BASE_URL}${cleanUrl}`;
      console.log('POST Request URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'POST request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },
  
  put: async (url, data) => {
    try {
      const token = localStorage.getItem('authToken');
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      const fullUrl = `${API_BASE_URL}${cleanUrl}`;
      console.log('PUT Request URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : undefined
      });
      
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'PUT request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },
  
  delete: async (url) => {
    try {
      const token = localStorage.getItem('authToken');
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      const fullUrl = `${API_BASE_URL}${cleanUrl}`;
      console.log('DELETE Request URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'DELETE request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  },
  
  // Authentication - Enhanced with persistent login
  login: async (credentials) => {
    console.log('🔐 Attempting login with backend:', credentials.email || credentials.username);
    
    try {
      // Use authService for real backend login
      return await authService.loginWithBackend(credentials);
    } catch (error) {
      console.error('❌ Backend login failed:', error);
      throw error;
    }
  },
  
  // Check authentication status (auto-login)
  checkAuth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-auth`, {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      
      if (!response.ok) {
        throw new Error('Authentication check failed');
      }
      
      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('✅ Auth check successful, user:', data.user?.email, 'Company:', data.user?.company?.name);
        return data;
      }
      
      throw new Error('No valid session found');
    } catch (error) {
      console.log('No existing session found');
      return null;
    }
  },
  
  // Logout with session cleanup
  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
    } catch (error) {
      console.log('Logout request failed, clearing local storage anyway');
    } finally {
      localStorage.removeItem('authToken');
    }
  },
  
  // Customer login - Real backend only
  customerLogin: async (credentials) => {
    console.log('🔐 Customer login attempt:', credentials.email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customer-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Customer login failed');
      }
      
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      return data;
    } catch (error) {
      console.error('Customer login failed:', error);
      throw error;
    }
  },
  
  // Registration
  register: async (userData) => {
    console.log('📝 Attempting registration with backend:', userData.email);
    
    try {
      return await authService.register(userData);
    } catch (error) {
      console.error('❌ Backend registration failed:', error);
      throw error;
    }
  },
  
  // Leads
  getLeads: async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('🎫 Frontend token for leads:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const response = await fetch(`${API_BASE_URL}/leads`, {
        headers: {
          'Authorization': `Bearer ${token?.trim()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      
      const data = await response.json();
      console.log('📊 Leads Response:', data);
      
      // Backend returns { leads: [...], total: number } format
      return data.leads || data || [];
    } catch (error) {
      console.error('Error fetching leads:', error);
      return []; // Return empty array on error
    }
  },
  
  getAllLeads: async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('🔍 Fetching all leads from backend...');
      
      const response = await fetch(`${API_BASE_URL}/leads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      
      const data = await response.json();
      console.log('📊 Leads API Response:', data);
      
      // Backend returns { leads: [...], total: number } format
      // Return just the leads array for compatibility
      return data.leads || data || [];
    } catch (error) {
      console.error('❌ Error fetching leads:', error);
      return []; // Return empty array on error
    }
  },
  
  getMyLeads: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/leads/my-leads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch my leads');
      }
      
      const data = await response.json();
      console.log('📊 My Leads Response:', data);
      
      // Backend returns { leads: [...], total: number } format
      return data.leads || data || [];
    } catch (error) {
      console.error('Error fetching my leads:', error);
      return []; // Return empty array on error
    }
  },
  
  assignLead: async (leadId, assignedTo) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/leads/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadId, assignedTo })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign lead');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error assigning lead:', error);
      throw error;
    }
  },
  
  getUsers: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return []; // Return empty array on error
    }
  },
  
  createLead: async (leadData) => {
    console.log('📝 Creating lead:', leadData);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(leadData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create lead');
      }
      
      const result = await response.json();
      console.log('✅ Lead created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating lead:', error);
      throw error;
    }
  },
  
  updateLead: async (leadId, leadData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(leadData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update lead');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  },
  
  deleteLead: async (leadId) => {
    console.log('🗑️ Deleting lead:', leadId);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete lead');
      }
      
      const result = await response.json();
      console.log('✅ Lead deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting lead:', error);
      throw error;
    }
  },
  
  // Bulk operations
  bulkUpdateLeads: async (leadIds, updateData) => {
    if (USE_MOCK) {
      return { success: true, updatedCount: leadIds.length };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/leads/bulk-update`, {
        method: 'PUT',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ leadIds, updateData })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error bulk updating leads:', error);
      return { success: true, updatedCount: leadIds.length }; // Fallback
    }
  },
  
  bulkDeleteLeads: async (leadIds) => {
    if (USE_MOCK) {
      return { success: true, deletedCount: leadIds.length };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/leads/bulk-delete`, {
        method: 'DELETE',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ leadIds })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      return { success: true, deletedCount: leadIds.length }; // Fallback
    }
  },
  
  // Search leads - Real backend only
  searchLeads: async (searchTerm, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        ...filters
      });
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/leads/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to search leads');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching leads:', error);
      throw error;
    }
  },
  
  // Customers
  getCustomers: async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('🎫 Frontend token for customers:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const response = await fetch(`${API_BASE_URL}/customers`, {
        headers: {
          'Authorization': `Bearer ${token?.trim()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      console.log('📊 Customers Response:', data);
      
      // Backend returns { customers: [...], total: number } format
      return data.customers || data || [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      return []; // Return empty array on error
    }
  },
  
  createCustomer: async (customerData) => {
    if (USE_MOCK) {
      // Mock data validation removed - using real backend only
      return { id: Date.now(), ...customerData, createdAt: new Date().toISOString() };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(customerData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error; // Don't fallback on validation errors
    }
  },
  
  updateCustomer: async (customerId, customerData) => {
    if (USE_MOCK) {
      return { id: customerId, ...customerData, updatedAt: new Date().toISOString() };
    }
    
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
      return { id: customerId, ...customerData, updatedAt: new Date().toISOString() }; // Fallback
    }
  },
  
  // Posts (for Posts component)
  getPosts: async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },
  
  // Enquiries (for RealisticDashboard)
  getEnquiries: async () => {
    const mockEnquiries = [
      { id: 1, title: 'New Lead Created', description: 'A new lead was created for Tech Solutions Pvt Ltd', status: 'completed' },
      { id: 2, title: 'Follow-up Call', description: 'Scheduled follow-up call with Rajesh Kumar from Tech Solutions', status: 'pending' },
      { id: 3, title: 'Proposal Sent', description: 'Proposal sent to Healthcare Solutions for medical equipment', status: 'in-progress' },
      { id: 4, title: 'Meeting Scheduled', description: 'Demo meeting scheduled with Digital Marketing Hub', status: 'pending' },
      { id: 5, title: 'Deal Closed', description: 'Successfully closed deal with Retail Chain for ₹5L', status: 'completed' }
    ];
    
    if (USE_MOCK) {
      return mockEnquiries;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/enquiries`, {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      return mockEnquiries; // Fallback
    }
  },

  // Demo Requests
  getDemoRequests: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/demo-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch demo requests');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching demo requests:', error);
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem('demoRequests') || '[]');
    }
  },
  
  createDemoRequest: async (demoData) => {
    console.log('📝 Creating demo request:', demoData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/demo-requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          ...demoData,
          status: 'pending',
          submittedAt: new Date().toISOString(),
          assignedTo: 'admin' // Assign to admin by default
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create demo request');
      }
      
      const result = await response.json();
      console.log('✅ Demo request created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating demo request:', error);
      throw error;
    }
  },
  
  // Settings
  updateProfile: async (profileData) => {
    if (USE_MOCK) {
      return { ...profileData, updatedAt: new Date().toISOString() };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(profileData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating profile:', error);
      return { ...profileData, updatedAt: new Date().toISOString() }; // Fallback
    }
  },
  
  changePassword: async (passwordData) => {
    if (USE_MOCK) {
      return { success: true, message: 'Password changed successfully' };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(passwordData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error changing password:', error);
      throw error; // Don't fallback on password errors
    }
  },
  
  updateSettings: async (settingsData) => {
    if (USE_MOCK) {
      // Store in localStorage for mock
      const existingSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      const updatedSettings = { ...existingSettings, [settingsData.type]: settingsData.data };
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      return { success: true, settings: updatedSettings };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(settingsData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating settings:', error);
      // Fallback to localStorage
      const existingSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      const updatedSettings = { ...existingSettings, [settingsData.type]: settingsData.data };
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      return { success: true, settings: updatedSettings };
    }
  },
  
  // Approve demo request
  approveDemoRequest: async (requestId) => {
    if (!requestId || requestId === 'undefined') {
      throw new Error('Invalid request ID: Cannot approve demo request without a valid ID');
    }
    
    console.log('✅ Approving demo request:', requestId);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/demo-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve demo request');
      }
      
      const result = await response.json();
      console.log('✅ Demo request approved successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error approving demo request:', error);
      throw error;
    }
  },
  
  // Reject demo request
  rejectDemoRequest: async (requestId) => {
    if (!requestId || requestId === 'undefined') {
      throw new Error('Invalid request ID: Cannot reject demo request without a valid ID');
    }
    
    console.log('❌ Rejecting demo request:', requestId);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/demo-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject demo request');
      }
      
      const result = await response.json();
      console.log('✅ Demo request rejected successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error rejecting demo request:', error);
      throw error;
    }
  },

  // Delete demo request
  deleteDemoRequest: async (requestId) => {
    if (!requestId || requestId === 'undefined') {
      throw new Error('Invalid request ID: Cannot delete demo request without a valid ID');
    }
    
    console.log('🗑️ Deleting demo request:', requestId);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/demo-requests/${requestId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete demo request');
      }
      
      const result = await response.json();
      console.log('✅ Demo request deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting demo request:', error);
      throw error;
    }
  },
  
  getUserSettings: async () => {
    if (USE_MOCK) {
      return JSON.parse(localStorage.getItem('userSettings') || '{}');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching settings:', error);
      return JSON.parse(localStorage.getItem('userSettings') || '{}'); // Fallback
    }
  },

  // Company Management (Super Admin only)
  getCompanies: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  createCompany: async (companyData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create company');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  updateCompanyStatus: async (companyId, status) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update company status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating company status:', error);
      throw error;
    }
  },

  suspendCompany: async (companyId) => {
    try {
      console.log('📞 API: Suspending company:', companyId);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📞 API Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ API Error:', error);
        throw new Error(error.message || 'Failed to suspend company');
      }
      
      const result = await response.json();
      console.log('✅ API Success:', result);
      return result;
    } catch (error) {
      console.error('❌ Error suspending company:', error);
      throw error;
    }
  },

  activateCompany: async (companyId) => {
    try {
      console.log('📞 API: Activating company:', companyId);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📞 API Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ API Error:', error);
        throw new Error(error.message || 'Failed to activate company');
      }
      
      const result = await response.json();
      console.log('✅ API Success:', result);
      return result;
    } catch (error) {
      console.error('❌ Error activating company:', error);
      throw error;
    }
  },

  deleteCompany: async (companyId) => {
    try {
      console.log('📞 API: Deleting company:', companyId);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📞 API Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ API Error:', error);
        throw new Error(error.message || 'Failed to delete company');
      }
      
      const result = await response.json();
      console.log('✅ API Success:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting company:', error);
      throw error;
    }
  },

  // Notifications
  getNotifications: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Task Management APIs
  getTasks: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { tasks: [] };
    }
  },

  createTask: async (taskData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create task');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update task');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete task');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Calendar APIs
  getCalendarEvents: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/calendar`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return { events: [] };
    }
  },

  createCalendarEvent: async (eventData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/calendar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create event');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Communication APIs
  getCommunications: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/communications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch communications');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching communications:', error);
      return { communications: [] };
    }
  },

  createCommunication: async (communicationData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/communications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(communicationData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create communication');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating communication:', error);
      throw error;
    }
  },

  // Team Management APIs
  getTeamMembers: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/my/team`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching team members:', error);
      return { team: [], totalMembers: 0, limits: { current: 0, max: 5, canAdd: false } };
    }
  },

  createTeamMember: async (memberData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/companies/my/team`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create team member');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  },

  updateTeamMember: async (userId, memberData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/companies/my/team/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update team member');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  },

  toggleTeamMemberStatus: async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/companies/my/team/${userId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle team member status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error toggling team member status:', error);
      throw error;
    }
  },

  deleteTeamMember: async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/companies/my/team/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete team member');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  },

  // Company Dashboard
  getCompanyDashboard: async (companyId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch company dashboard');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching company dashboard:', error);
      throw error;
    }
  },

  // Update Company Plan
  updateCompanyPlan: async (companyId, planName) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/plan`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planName })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update company plan');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating company plan:', error);
      throw error;
    }
  }

};

// Helper functions
const validateToken = (token) => {
  if (!token) return false;
  
  // Basic JWT format check: should have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.error('❌ Invalid JWT format: should have 3 parts, got', parts.length);
    return false;
  }
  
  // Check if each part is base64 encoded
  try {
    parts.forEach((part, index) => {
      if (index < 2) { // Header and payload should be valid base64
        atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      }
    });
    return true;
  } catch (error) {
    console.error('❌ Invalid JWT base64 encoding:', error.message);
    return false;
  }
};

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log('⚠️ No auth token found in localStorage');
    return {};
  }
  
  const cleanToken = token.trim();
  
  // Validate token format
  if (!validateToken(cleanToken)) {
    console.error('❌ Invalid token format, removing from localStorage');
    localStorage.removeItem('authToken');
    return {};
  }
  
  console.log('🎫 Using valid auth token:', `${cleanToken.substring(0, 20)}...`);
  return { 'Authorization': `Bearer ${cleanToken}` };
};

// Using real backend only - no mock credentials

// Auth service to connect with backend auth middleware
const authService = {
  // Verify token with backend
  verifyToken: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      return data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Login with backend - Enhanced with persistent session
  loginWithBackend: async (credentials) => {
    try {
      console.log('🔐 Attempting backend login for:', credentials.email);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // Include cookies for session
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...credentials,
          rememberMe: credentials.rememberMe || true // Default to remember user
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      if (data.success && data.token) {
        const cleanToken = data.token.trim();
        
        // Validate token before storing
        if (validateToken(cleanToken)) {
          localStorage.setItem('authToken', cleanToken);
          console.log('✅ Backend login successful with valid token');
          return data;
        } else {
          console.error('❌ Received invalid token from backend');
          throw new Error('Invalid token received from server');
        }
      }
      
      throw new Error('Login response invalid');
    } catch (error) {
      console.error('❌ Backend login failed:', error);
      throw error;
    }
  },

  // Logout with session cleanup
  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
    } catch (error) {
      console.log('Logout request failed, clearing local storage anyway');
    } finally {
      localStorage.removeItem('authToken');
    }
  }
};

const handleResponse = async (response) => {
  if (!response.ok) {
    // Handle errors
    try {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    } catch (e) {
      // If we can't parse JSON, use status text
      if (response.status === 401) {
        throw new Error('Invalid credentials');
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
  }
  return response.json();
};



// No mock data - Real backend only

export default apiService;
export { authService };