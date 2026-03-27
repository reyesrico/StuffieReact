import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthLoadingSkeleton } from '../skeletons/AuthLoadingSkeleton';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Auth guard component that protects routes
 * 
 * - Shows loading skeleton while checking authentication
 * - Redirects to /login if not authenticated
 * - Renders children if authenticated
 * 
 * This replaces the complex Auth.tsx routing logic with a simple guard.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show skeleton while checking auth state
  if (isLoading) {
    return <AuthLoadingSkeleton />;
  }

  // Redirect to login if not authenticated
  // Save the attempted location for redirect after login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}

export default RequireAuth;
