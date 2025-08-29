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
import SimpleAddLead from './components/AddLead';
import AIChatWidget from './components/AIChatWidget';


// Import components directly to avoid chunk loading issues
import ProfessionalDashboard from './components/Dashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';

// Lazy loaded components
const AdminSupportDashboard = lazy(() => import('./components/AdminSupportDashboard'));
const SimpleCustomerSupport = lazy(() => import('./components/SimpleCustomerSupport'));
const CustomerManagement = lazy(() => import('./components/CustomerManagement'));
const MyLeads = lazy(() => import('./components/ProfessionalMyLeads'));
const RoleBasedDashboard = lazy(() => import('./components/RoleBasedDashboard'));
const LeadHistory = lazy(() => import('./components/ProfessionalLeadHistory'));
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
    if (!globalSearchTerm) {
      setSearchResults([]);
      return;
    }
    const lower = globalSearchTerm.toLowerCase();
    const results = [];

    // pages
    menuSections.forEach(section => {
      section.items.forEach(item => {
        if (item.label.toLowerCase().includes(lower) && rbacService.hasPermission(currentUser?.role, item.id)) {
          results.push({ id: item.id, name: item.label, type: 'Page', icon: item.icon });
        }
      });
    });

    // leads
    crmData.leads?.forEach(l => {
      if (l.name && l.name.toLowerCase().includes(lower)) {
        results.push({ id: l.id, name: l.name, type: 'Lead' });
      }
    });
    // customers
    crmData.customers?.forEach(c => {
      if (c.name && c.name.toLowerCase().includes(lower)) {
        results.push({ id: c.id, name: c.name, type: 'Customer' });
      }
    });
    setSearchResults(results);
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
            role: payload.role,
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
      const { token, user } = response;
      
      localStorage.setItem('authToken', token);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setActiveView('dashboard');
      
      showToast('success', `Welcome ${user.name}! Account created successfully.`);
    } catch (error) {
      console.error('Signup error:', error);
      throw error; // Re-throw to trigger error handling in SignUp component
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout to clear session
      await apiService.logout();
      console.log('✅ Logout successful');
    } catch (error) {
      console.log('Logout request failed:', error.message);
    } finally {
      // Always clear local state
      setCurrentUser(null);
      setIsLoggedIn(false);
      setActiveView('landing');
      showToast('info', 'You have been logged out');
    }
  };



  const updateCrmData = (newData) => {
    setCrmData(prev => ({ ...prev, ...newData }));
  };

  const handleAddLead = async (leadData) => {
    try {
      await apiService.createLead(leadData);
      const allLeads = await apiService.getAllLeads();
      updateCrmData({ leads: allLeads });
      setShowAddLead(false);
      showToast('success', '✅ Lead added successfully!');
    } catch (error) {
      console.error('Error adding lead:', error);
      showToast('error', '❌ Failed to add lead');
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
        if (currentUser?.role === 'super-admin' || currentUser?.role === 'admin') {
          return <SuperAdminDashboard darkMode={darkMode} currentUser={currentUser} />;
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
          return (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '12px',
              margin: '2rem'
            }}>
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>🚫 Access Denied</h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>You don't have permission to access Lead Scoring</p>
            </div>
          );
        }
        console.log('🔍 Lead Scoring - Leads Data:', crmData.leads?.length || 0, 'leads');
        return <AILeadScoring leads={crmData.leads || []} darkMode={darkMode} />;
      case 'auto-assignment': 
        if (!rbacService.hasPermission(currentUser?.role, 'view_auto_assignment')) {
          return (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '12px',
              margin: '2rem'
            }}>
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>🚫 Access Denied</h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>You don't have permission to access Auto Assignment</p>
            </div>
          );
        }
        return <AutoAssignment crmData={crmData} updateCrmData={updateCrmData} darkMode={darkMode} />;
      case 'duplicate-detection': 
        if (!rbacService.hasPermission(currentUser?.role, 'view_duplicate_detection')) {
          return (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '12px',
              margin: '2rem'
            }}>
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>🚫 Access Denied</h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>You don't have permission to access Duplicate Detection</p>
            </div>
          );
        }
        return <DuplicateDetection crmData={crmData} updateCrmData={updateCrmData} darkMode={darkMode} />;
      case 'data-table': return <ProfessionalDataTable crmData={crmData} updateCrmData={updateCrmData} darkMode={darkMode} />;
      case 'sales-pipeline': return <SalesPipeline crmData={crmData} updateCrmData={updateCrmData} darkMode={darkMode} />;
      case 'posts': return <Posts darkMode={darkMode} />;
      case 'support': return (
        <SimpleCustomerSupport 
          darkMode={darkMode} 
          currentUser={currentUser} 
          onSubmit={(ticketData) => {
            // In a real app, this would send the ticket to an API
            showToast('success', 'Support request submitted successfully!');
          }} 
        />
      );
      case 'support-admin': 
        console.log('🔍 Support Admin Access Check:', {
          userRole: currentUser?.role,
          hasPermission: rbacService.hasPermission(currentUser?.role, 'manage_users')
        });
        if (currentUser?.role === 'super-admin') {
          return <AdminSupportDashboard darkMode={darkMode} currentUser={currentUser} />;
        }
        if (!rbacService.hasPermission(currentUser?.role, 'manage_users')) {
          return (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '12px',
              margin: '2rem'
            }}>
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>🚫 Access Denied</h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>You don't have permission to access Support Management</p>
            </div>
          );
        }
        return <AdminSupportDashboard darkMode={darkMode} currentUser={currentUser} />;
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
          <CustomerTimeline darkMode={darkMode} customer={crmData.customers?.[0]} />
        </div>
      );
      case 'company-management':
        if (currentUser?.role !== 'super-admin') {
          return (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '12px',
              margin: '2rem'
            }}>
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>🚫 Access Denied</h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Only Super Admin can access Company Management</p>
            </div>
          );
        }
        return <CompanyManagement darkMode={darkMode} />;
      case 'team-management': 
        if (!rbacService.hasPermission(currentUser?.role, 'manage_users')) {
          return (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '12px',
              margin: '2rem'
            }}>
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>🚫 Access Denied</h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>You don't have permission to access Team Management</p>
            </div>
          );
        }
        return <CompanyUserManagement currentUser={currentUser} darkMode={darkMode} />;
      case 'plan-limits': 
        if (!rbacService.hasPermission(currentUser?.role, 'manage_users')) {
          return (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '12px',
              margin: '2rem'
            }}>
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>🚫 Access Denied</h2>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>You don't have permission to access Plan & Limits</p>
            </div>
          );
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
                  changeView(id);
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