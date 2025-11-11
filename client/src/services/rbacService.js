// Role-Based Access Control Service

// Define permissions for each role
const rolePermissions = {
  'super-admin': [
    'view_all_leads',
    'edit_all_leads',
    'delete_leads',
    'view_analytics',
    'manage_users',
    'manage_roles',
    'view_hr',
    'manage_hr',
    'view_payroll',
    'manage_payroll',
    'view_attendance',
    'manage_attendance',
    'view_settings',
    'manage_settings',
    'view_all_customers',
    'edit_all_customers',
    'view_lead_scoring',
    'manage_lead_scoring',
    'view_auto_assignment',
    'manage_auto_assignment',
    'view_duplicate_detection',
    'manage_duplicate_detection',
    'view_api_settings',
    'manage_api_settings',
    'view_system_logs',
    'export_data'
  ],
  'admin': [
    'view_all_leads',
    'edit_all_leads',
    'view_analytics',
    'manage_users',
    'view_settings',
    'view_all_customers',
    'edit_all_customers',
    'view_lead_scoring',
    'manage_lead_scoring',
    'view_auto_assignment',
    'manage_auto_assignment',
    'view_duplicate_detection',
    'manage_duplicate_detection',
    'export_data'
  ],
  'manager': [
    'view_all_leads',
    'edit_team_leads',
    'view_team_analytics',
    'view_settings',
    'view_all_customers',
    'view_lead_scoring',
    'view_auto_assignment',
    'view_duplicate_detection',
    'manage_users'
  ],
  'senior-manager': [
    'view_all_leads',
    'edit_all_leads',
    'view_analytics',
    'view_settings',
    'view_all_customers',
    'edit_all_customers',
    'view_lead_scoring',
    'manage_lead_scoring',
    'view_auto_assignment',
    'manage_auto_assignment',
    'view_duplicate_detection',
    'manage_duplicate_detection',
    'manage_users',
    'export_data'
  ],
  'sales': [
    'view_own_leads',
    'edit_own_leads',
    'view_own_analytics',
    'view_settings',
    'view_assigned_customers'
  ],
  'sales-manager': [
    'view_all_leads',
    'edit_team_leads',
    'view_team_analytics',
    'view_settings',
    'view_all_customers',
    'view_lead_scoring'
  ],
  'sales-rep': [
    'view_own_leads',
    'edit_own_leads',
    'view_own_analytics',
    'view_settings',
    'view_assigned_customers'
  ],
  'user': [
    'view_own_leads',
    'create_leads',
    'view_own_customers',
    'create_customers',
    'view_settings'
  ]
};

// Check if user has permission
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  const permissions = rolePermissions[userRole];
  if (!permissions) return false;
  
  return permissions.includes(permission);
};

// Get all permissions for a role
export const getRolePermissions = (role) => {
  return rolePermissions[role] || [];
};

// Check if user can access a specific view
export const canAccessView = (userRole, view) => {
  // Map views to required permissions
  const viewPermissionMap = {
    'dashboard': true, // Everyone can access dashboard
    'leads': hasPermission(userRole, 'view_all_leads'),
    'my-leads': true, // Everyone can access their own leads
    'lead-history': true,
    'lead-tracker': true,
    'lead-scoring': hasPermission(userRole, 'view_lead_scoring'),
    'auto-assignment': hasPermission(userRole, 'view_auto_assignment'),
    'duplicate-detection': hasPermission(userRole, 'view_duplicate_detection'),
    'data-table': hasPermission(userRole, 'view_all_leads'),
    'hr-attendance': hasPermission(userRole, 'view_attendance'),
    'bulk-attendance': hasPermission(userRole, 'manage_attendance'),
    'salary-management': hasPermission(userRole, 'view_payroll'),
    'employee-directory': hasPermission(userRole, 'view_hr'),
    'leave-management': hasPermission(userRole, 'view_hr'),
    'payroll-management': hasPermission(userRole, 'view_payroll'),
    'customers': hasPermission(userRole, 'view_all_customers') || hasPermission(userRole, 'view_assigned_customers'),
    'analytics': hasPermission(userRole, 'view_analytics') || hasPermission(userRole, 'view_team_analytics') || hasPermission(userRole, 'view_own_analytics'),
    'settings': hasPermission(userRole, 'view_settings'),
    'api-test': hasPermission(userRole, 'view_api_settings'),
    'support': true, // Everyone can access support
    'support-admin': hasPermission(userRole, 'manage_users'),
    'team-management': hasPermission(userRole, 'manage_users'),
    'plan-limits': hasPermission(userRole, 'manage_users')
  };
  
  return viewPermissionMap[view] || false;
};

// Filter data based on user role
export const filterDataByRole = (userRole, userId, data, dataType) => {
  if (!data) return [];
  
  // Super admin, admin, senior-manager can see all data
  if (userRole === 'super-admin' || userRole === 'admin' || userRole === 'senior-manager') {
    return data;
  }
  
  switch(dataType) {
    case 'leads':
      // Manager and sales-manager can see all leads
      if (userRole === 'manager' || userRole === 'sales-manager') {
        return data;
      }
      // Sales rep can only see assigned leads
      return data.filter(lead => lead.assignedTo === userId);
      
    case 'customers':
      // Manager and sales-manager can see all customers
      if (userRole === 'manager' || userRole === 'sales-manager') {
        return data;
      }
      // Sales rep can only see assigned customers
      return data.filter(customer => customer.assignedTo === userId);
      
    default:
      return data;
  }
};

const rbacService = {
  hasPermission,
  getRolePermissions,
  canAccessView,
  filterDataByRole
};

export default rbacService;