import React from 'react';
import { useRouter } from 'next/router';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  resource?: string;
  action?: string;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  resource,
  action,
  fallback
}) => {
  const { isAuthenticated, user, hasRole, canAccess, loading } = useAuth();
  const router = useRouter();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push('/login');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Redirecting to login...</div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="text-6xl text-red-500 mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Required roles: {requiredRoles.join(', ')}
            </p>
            <p className="text-sm text-gray-500">
              Your role: {user?.role}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    );
  }

  // Check resource/action-based access
  if (resource && action && !canAccess(resource, action)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="text-6xl text-red-500 mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to {action} {resource}.
            </p>
            <p className="text-sm text-gray-500">
              Your role: {user?.role}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
