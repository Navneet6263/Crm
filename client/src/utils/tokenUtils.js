// Token utility functions
export const cleanupInvalidTokens = () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) return;
  
  // Check if token is valid JWT format
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    localStorage.removeItem('authToken');
    return;
  }
  
  // Check if token parts are valid base64
  try {
    parts.forEach((part, index) => {
      if (index < 2) { // Header and payload
        atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      }
    });
  } catch (error) {
    localStorage.removeItem('authToken');
  }
};

// Call this on app startup
export const initTokenCleanup = () => {
  cleanupInvalidTokens();
};