import config from '../config';

const API_BASE_URL = config.api.baseUrl;

export const oauthService = {
  // Google OAuth login
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  },

  // LinkedIn OAuth login
  loginWithLinkedIn: () => {
    window.location.href = `${API_BASE_URL}/api/auth/linkedin`;
  },

  // Handle OAuth callback and extract token
  handleOAuthCallback: () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    const message = urlParams.get('message');

    if (error) {
      if (error === 'oauth_not_configured') {
        alert(message || 'OAuth not configured. Please use email/password login.');
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        return null;
      }
      throw new Error(message || error);
    }

    if (token) {
      localStorage.setItem('token', token);
      return token;
    }

    return null;
  },

  // Get user info from token
  getUserFromToken: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get user info');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
};