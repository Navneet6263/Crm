import React, { useState, useEffect, useContext, lazy, useTransition } from 'react';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import './App.css';
import rbacService from './services/rbacService';
import { menuSections } from './config/navigationConfig';
import apiService from './services/apiService';

// Core components
import ProfessionalSidebar from './components/ProfessionalSidebar';
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
import SimpleAddLead from './components/SimpleAddLead';
import SimpleAddEnquiry from './components/SimpleAddEnquiry';

// Lazy loaded components
const ProfessionalDashboard = lazy(() => import('./components/ProfessionalDashboard'));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'));
const AdminSupportDashboard = lazy(() => import('./components/AdminSupportDashboard'));
const SimpleCustomerSupport = lazy(() => import('./components/SimpleCustomerSupport'));
const CustomerManagement = lazy(() => import('./components/CustomerManagement'));
const MyLeads = lazy(() => import('./components/ProfessionalMyLeads'));
const LeadHistory = lazy(() => import('./components/ProfessionalLeadHistory'));
const LeadTracker = lazy(() => import('./components/LeadTracker'));
const AILeadScoring = lazy(() => import('./components/AILeadScoring'));
const AutoAssignment = lazy(() => import('./components/ProfessionalAutoAssignment'));
const DuplicateDetection = lazy(() => import('./components/ProfessionalDuplicateDetection'));
const DataTable = lazy(() => import('./components/ProfessionalDataTable'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const TaskKanban = lazy(() => import('./components/TaskKanban'));
const CommunicationHub = lazy(() => import('./components/CommunicationHub'));
const LocationTracker = lazy(() => import('./components/LocationTracker'));
const DocumentManager = lazy(() => import('./components/DocumentManager'));
const CalendarSync = lazy(() => import('./components/CalendarSync'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));
const WorkflowAutomation = lazy(() => import('./components/WorkflowAutomation'));
const Settings = lazy(() => import('./components/ProfessionalSettings'));
const ApiTestPage = lazy(() => import('./components/ApiTestPage'));
const CustomerTimeline = lazy(() => import('./components/CustomerTimeline'));
const AllLeads = lazy(() => import('./components/AllLeads'));
const Posts = lazy(() => import('./components/Posts'));
const BillingManagement = lazy(() => import('./components/BillingManagement'));
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
  const [isPending, startTransition] = useTransition();
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
    startTransition(() => {
      setActiveView(view);
    });
  };

  useEffect(() => {
    // Always start with landing page - no auto-login
    const token = localStorage.getItem('authToken');
    if (token) {
      // Clear any existing tokens on page load
      localStorage.removeItem('authToken');
    }
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      const { token, user } = response;
      localStorage.setItem('authToken', token);
      setCurrentUser(user);
      setIsLoggedIn(true);
      showToast('success', `Welcome back, ${user.name}!`);
      changeView('dashboard');
    } catch (error) {
      console.error('Login error:', error);
      showToast('error', 'Login failed. Please check your credentials.');
    }
  };

  const handleSignUp = async (userData) => {
    try {
      // Mock signup - in real app would call API
      const user = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: 'sales-rep'
      };
      localStorage.setItem('authToken', 'mock-token');
      setCurrentUser(user);
      setIsLoggedIn(true);
      showToast('success', `Welcome ${user.name}! Account created successfully.`);
      changeView('dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      showToast('error', 'Signup failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setIsLoggedIn(false);
    changeView('landing');
    showToast('info', 'You have been logged out');
  };

  const updateCrmData = (newData) => {
    setCrmData(prev => ({ ...prev, ...newData }));
  };

  const handleAddLead = async (leadData) => {
    try {
      const newLead = await apiService.createLead(leadData);
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
        const [leads, customers] = await Promise.all([
          apiService.getAllLeads(),
          apiService.getCustomers()
        ]);
        updateCrmData({ leads, customers });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const renderView = () => {
    switch(activeView) {
      case 'dashboard': 
        if (currentUser?.role === 'super-admin') {
          return <SuperAdminDashboard darkMode={darkMode} />;
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
        <SimpleAddEnquiry 
          darkMode={darkMode} 
          user={currentUser}
          onSave={handleAddLead}
          onCancel={() => changeView('dashboard')}
        />
      );
      case 'my-leads': return <MyLeads crmData={crmData} user={currentUser} darkMode={darkMode} />;
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
        return <AILeadScoring leads={crmData.leads} darkMode={darkMode} />;
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
      case 'data-table': return <DataTable crmData={crmData} updateCrmData={updateCrmData} darkMode={darkMode} />;
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
      case 'settings': return <Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentUser={currentUser} setActiveView={changeView} />;
      case 'api-test': return <ApiTestPage darkMode={darkMode} />;

      case 'customers': return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <CustomerManagement darkMode={darkMode} crmData={crmData} userRole={currentUser?.role} />
          <CustomerTimeline darkMode={darkMode} customer={crmData.customers?.[0]} />
        </div>
      );
      case 'billing': return <BillingManagement darkMode={darkMode} />;
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
      <ProfessionalSidebar 
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
          {renderView()}
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