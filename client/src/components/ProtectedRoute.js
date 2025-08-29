import React from 'react';
import PermissionGuard from './PermissionGuard';

const ProtectedRoute = ({ children, requiredPermission, userRole, userPermissions = [] }) => {
  return (
    <PermissionGuard 
      requiredPermission={requiredPermission}
      userPermissions={userPermissions}
    >
      {children}
    </PermissionGuard>
  );
};

export default ProtectedRoute;