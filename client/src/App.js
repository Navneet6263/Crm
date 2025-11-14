import React, { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import './App.css';
import './styles/buttons.css';
import './styles/mobile.css';
import rbacService from './services/rbacService';
import { menuSections } from './config/navigationConfig';
import apiService from './services/apiService';

import { initTokenCleanup } from './utils/tokenUtils';

// Core components
import Sidebar from './components/Sidebar';
import ProfessionalHeader from './components/ProfessionalHeader';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import QuickActions from './components/QuickActions';
import SmartNotifications from './components/SmartNotifications';
import ToastNotification, { showToast } from './components/ToastNotification';
import LandingPage from './components/LandingPage';
import GreenCallLogin from './components/GreenCallLogin';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import CustomerLogin from './components/CustomerLogin';
import CompanySetup from './components/CompanySetup';
import AccessDenied from './components/AccessDenied';
import SimpleAddLead from './components/AddLead';
import AIChatWidget from './components/AIChatWidget';


// Import components directly to avoid chunk loading issues
import ProfessionalDashboard from './components/Dashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';

// Lazy loaded components
const EnhancedSupportCenter = lazy(() => import('./components/EnhancedSupportCenter'));
const CustomerManagement = lazy(() => import('./components/CustomerManagement'));
const MyLeads = lazy(() => import('./components/MyLeads'));
const RoleBasedDashboard = lazy(() => import('./components/RoleBasedDashboard'));
const LeadHistory = lazy(() => import('./components/LeadHistory'));
const LeadTracker = lazy(() => import('./components/LeadTracker'));
const AILeadScoring = lazy(() => import('./components/AILeadScoring'));
const AutoAssignment = lazy(() => import('./components/ProfessionalAutoAssignment'));
const DuplicateDetection = lazy(() => import('./components/ProfessionalDuplicateDetection'));
const ProfessionalDataTable = lazy(() => import('./components/DataTable'));
const SalesPipeline = lazy(() => import('./components/SalesPipeline'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const TaskKanban = lazy(() => import('./components/TaskKanban'));
const CommunicationHub = lazy(() => import('./components/CommunicationHub'));
const LocationTracker = lazy(() => import('./components/LocationTracker'));
const DocumentManager = lazy(() => import('./components/DocumentManager'));
const CalendarSync = lazy(() => import('./components/CalendarSync'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));
const WorkflowAutomation = lazy(() => import('./components/WorkflowAutomation'));
const Settings = lazy(() => import('./components/Settings'));
const CustomerTimeline = lazy(() => import('./components/CustomerTimeline'));
const AllLeads = lazy(() => import('./components/AllLeads'));
const Posts = lazy(() => import('./components/Posts'));
const BillingManagement = lazy(() => import('./components/BillingManagement'));
const CompanyUserManagement = lazy(() => import('./components/CompanyUserManagement'));
const PlanLimitsDisplay = lazy(() => import('./components/PlanLimitsDisplay'));
const CompanyManagement = lazy(() => import('./components/CompanyManagement'));
const NotFound = lazy(() => import('./components/NotFound'));


// Loading component
const LoadingSpinner = ({ darkMode }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: darkMode ? '#9ca3af' : '#6b7280'
  }}>
    <div style={{
      border: `3px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      borderTop: '3px solid #3b82f6',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);


const AppContent = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [activeView, setActiveView] = useState('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showCompanySetup, setShowCompanySetup] = useState(false);

  // Global search term and results
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [crmData, setCrmData] = useState({
    leads: [],
    customers: [],
    activities: [],
    assignments: []
  });

  // Update search results whenever term changes
  useEffect(() => {
    if (!globalSearchTerm || globalSearchTerm.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    
    const lower = globalSearchTerm.toLowerCase().trim();
    const results = [];

    // Always show pages first - they should always be available
    menuSections.forEach(section => {
      section.items.forEach(item => {
        if (item.label.toLowerCase().includes(lower)) {
          // Check permissions
          const hasPermission = (!item.adminOnly && !item.superAdminOnly) || 
                               (item.adminOnly && ['admin', 'manager', 'senior-manager', 'super-admin'].includes(currentUser?.role)) ||
                               (item.superAdminOnly && currentUser?.role === 'super-admin');
          
          if (hasPermission) {
            results.push({ 
              id: item.id, 
              name: item.label, 
              type: 'Page', 
              icon: item.icon,
              subtitle: section.title 
            });
          }
        }
      });
    });

    // Search leads
    if (crmData.leads && Array.isArray(crmData.leads)) {
      crmData.leads.forEach(lead => {
        const searchableFields = [
          lead.name,
          lead.contactPerson, 
          lead.email,
          lead.phone,
          lead.company,
          lead.companyName,
          lead.source
        ].filter(Boolean);
        
        const matches = searchableFields.some(field => 
          String(field).toLowerCase().includes(lower)
        );
        
        if (matches) {
          results.push({ 
            id: `lead-${lead.id}`, 
            name: lead.name || lead.contactPerson || 'Unknown Lead',
            type: 'Lead',
            subtitle: lead.company || lead.companyName || lead.email || 'Lead'
          });
        }
      });
    }

    // Search customers
    if (crmData.customers && Array.isArray(crmData.customers)) {
      crmData.customers.forEach(customer => {
        const searchableFields = [
          customer.name,
          customer.contactPerson,
          customer.email, 
          customer.phone,
          customer.company,
          customer.companyName
        ].filter(Boolean);
        
        const matches = searchableFields.some(field => 
          String(field).toLowerCase().includes(lower)
        );
        
        if (matches) {
          results.push({ 
            id: `customer-${customer.id}`, 
            name: customer.name || customer.contactPerson || 'Unknown Customer',
            type: 'Customer',
            subtitle: customer.company || customer.companyName || customer.email || 'Customer'
          });
        }
      });
    }

    // Add common search suggestions
    const suggestions = [
      { id: 'add-enquiry', name: 'Add New Lead', type: 'Action', subtitle: 'Create a new lead' },
      { id: 'analytics', name: 'View Analytics', type: 'Action', subtitle: 'Dashboard analytics' },
      { id: 'leads', name: 'All Leads', type: 'Action', subtitle: 'View all leads' },
      { id: 'customers', name: 'Customers', type: 'Action', subtitle: 'Manage customers' },
      { id: 'settings', name: 'Settings', type: 'Action', subtitle: 'System settings' }
    ];
    
    suggestions.forEach(suggestion => {
      if (suggestion.name.toLowerCase().includes(lower) && 
          !results.some(r => r.id === suggestion.id)) {
        results.push(suggestion);
      }
    });

    console.log('Search results for "' + globalSearchTerm + '":', results);
    setSearchResults(results.slice(0, 8));
  }, [globalSearchTerm, crmData, currentUser]);

  const changeView = (view) => {
    setActiveView(view);
  };

  useEffect(() => {
    // Check for OAuth callback first
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');
      
      if (error) {
        showToast('error', 'OAuth login failed');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      if (token) {
        localStorage.setItem('authToken', token);
        // Decode token to get user info
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('OAuth Token Payload:', payload);
          const user = {
            id: payload.id || payload.userId,
            email: payload.email,
            role: payload.role || 'user', // Default to 'user' if role not in token
            name: payload.name || payload.email?.split('@')[0] || 'User'
          };
          setCurrentUser(user);
          setIsLoggedIn(true);
          setActiveView('dashboard');
          showToast('success', `Welcome ${user.name}!`);
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        } catch (err) {
          console.error('Token decode error:', err);
          // If token decode fails, try to get user info from backend
          try {
            const response = await fetch('http://localhost:5004/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.ok) {
              const userData = await response.json();
              setCurrentUser(userData.user);
              setIsLoggedIn(true);
              setActiveView('dashboard');
              showToast('success', `Welcome ${userData.user.name}!`);
              window.history.replaceState({}, document.title, window.location.pathname);
              return;
            }
          } catch (apiErr) {
            console.error('Failed to get user info from API:', apiErr);
          }
        }
      }
    };
    
    // Auto-login check on app start
    const checkExistingAuth = async () => {
      try {
        // First cleanup any invalid tokens
        initTokenCleanup();
        
        // Then check for OAuth callback
        await handleOAuthCallback();
        
        // Then check localStorage token
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('No token found in localStorage');
          return;
        }
        
        // Check with backend if session is still valid
        const authData = await apiService.checkAuth();
        if (authData && authData.success && authData.user) {
          console.log('✅ Auto-login successful:', authData.user.name);
          setCurrentUser(authData.user);
          setIsLoggedIn(true);
          setActiveView('dashboard');
          showToast('success', `Welcome back, ${authData.user.name}!`);
        } else {
          // Invalid session, clear token
          localStorage.removeItem('authToken');
          console.log('Invalid session, cleared token');
        }
      } catch (error) {
        console.log('Auto-login failed:', error.message);
        localStorage.removeItem('authToken');
      }
    };
    
    checkExistingAuth();
  }, []);

  const handleLogin = async (credentials) => {
    console.log('Login attempt with credentials:', credentials);
    try {
      // Use apiService.login for all login attempts
      const response = await apiService.login(credentials);
      
      if (!response) {
        showToast('error', 'Login failed');
        return false;
      }
      
      const { token, user } = response;
      
      localStorage.setItem('authToken', token);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setActiveView('dashboard');
      
      showToast('success', `Welcome back, ${user.name}!`);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const handleCustomerLogin = async (credentials) => {
    console.log('Customer login attempt:', credentials);
    try {
      const response = await apiService.customerLogin(credentials);
      
      if (!response) {
        showToast('error', 'Customer login failed');
        return false;
      }
      
      const { token, user } = response;
      
      localStorage.setItem('authToken', token);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setActiveView('dashboard');
      
      showToast('success', `Welcome ${user.name}!`);
      return true;
    } catch (error) {
      console.error('Customer login error:', error);
      throw error;
    }
  };

  const handleSignUp = async (userData) => {
    try {
      // Use apiService.register for real backend registration
      const response = await apiService.register(userData);
      const { token, user, talentId, needsCompanySetup } = response;
      
      localStorage.setItem('authToken', token);
      setCurrentUser(user);
      setIsLoggedIn(true);
      
      // Show company setup if needed
      if (needsCompanySetup) {
        setShowCompanySetup(true);
        showToast('success', `Welcome ${user.name}! Your Talent ID: ${talentId}. Please setup your company details.`);
      } else {
        setActiveView('dashboard');
        showToast('success', `Welcome ${user.name}!`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const handleCompanySetupComplete = (companyData) => {
    // Generate unique talent ID
    const talentId = `TID${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Update user with company info and talent ID
    const updatedUser = {
      ...currentUser,
      companyId: companyData.id,
      talentId: talentId,
      companySetupComplete: true
    };
    
    setCurrentUser(updatedUser);
    setShowCompanySetup(false);
    setActiveView('dashboard');
    
    showToast('success', `Company setup complete! Your Talent ID: ${talentId}`);
  };

  const handleLogout = async () => {
    // Step 1: Clear local state immediately
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setActiveView('landing');
    showToast('info', 'You have been logged out');

    // Step 2: Backend logout (background, optional)
    try {
      await apiService.logout();
      console.log('✅ Backend logout successful');
    } catch (error) {
      console.log('⚠️ Backend logout failed:', error.message);
    }
  };



  const updateCrmData = (newData) => {
    setCrmData(prev => ({ ...prev, ...newData }));
  };

  const handleAddLead = async (leadData) => {
    try {
      console.log('📝 Creating lead with data:', leadData);
      const newLead = await apiService.createLead(leadData);
      console.log('✅ Lead created successfully:', newLead);
      
      // Refresh leads data
      const allLeads = await apiService.getAllLeads();
      updateCrmData({ leads: allLeads });
      setShowAddLead(false);
      showToast('success', '✅ Lead added successfully!');
    } catch (error) {
      console.error('❌ Error adding lead:', error);
      const errorMessage = error.message || 'Failed to add lead';
      showToast('error', `❌ ${errorMessage}`);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Loading CRM data...');
        const [leads, customers] = await Promise.all([
          apiService.getAllLeads(),
          apiService.getCustomers()
        ]);
        console.log('✅ Data loaded:', { leads: leads?.length || 0, customers: customers?.length || 0 });
        updateCrmData({ leads: leads || [], customers: customers || [] });
      } catch (error) {
        console.error('❌ Error loading data:', error);
        // Set empty arrays to prevent undefined issues
        updateCrmData({ leads: [], customers: [] });
      }
    };
    
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const renderView = () => {
    switch(activeView) {
      case 'dashboard': 
        if (currentUser?.role === 'super-admin' || currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'senior-manager') {
          return <SuperAdminDashboard darkMode={darkMode} currentUser={currentUser} onNavigate={changeView} />;
        }
        return (
          <ProfessionalDashboard 
            crmData={crmData} 
            user={currentUser} 
            darkMode={darkMode}
            setActiveView={changeView}
          />
        );
      case 'leads': return <AllLeads crmData={crmData} updateCrmData={updateCrmData} darkMode={darkMode} />;
      case 'add-enquiry': return (
        <SimpleAddLead 
          darkMode={darkMode} 
          user={currentUser}
          onSave={handleAddLead}
          onCancel={() => changeView('dashboard')}
        />
      );
      case 'my-leads': return <MyLeads crmData={crmData} user={currentUser} darkMode={darkMode} updateCrmData={updateCrmData} />;
      case 'role-dashboard': return <RoleBasedDashboard darkMode={darkMode} />;
      case 'lead-history': return <LeadHistory crmData={crmData} darkMode={darkMode} />;
      case 'lead-tracker': return <LeadTracker crmData={crmData} updateCrmData={updateCrmData} user={currentUser} darkMode={darkMode} />;
      case 'lead-scoring': 
        if (!rbacService.hasPermission(currentUser?.role, 'view_lead_scoring')) {
          return <AccessDenied darkMode={darkMode} message="You don't have permission to access Lead Scoring" />;
        }
        console.log('🔍 Lead Scoring - Leads Data:', crmData.leads?.length || 0, 'leads');
        return <AILeadScoring leads={crmData.leads || []} darkMode={darkMode} />;
      case 'auto-assignment': 
        if (!rbacService.hasPermission(currentUser?.role, 'view_auto_assignment')) {
          return <AccessDenied darkMode={darkMode} message="You don't have permission to access Auto Assignment" />;
        }
        return <AutoAssignment crmData={crmData} updateCrmData={updateCrmData} darkMode={darkMode} />;
      case 'duplicate-detection': 
        if (!rbacService.hasPermission(currentUser?.role, 'view_duplicate_detection')) {
          return <AccessDenied darkMode={darkMode} message="You don't have permission to access Duplicate Detection" />;
        }
        return <DuplicateDetection crmData={crmData} updateCrmData={updateCrmData} darkMode={darkMode} />;
      case 'data-table': return <ProfessionalDataTable crmData={crmData} updateCrmData={updateCrmData} darkMode={darkMode} />;
      case 'sales-pipeline': return <SalesPipeline crmData={crmData} updateCrmData={updateCrmData} darkMode={darkMode} />;
      case 'posts': return <Posts darkMode={darkMode} />;
      case 'support': return (
        <EnhancedSupportCenter 
          darkMode={darkMode} 
          currentUser={currentUser} 
        />
      );

      case 'analytics': return <AnalyticsDashboard darkMode={darkMode} />;
      case 'tasks': return <TaskKanban darkMode={darkMode} />;
      case 'communication': return <CommunicationHub darkMode={darkMode} lead={null} onClose={() => changeView('dashboard')} />;
      case 'location': return <LocationTracker darkMode={darkMode} currentUser={currentUser} />;
      case 'documents': return <DocumentManager darkMode={darkMode} currentUser={currentUser} />;
      case 'calendar': return <CalendarSync darkMode={darkMode} currentUser={currentUser} />;
      case 'ai-assistant': return <AIAssistant darkMode={darkMode} currentUser={currentUser} crmData={crmData} />;
      case 'automation': return <WorkflowAutomation darkMode={darkMode} currentUser={currentUser} crmData={crmData} />;
      case 'settings': return <Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentUser={currentUser} />;

      case 'customers': return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <CustomerManagement darkMode={darkMode} crmData={crmData} userRole={currentUser?.role} />
          <CustomerTimeline darkMode={darkMode} customer={crmData.customers && crmData.customers.length > 0 ? crmData.customers[0] : null} />
        </div>
      );
      case 'company-management':
        if (currentUser?.role !== 'super-admin') {
          return <AccessDenied darkMode={darkMode} message="Only Super Admin can access Company Management" />;
        }
        return <CompanyManagement darkMode={darkMode} />;
      case 'team-management': 
        if (currentUser?.role === 'super-admin' || rbacService.hasPermission(currentUser?.role, 'manage_users')) {
          return <CompanyUserManagement currentUser={currentUser} darkMode={darkMode} />;
        }
        return <AccessDenied darkMode={darkMode} message="You need Admin or Manager role to manage team members." />;
      case 'plan-limits': 
        if (!rbacService.hasPermission(currentUser?.role, 'manage_users')) {
          return <AccessDenied darkMode={darkMode} message="You don't have permission to access Plan & Limits" />;
        }
        return <PlanLimitsDisplay currentPlan={currentUser?.plan || 'basic'} usage={{
          users: crmData.users?.length || 0,
          managers: crmData.users?.filter(u => u.role === 'manager')?.length || 0,
          leads: crmData.leads?.length || 0,
          reports: 5
        }} darkMode={darkMode} />;
      case 'billing': return <BillingManagement darkMode={darkMode} userRole={currentUser?.role} />;

      case '404': return <NotFound darkMode={darkMode} onGoHome={() => changeView('dashboard')} />;
      default: return <ProfessionalDashboard crmData={crmData} user={currentUser} darkMode={darkMode} setActiveView={changeView} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div>
        {activeView === 'signin' ? (
          <SignIn
            onSignIn={handleLogin}
            onGoToSignUp={() => changeView('signup')}
            onBack={() => changeView('landing')}
            darkMode={darkMode}
          />
        ) : activeView === 'signup' ? (
          <SignUp
            onSignUp={handleSignUp}
            onBackToSignIn={() => changeView('signin')}
            onBack={() => changeView('landing')}
            darkMode={darkMode}
          />
        ) : activeView === 'login' ? (
          <GreenCallLogin
            onLogin={handleLogin}
            onBack={() => changeView('landing')}
          />
        ) : activeView === 'customer-login' ? (
          <CustomerLogin
            onLogin={handleCustomerLogin}
            onBack={() => changeView('landing')}
            darkMode={darkMode}
          />
        ) : (
          <LandingPage 
            onAdminLogin={() => changeView('login')} 
            onStartFreeTrial={() => changeView('signup')}
            onSignUp={() => changeView('signup')}
            onSignIn={() => changeView('signin')}
          />
        )}
      </div>
    );
  }

  // Show company setup if user just registered
  if (showCompanySetup) {
    return (
      <CompanySetup
        user={currentUser}
        onComplete={handleCompanySetupComplete}
        darkMode={darkMode}
      />
    );
  }

  return (
    <div className="app">

      <Sidebar 
        activeView={activeView} 
        setActiveView={changeView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        userRole={currentUser?.role}
        darkMode={darkMode}
      />
      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`} style={{
        background: darkMode ? '#111827' : '#f9fafb',
        marginLeft: sidebarCollapsed ? '80px' : '280px',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '0 2rem',
          height: '80px',
          borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          background: darkMode ? '#1f2937' : 'white',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <SearchBar 
                darkMode={darkMode}
                searchTerm={globalSearchTerm}
                setSearchTerm={setGlobalSearchTerm}
                searchResults={searchResults}
                onNavigate={(id) => {
                  // Handle different types of navigation
                  if (id.startsWith('lead-')) {
                    // Navigate to leads page and highlight specific lead
                    changeView('leads');
                  } else if (id.startsWith('customer-')) {
                    // Navigate to customers page and highlight specific customer
                    changeView('customers');
                  } else {
                    // Regular page navigation
                    changeView(id);
                  }
                  setGlobalSearchTerm('');
                }}
              />
          </div>
          
          <QuickActions darkMode={darkMode} setActiveView={changeView} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <SmartNotifications darkMode={darkMode} setActiveView={changeView} currentUser={currentUser} />
            <ProfessionalHeader 
              user={currentUser} 
              onLogout={handleLogout} 
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              setActiveView={changeView}
            />
          </div>
        </div>
        <div className="content" style={{padding: '2rem', minHeight: 'calc(100vh - 80px)'}}>
          <Suspense fallback={<LoadingSpinner darkMode={darkMode} />}>
            {renderView()}
          </Suspense>
        </div>
      </div>
      
      {showAddLead && (
        <SimpleAddLead
          onSave={handleAddLead}
          onCancel={() => setShowAddLead(false)}
          setActiveView={changeView}
          darkMode={darkMode}
        />
      )}
      
      <ToastNotification />
      
      {/* AI Chat Widget - Always visible when logged in */}
      <AIChatWidget 
        darkMode={darkMode} 
        currentUser={currentUser} 
        crmData={crmData} 
      />

    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;