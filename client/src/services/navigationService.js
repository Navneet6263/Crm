/**
 * Navigation Service - Centralized navigation management
 * Handles routing, history, breadcrumbs, and navigation state
 */

class NavigationService {
  constructor() {
    this.currentView = 'landing';
    this.history = [];
    this.listeners = [];
    this.breadcrumbs = [];
    this.navigationState = {
      canGoBack: false,
      canGoForward: false,
      isLoading: false
    };
  }

  // Subscribe to navigation changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of navigation changes
  notify() {
    this.listeners.forEach(callback => callback({
      currentView: this.currentView,
      history: this.history,
      breadcrumbs: this.breadcrumbs,
      navigationState: this.navigationState
    }));
  }

  // Navigate to a specific view
  navigateTo(view, options = {}) {
    const { replace = false, state = null, skipHistory = false } = options;

    // Don't navigate if already on the same view
    if (this.currentView === view && !options.force) {
      return;
    }

    // Add current view to history (unless replacing or skipping)
    if (!replace && !skipHistory && this.currentView !== view) {
      this.history.push({
        view: this.currentView,
        timestamp: Date.now(),
        state: state
      });
    }

    // Update current view
    this.currentView = view;
    
    // Update navigation state
    this.updateNavigationState();
    
    // Update breadcrumbs
    this.updateBreadcrumbs(view);
    
    // Notify listeners
    this.notify();

    // Store in localStorage for persistence
    this.saveToStorage();
  }

  // Go back in history
  goBack() {
    if (this.history.length > 0) {
      const previousView = this.history.pop();
      this.currentView = previousView.view;
      this.updateNavigationState();
      this.updateBreadcrumbs(this.currentView);
      this.notify();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Clear navigation history
  clearHistory() {
    this.history = [];
    this.updateNavigationState();
    this.notify();
    this.saveToStorage();
  }

  // Update navigation state flags
  updateNavigationState() {
    this.navigationState = {
      canGoBack: this.history.length > 0,
      canGoForward: false, // Not implemented yet
      isLoading: false
    };
  }

  // Update breadcrumbs based on current view
  updateBreadcrumbs(view) {
    const breadcrumbMap = {
      'dashboard': [{ label: 'Dashboard', view: 'dashboard' }],
      'leads': [
        { label: 'Dashboard', view: 'dashboard' },
        { label: 'All Leads', view: 'leads' }
      ],
      'add-enquiry': [
        { label: 'Dashboard', view: 'dashboard' },
        { label: 'Lead Management', view: 'leads' },
        { label: 'Add Lead', view: 'add-enquiry' }
      ],
      'my-leads': [
        { label: 'Dashboard', view: 'dashboard' },
        { label: 'My Leads', view: 'my-leads' }
      ],
      'customers': [
        { label: 'Dashboard', view: 'dashboard' },
        { label: 'Customers', view: 'customers' }
      ],
      'analytics': [
        { label: 'Dashboard', view: 'dashboard' },
        { label: 'Analytics', view: 'analytics' }
      ],
      'settings': [
        { label: 'Dashboard', view: 'dashboard' },
        { label: 'Settings', view: 'settings' }
      ]
    };

    this.breadcrumbs = breadcrumbMap[view] || [{ label: 'Dashboard', view: 'dashboard' }];
  }

  // Get current navigation state
  getCurrentState() {
    return {
      currentView: this.currentView,
      history: this.history,
      breadcrumbs: this.breadcrumbs,
      navigationState: this.navigationState
    };
  }

  // Save navigation state to localStorage
  saveToStorage() {
    try {
      const state = {
        currentView: this.currentView,
        history: this.history.slice(-10), // Keep only last 10 items
        timestamp: Date.now()
      };
      localStorage.setItem('navigationState', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  }

  // Load navigation state from localStorage
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('navigationState');
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if saved within last 24 hours
        if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
          this.currentView = state.currentView || 'dashboard';
          this.history = state.history || [];
          this.updateNavigationState();
          this.updateBreadcrumbs(this.currentView);
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to load navigation state:', error);
    }
    return false;
  }

  // Quick navigation shortcuts
  goToDashboard() {
    this.navigateTo('dashboard');
  }

  goToLeads() {
    this.navigateTo('leads');
  }

  goToCustomers() {
    this.navigateTo('customers');
  }

  goToSettings() {
    this.navigateTo('settings');
  }

  // Navigation with confirmation for unsaved changes
  navigateWithConfirmation(view, hasUnsavedChanges = false, confirmMessage = 'You have unsaved changes. Are you sure you want to leave?') {
    if (hasUnsavedChanges) {
      if (window.confirm(confirmMessage)) {
        this.navigateTo(view);
        return true;
      }
      return false;
    } else {
      this.navigateTo(view);
      return true;
    }
  }

  // Get navigation history for debugging
  getHistory() {
    return this.history;
  }

  // Reset navigation service
  reset() {
    this.currentView = 'dashboard';
    this.history = [];
    this.breadcrumbs = [];
    this.updateNavigationState();
    this.notify();
    localStorage.removeItem('navigationState');
  }
}

// Create singleton instance
const navigationService = new NavigationService();

export default navigationService;