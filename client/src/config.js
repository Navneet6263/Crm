// Configuration settings for the application

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const config = {
  // API Configuration
 api: {
    baseUrl:
      process.env.REACT_APP_API_URL ||
      (window.location.hostname === 'localhost'
        ? 'http://localhost:5004/api'
        : 'https://crm-1-zn0m.onrender.com/api'),
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000, // 30 seconds
    retryAttempts: parseInt(process.env.REACT_APP_RETRY_ATTEMPTS) || 3,
    allowInsecure: isDevelopment // Only allow in development
  },

  
  // Feature Flags
  features: {
    useMockData: false, // Use real API data for production
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS !== 'false', // Default true
    enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false', // Default true
    debugMode: isDevelopment
  },
  
  // App Settings
  app: {
    name: process.env.REACT_APP_NAME || 'Green Call CRM',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    company: process.env.REACT_APP_COMPANY || 'Green Call Technologies',
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Security Settings
  security: {
    enableCSRF: isProduction,
    enableHTTPS: isProduction,
    sessionTimeout: parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || (isDevelopment ? 3600000 : 1800000) // 1 hour dev, 30 min prod
  }
};

export default config;
