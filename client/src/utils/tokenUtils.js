// Token utility functions
export const cleanupInvalidTokens = () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.log('🔍 No token found in localStorage');
    return;
  }
  
  // Check if token is valid JWT format
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    console.error('❌ Invalid JWT format found, cleaning up...');
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
    console.log('✅ Token format is valid');
  } catch (error) {
    console.error('❌ Invalid token base64 encoding, cleaning up...', error.message);
    localStorage.removeItem('authToken');
  }
};

// Call this on app startup
export const initTokenCleanup = () => {
  console.log('🧹 Initializing token cleanup...');
  cleanupInvalidTokens();
};