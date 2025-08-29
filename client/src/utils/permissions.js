// Role-based Access Control
export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin', 
  SALES_MANAGER: 'sales-manager',
  SALES_REP: 'sales-rep'
};

export const PERMISSIONS = {
  CREATE_LEAD: 'create_lead',
  VIEW_ALL_LEADS: 'view_all_leads',
  EDIT_ALL_LEADS: 'edit_all_leads',
  DELETE_LEAD: 'delete_lead',
  ASSIGN_LEADS: 'assign_leads',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  SYSTEM_SETTINGS: 'system_settings',
  VIEW_ANALYTICS: 'view_analytics',
  LEAD_SCORING: 'lead_scoring',
  AUTO_ASSIGNMENT: 'auto_assignment'
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_LEAD,
    PERMISSIONS.VIEW_ALL_LEADS,
    PERMISSIONS.EDIT_ALL_LEADS,
    PERMISSIONS.DELETE_LEAD,
    PERMISSIONS.ASSIGN_LEADS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.LEAD_SCORING,
    PERMISSIONS.AUTO_ASSIGNMENT
  ],
  [ROLES.SALES_MANAGER]: [
    PERMISSIONS.CREATE_LEAD,
    PERMISSIONS.VIEW_ALL_LEADS,
    PERMISSIONS.EDIT_ALL_LEADS,
    PERMISSIONS.ASSIGN_LEADS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.SALES_REP]: [
    PERMISSIONS.CREATE_LEAD
  ]
};

export const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};