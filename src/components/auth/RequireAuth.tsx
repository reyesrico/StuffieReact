import { Navigate } from 'react-router-dom';
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
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show skeleton while checking auth state
  if (isLoading) {
    return <AuthLoadingSkeleton />;
  }

  // Redirect to login if not authenticated.
  // No 'from' state — login always navigates to feed to prevent
  // cross-user page persistence (previous user's route leaking to next login).
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}

export default RequireAuth;
