// SignalR service for real-time updates
import * as signalR from '@microsoft/signalr';
import config from '../config';

class SignalRService {
  constructor() {
    this.connection = null;
    this.connectionPromise = null;
    this.callbacks = {
      'LeadAdded': [],
      'LeadUpdated': [],
      'LeadDeleted': [],
      'AttendanceMarked': [],
      'BulkAttendanceMarked': []
    };
  }

  // Initialize connection
  async start() {
    if (this.connection) {
      return this.connectionPromise;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${config.api.baseUrl}/hubs/crm`)
      .withAutomaticReconnect()
      .build();

    // Set up event handlers
    Object.keys(this.callbacks).forEach(event => {
      this.connection.on(event, (data) => {
        this.callbacks[event].forEach(callback => callback(data));
      });
    });

    // Start connection
    this.connectionPromise = this.connection.start()
      .then(() => {
        console.log('SignalR connected');
        return this.connection;
      })
      .catch(err => {
        console.error('SignalR connection error:', err);
        this.connection = null;
        this.connectionPromise = null;
        throw err;
      });

    return this.connectionPromise;
  }

  // Stop connection
  async stop() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.connectionPromise = null;
      console.log('SignalR disconnected');
    }
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);

    // Start connection if not already started
    if (!this.connection) {
      this.start();
    }

    // Return unsubscribe function
    return () => {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    };
  }

  // Check if connected
  isConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Create singleton instance
const signalRService = new SignalRService();

export default signalRService;