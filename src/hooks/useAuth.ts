import { useContext } from 'react';
import UserContext from '../context/UserContext';

/**
 * Custom hook to check authentication state
 * 
 * User is persisted in localStorage and restored on app init
 * This enables "login once, stay logged in" like Facebook/Instagram
 * 
 * @returns Authentication state { isAuthenticated, isLoading, user }
 */
export function useAuth() {
  const { user, isLoading } = useContext(UserContext);

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
    email: user?.email || null,
  };
}

export default useAuth;
