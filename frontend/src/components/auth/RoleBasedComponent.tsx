import React from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface RoleBasedComponentProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredResource?: string;
  requiredAction?: string;
  fallback?: React.ReactNode;
}

const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  children,
  allowedRoles,
  requiredResource,
  requiredAction,
  fallback = null
}) => {
  const { user, hasRole, canAccess } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasRole(allowedRoles)) {
      return <>{fallback}</>;
    }
  }

  // Check resource/action-based access
  if (requiredResource && requiredAction) {
    if (!canAccess(requiredResource, requiredAction)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default RoleBasedComponent;
