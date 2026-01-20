import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  UserPlus, 
  TrendingUp, 
  Settings, 
  Phone, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Target, 
  Star, 
  Zap, 
  Search, 
  Database, 
  FileText, 
  DollarSign, 
  CheckSquare, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Brain,
  Copy,
  Building,
  Activity,
  Shield,
  Briefcase,
  Server,
  Package,
  History
} from 'lucide-react';

const Sidebar = ({ activeView, setActiveView, collapsed, setCollapsed, userRole, darkMode }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuSections = [
    {
      title: 'Dashboard',
      items: [
        { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: '#3b82f6' }
      ]
    },
    {
      title: 'Lead Management',
      items: [
        { id: 'add-enquiry', icon: UserPlus, label: 'Add Lead', color: '#22c55e' },
        { id: 'my-leads', icon: Users, label: 'My Leads', color: '#8b5cf6' },
        { id: 'workflow-history', icon: History, label: 'Work History', color: '#6b7280', workflowOnly: true },
        { id: 'workflow-documents', icon: FileText, label: 'Documents', color: '#8b5cf6', workflowOnly: true },
        { id: 'group-leads', icon: Target, label: 'Group Leads', color: '#f59e0b', salesOnly: true },
        { id: 'leads', icon: Target, label: 'All Leads', color: '#f59e0b' },
        { id: 'lead-history', icon: Clock, label: 'Lead History', color: '#6b7280' },
        { id: 'lead-tracker', icon: Activity, label: 'Lead Tracker', color: '#ef4444' }
      ]
    },
    {
      title: 'AI & Analytics',
      items: [
        { id: 'lead-scoring', icon: Star, label: 'AI Lead Scoring', color: '#f59e0b', adminOnly: true },
        { id: 'ai-assistant', icon: Brain, label: 'AI Assistant', color: '#8b5cf6' },
        { id: 'analytics', icon: TrendingUp, label: 'Analytics', color: '#22c55e' },
        { id: 'user-performance', icon: Activity, label: 'User Performance', color: '#3b82f6', adminOnly: true },
        { id: 'automation', icon: Zap, label: 'Automation', color: '#f59e0b' }
      ]
    },
    {
      title: 'Data Management',
      items: [
        { id: 'customers', icon: Building, label: 'Customers', color: '#3b82f6' },
        { id: 'product-management', icon: Package, label: 'Product Management', color: '#22c55e', adminOnly: true },
        { id: 'data-table', icon: Database, label: 'Data Table', color: '#6b7280' },
        { id: 'sales-pipeline', icon: Target, label: 'Sales Pipeline', color: '#22c55e' },
        { id: 'auto-assignment', icon: Users, label: 'Auto Assignment', color: '#8b5cf6', adminOnly: true },
        { id: 'duplicate-detection', icon: Copy, label: 'Duplicate Detection', color: '#ef4444', adminOnly: true }
      ]
    },
    {
      title: 'Communication',
      items: [
        { id: 'communication', icon: MessageCircle, label: 'Communication', color: '#22c55e' },
        { id: 'tasks', icon: CheckSquare, label: 'Tasks', color: '#f59e0b' },
        { id: 'calendar', icon: Calendar, label: 'Calendar', color: '#8b5cf6' }
      ]
    },
    {
      title: 'Tools & Resources',
      items: [
        { id: 'location', icon: MapPin, label: 'Location', color: '#ef4444' },
        { id: 'documents', icon: FileText, label: 'Documents', color: '#3b82f6' }
      ]
    },

    {
      title: 'System',
      items: [
        { id: 'company-management', icon: Building, label: 'Company Management', color: '#3b82f6', superAdminOnly: true },
        { id: 'billing', icon: DollarSign, label: 'Billing & Payments', color: '#22c55e' },
        { id: 'team-management', icon: Users, label: 'Team Management', color: '#8b5cf6', adminOnly: true },
        { id: 'plan-limits', icon: Server, label: 'Plan & Limits', color: '#f59e0b', adminOnly: true },
        { id: 'settings', icon: Settings, label: 'Settings', color: '#6b7280' },
        { id: 'support', icon: MessageCircle, label: 'Support Center', color: '#22c55e' }
      ]
    }
  ];

  const hasAccess = (item) => {
    // Legal and Finance teams - show Dashboard, My Leads, Work History, Documents, and Support
    if (['legal-team', 'finance-team'].includes(userRole)) {
      return ['dashboard', 'my-leads', 'workflow-history', 'workflow-documents', 'support'].includes(item.id);
    }
    
    // Hide workflow-only items from non-workflow teams
    if (item.workflowOnly && !['legal-team', 'finance-team'].includes(userRole)) {
      return false;
    }
    
    if (item.superAdminOnly && userRole !== 'super-admin') return false;
    if (item.adminOnly && !['super-admin', 'admin', 'manager', 'senior-manager'].includes(userRole)) return false;
    if (item.salesOnly && !['sales', 'sales-rep', 'senior-manager', 'sales-manager'].includes(userRole)) return false;
    return true;
  };

  const sidebarStyle = {
    width: collapsed ? '80px' : '280px',
    height: '100vh',
    background: darkMode ? '#1f2937' : 'white',
    borderRight: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1000,
    transition: 'width 0.3s ease',
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
  };

  const logoStyle = {
    padding: collapsed ? '1.5rem 1rem' : '1.5rem',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const menuStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem 0'
  };

  const sectionStyle = {
    marginBottom: '1.5rem'
  };

  const sectionTitleStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: darkMode ? '#9ca3af' : '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: collapsed ? '0 1rem' : '0 1.5rem',
    marginBottom: '0.75rem',
    display: collapsed ? 'none' : 'block'
  };

  const menuItemStyle = (item, isActive, isHovered) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: collapsed ? '1rem' : '0.75rem 1.5rem',
    margin: collapsed ? '0.25rem 0.5rem' : '0.25rem 1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: isActive 
      ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)`
      : (isHovered ? (darkMode ? '#374151' : '#f9fafb') : 'transparent'),
    border: isActive ? `2px solid ${item.color}` : '2px solid transparent',
    color: isActive ? item.color : (darkMode ? '#d1d5db' : '#374151'),
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.875rem',
    justifyContent: collapsed ? 'center' : 'flex-start',
    position: 'relative'
  });

  const collapseButtonStyle = {
    position: 'absolute',
    top: '50%',
    right: '-12px',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    background: darkMode ? '#374151' : 'white',
    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: darkMode ? '#9ca3af' : '#6b7280',
    transition: 'all 0.2s ease',
    zIndex: 1001
  };

  return (
    <div style={sidebarStyle}>
      {/* Logo Section */}
      <div 
        style={{
          ...logoStyle,
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onClick={() => setActiveView('dashboard')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #22c55e, #4ade80)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          fontSize: '1.25rem',
          boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)'
        }}>
          G
        </div>
        
        {!collapsed && (
          <div>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0,
              background: 'linear-gradient(135deg, #22c55e, #4ade80)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Green Call
            </h1>
            <p style={{
              fontSize: '0.75rem',
              color: darkMode ? '#9ca3af' : '#6b7280',
              margin: 0,
              fontWeight: '500'
            }}>
              CRM System
            </p>
          </div>
        )}
      </div>

      {/* Menu Sections */}
      <div style={menuStyle}>
        {menuSections.map((section, sectionIndex) => {
          const visibleItems = section.items.filter(hasAccess);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sectionIndex} style={sectionStyle}>
              <div style={sectionTitleStyle}>
                {section.title}
              </div>
              
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const isHovered = hoveredItem === item.id;
                
                return (
                  <div
                    key={item.id}
                    style={menuItemStyle(item, isActive, isHovered)}
                    onClick={() => setActiveView(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Icon size={20} />
                    
                    {!collapsed && (
                      <span style={{ flex: 1 }}>
                        {item.label}
                      </span>
                    )}
                    
                    {isActive && !collapsed && (
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: item.color,
                        borderRadius: '50%'
                      }} />
                    )}

                    {/* Tooltip for collapsed state */}
                    {collapsed && isHovered && (
                      <div style={{
                        position: 'absolute',
                        left: '100%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        marginLeft: '12px',
                        padding: '0.5rem 1rem',
                        background: darkMode ? '#374151' : '#1f2937',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 1002,
                        pointerEvents: 'none'
                      }}>
                        {item.label}
                        <div style={{
                          position: 'absolute',
                          left: '-4px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 0,
                          height: 0,
                          borderTop: '4px solid transparent',
                          borderBottom: '4px solid transparent',
                          borderRight: `4px solid ${darkMode ? '#374151' : '#1f2937'}`
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User Role Badge */}
      {!collapsed && (
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          background: darkMode ? '#374151' : '#f9fafb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              padding: '0.5rem',
              background: (() => {
                switch (userRole) {
                  case 'super-admin': return '#ef444420';
                  case 'admin': return '#8b5cf620';
                  case 'manager': return '#3b82f620';
                  case 'senior-manager': return '#f59e0b20';
                  case 'sales-manager': return '#3b82f620';
                  case 'sales': return '#22c55e20';
                  case 'sales-rep': return '#22c55e20';
                  default: return '#6b728020';
                }
              })(),
              borderRadius: '8px'
            }}>
              <Shield size={16} style={{
                color: (() => {
                  switch (userRole) {
                    case 'super-admin': return '#ef4444';
                    case 'admin': return '#8b5cf6';
                    case 'manager': return '#3b82f6';
                    case 'senior-manager': return '#f59e0b';
                    case 'sales-manager': return '#3b82f6';
                    case 'sales': return '#22c55e';
                    case 'sales-rep': return '#22c55e';
                    default: return '#6b7280';
                  }
                })()
              }} />
            </div>
            
            <div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937'
              }}>
                {(() => {
                  switch (userRole) {
                    case 'super-admin': return 'Super Admin';
                    case 'admin': return 'Admin';
                    case 'manager': return 'Manager';
                    case 'senior-manager': return 'Senior Manager';
                    case 'sales-manager': return 'Sales Manager';
                    case 'sales': return 'Sales';
                    case 'sales-rep': return 'Sales Rep';
                    default: return 'User';
                  }
                })()}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                Full Access
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Button */}
      <button
        style={collapseButtonStyle}
        onClick={() => setCollapsed(!collapsed)}
        onMouseEnter={(e) => {
          e.target.style.background = darkMode ? '#4b5563' : '#f3f4f6';
          e.target.style.color = darkMode ? '#d1d5db' : '#374151';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = darkMode ? '#374151' : 'white';
          e.target.style.color = darkMode ? '#9ca3af' : '#6b7280';
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
};

export default Sidebar;