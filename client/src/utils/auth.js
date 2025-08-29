import { authService } from '../services/apiService';

// Auth utility functions for frontend components
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Verify token with backend
  verifyAuth: async () => {
    if (!authUtils.isAuthenticated()) {
      return false;
    }
    
    try {
      await authService.verifyToken();
      return true;
    } catch (error) {
      console.error('Auth verification failed:', error);
      return false;
    }
  },

  // Login wrapper
  login: async (credentials) => {
    try {
      const result = await authService.loginWithBackend(credentials);
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Logout wrapper
  logout: () => {
    authService.logout();
  },

  // Auth guard for protected routes
  requireAuth: async () => {
    const isValid = await authUtils.verifyAuth();
    if (!isValid) {
      authUtils.logout();
      throw new Error('Authentication required');
    }
    return true;
  }
};

export default authUtils;