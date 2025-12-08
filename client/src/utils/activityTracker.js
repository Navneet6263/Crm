// Activity Tracker Utility
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

class ActivityTracker {
  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.pageStartTime = Date.now();
    this.currentFeature = null;
    
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logActivity('page_view', this.currentFeature, Date.now() - this.pageStartTime);
      } else {
        this.pageStartTime = Date.now();
      }
    });
  }

  setFeature(featureName) {
    if (this.currentFeature && this.currentFeature !== featureName) {
      this.logActivity('page_view', this.currentFeature, Date.now() - this.pageStartTime);
    }
    this.currentFeature = featureName;
    this.pageStartTime = Date.now();
  }

  async logActivity(action, feature, duration = 0, metadata = {}) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      await fetch(`${API_URL}/analytics/log-activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          feature: feature || this.currentFeature,
          duration: Math.round(duration / 1000), // Convert to seconds
          sessionId: this.sessionId,
          metadata
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  trackLogin() {
    this.logActivity('login', 'Dashboard');
  }

  trackLogout() {
    this.logActivity('logout', this.currentFeature, Date.now() - this.pageStartTime);
  }

  trackLeadCreated() {
    this.logActivity('lead_created', 'Leads');
  }

  trackLeadUpdated() {
    this.logActivity('lead_updated', 'Leads');
  }

  trackLeadDeleted() {
    this.logActivity('lead_deleted', 'Leads');
  }

  trackCustomerCreated() {
    this.logActivity('customer_created', 'Customers');
  }

  trackCustomerUpdated() {
    this.logActivity('customer_updated', 'Customers');
  }

  trackCustomerDeleted() {
    this.logActivity('customer_deleted', 'Customers');
  }

  trackNoteAdded() {
    this.logActivity('note_added', this.currentFeature);
  }

  trackExport(exportType) {
    this.logActivity('export_data', this.currentFeature, 0, { exportType });
  }
}

// Create singleton instance
const activityTracker = new ActivityTracker();

export default activityTracker;
