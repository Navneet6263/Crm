import { useState, useEffect, useCallback } from 'react';
import navigationService from '../services/navigationService';

/**
 * Custom hook for navigation management
 * Provides navigation state and methods to components
 */
export const useNavigation = () => {
  const [navigationState, setNavigationState] = useState(navigationService.getCurrentState());

  useEffect(() => {
    // Subscribe to navigation changes
    const unsubscribe = navigationService.subscribe((state) => {
      setNavigationState(state);
    });

    // Load saved navigation state on mount
    navigationService.loadFromStorage();

    return unsubscribe;
  }, []);

  // Navigation methods
  const navigateTo = useCallback((view, options) => {
    navigationService.navigateTo(view, options);
  }, []);

  const goBack = useCallback(() => {
    return navigationService.goBack();
  }, []);

  const goToDashboard = useCallback(() => {
    navigationService.goToDashboard();
  }, []);

  const goToLeads = useCallback(() => {
    navigationService.goToLeads();
  }, []);

  const goToCustomers = useCallback(() => {
    navigationService.goToCustomers();
  }, []);

  const goToSettings = useCallback(() => {
    navigationService.goToSettings();
  }, []);

  const navigateWithConfirmation = useCallback((view, hasUnsavedChanges, confirmMessage) => {
    return navigationService.navigateWithConfirmation(view, hasUnsavedChanges, confirmMessage);
  }, []);

  const clearHistory = useCallback(() => {
    navigationService.clearHistory();
  }, []);

  const reset = useCallback(() => {
    navigationService.reset();
  }, []);

  return {
    // State
    currentView: navigationState.currentView,
    history: navigationState.history,
    breadcrumbs: navigationState.breadcrumbs,
    navigationState: navigationState.navigationState,
    
    // Methods
    navigateTo,
    goBack,
    goToDashboard,
    goToLeads,
    goToCustomers,
    goToSettings,
    navigateWithConfirmation,
    clearHistory,
    reset
  };
};

export default useNavigation;