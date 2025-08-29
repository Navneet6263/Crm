import React from 'react';
import { FaLock } from 'react-icons/fa';

// Permission Guard Component
const PermissionGuard = ({ 
  children, 
  requiredPermission, 
  userPermissions = [], 
  fallback = null,
  showMessage = true 
}) => {
  const hasPermission = userPermissions.includes(requiredPermission);

  if (!hasPermission) {
    if (fallback) return fallback;
    
    if (showMessage) {
      return (
        <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <FaLock className="text-4xl text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Access Restricted
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              आपके पास इस feature का access नहीं है।<br />
              Admin से contact करें।
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  }

  return children;
};

// Role-based permissions mapping
export const PERMISSIONS = {
  // Lead Management
  VIEW_ALL_LEADS: 'view_all_leads',
  VIEW_OWN_LEADS: 'view_own_leads',
  EDIT_ALL_LEADS: 'edit_all_leads',
  EDIT_OWN_LEADS: 'edit_own_leads',
  DELETE_LEADS: 'delete_leads',
  ADD_LEADS: 'add_leads',
  
  // Reports
  VIEW_ALL_REPORTS: 'view_all_reports',
  VIEW_OWN_REPORTS: 'view_own_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Team Management
  MANAGE_TEAM: 'manage_team',
  VIEW_TEAM: 'view_team',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_SETTINGS: 'view_settings',
  
  // Billing
  MANAGE_BILLING: 'manage_billing',
  VIEW_BILLING: 'view_billing'
};

// Role definitions with permissions
export const ROLES = {
  company_admin: {
    name: 'Company Admin',
    permissions: [
      PERMISSIONS.VIEW_ALL_LEADS,
      PERMISSIONS.EDIT_ALL_LEADS,
      PERMISSIONS.DELETE_LEADS,
      PERMISSIONS.ADD_LEADS,
      PERMISSIONS.VIEW_ALL_REPORTS,
      PERMISSIONS.EXPORT_REPORTS,
      PERMISSIONS.MANAGE_TEAM,
      PERMISSIONS.MANAGE_SETTINGS,
      PERMISSIONS.MANAGE_BILLING
    ]
  },
  manager: {
    name: 'Manager',
    permissions: [
      PERMISSIONS.VIEW_ALL_LEADS,
      PERMISSIONS.EDIT_ALL_LEADS,
      PERMISSIONS.DELETE_LEADS,
      PERMISSIONS.ADD_LEADS,
      PERMISSIONS.VIEW_ALL_REPORTS,
      PERMISSIONS.EXPORT_REPORTS,
      PERMISSIONS.VIEW_TEAM,
      PERMISSIONS.VIEW_SETTINGS
    ]
  },
  sales_rep: {
    name: 'Sales Representative',
    permissions: [
      PERMISSIONS.VIEW_OWN_LEADS,
      PERMISSIONS.EDIT_OWN_LEADS,
      PERMISSIONS.ADD_LEADS,
      PERMISSIONS.VIEW_OWN_REPORTS
    ]
  },
  viewer: {
    name: 'Viewer',
    permissions: [
      PERMISSIONS.VIEW_OWN_LEADS,
      PERMISSIONS.VIEW_OWN_REPORTS
    ]
  }
};

// Hook to check permissions
export const usePermissions = (userRole, userPermissions = []) => {
  const rolePermissions = ROLES[userRole]?.permissions || [];
  const allPermissions = [...new Set([...rolePermissions, ...userPermissions])];
  
  const hasPermission = (permission) => {
    return allPermissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => allPermissions.includes(permission));
  };
  
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => allPermissions.includes(permission));
  };
  
  return {
    permissions: allPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
};

export default PermissionGuard;