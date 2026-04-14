import React, { createContext, useState, useEffect } from 'react';
import User from '../components/types/User';
import { queryClient } from './QueryProvider';

interface UserContextType {
  user: any;
  loginUser: (userData: any) => void;
  logoutUser: () => void;
  setUser: (userData: User | null) => void;
  isLoading: boolean;
}

interface UserProviderProps {
  children: React.ReactNode;
}

// Create a context with default value (null)
const UserContext = createContext<UserContextType>({
  user: null,
  loginUser: () => {},
  logoutUser: () => {},
  setUser: () => {},
  isLoading: true,
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on mount — reject if JWT session has expired
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem('stuffie-session');
      if (storedSession) {
        const { expiresAt } = JSON.parse(storedSession);
        if (Math.floor(Date.now() / 1000) >= expiresAt) {
          // Session expired — clear everything
          localStorage.removeItem('stuffie-user');
          localStorage.removeItem('stuffie-session');
          localStorage.removeItem('username');
          setIsLoading(false);
          return;
        }
      }
      const storedUser = localStorage.getItem('stuffie-user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to restore user from localStorage:', error);
      localStorage.removeItem('stuffie-user');
      localStorage.removeItem('stuffie-session');
    }
    setIsLoading(false);
  }, []);

  const loginUser = (userData: User) => {
    setUser(userData);
    // Persist user to localStorage for auto-login on return
    localStorage.setItem('stuffie-user', JSON.stringify(userData));
    localStorage.setItem('username', userData.email || '');
  };

  const logoutUser = () => {
    setUser(null);
    // Clear persisted user and JWT session
    localStorage.removeItem('stuffie-user');
    localStorage.removeItem('stuffie-session');
    localStorage.removeItem('username');
    // Bust the persisted React Query cache so stale data never carries over
    localStorage.removeItem('stuffie-cache');
    queryClient.clear();
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;