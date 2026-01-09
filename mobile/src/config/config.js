// Mobile App Configuration - Uses same backend API as web
const config = {
  api: {
    baseUrl: 'http://localhost:5004/api', // Change to your server IP for real device
    timeout: 30000,
    retryAttempts: 3
  },
  
  app: {
    name: 'Green Call CRM',
    version: '1.0.0',
    company: 'Green Call Technologies'
  },
  
  features: {
    useMockData: false,
    enableNotifications: true,
    debugMode: true
  }
};

export default config;
