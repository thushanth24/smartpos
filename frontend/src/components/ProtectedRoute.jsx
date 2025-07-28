import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * A protected route component that checks for authentication and authorization
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {Array} [props.requiredRoles=[]] - Array of roles that are allowed to access the route
 * @param {boolean} [props.requireAdmin=false] - Whether admin access is required
 * @param {string} [props.redirectTo='/login'] - Path to redirect to if not authenticated
 * @returns {React.ReactNode} - Rendered component or redirect
 */
const ProtectedRoute = ({
  children,
  requiredRoles = [],
  requireAdmin = false,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user has required roles if specified
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(role => user.roles?.includes(role));
  
  // Check if admin access is required and user is admin
  const isAdmin = user.roles?.includes('admin');
  const hasAdminAccess = !requireAdmin || isAdmin;

  // Redirect to unauthorized if user doesn't have required role or admin access
  if (!hasRequiredRole || !hasAdminAccess) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
