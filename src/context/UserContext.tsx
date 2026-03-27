import React, { createContext, useState, useEffect } from 'react';
import User from '../components/types/User';

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

  // Restore user from localStorage on mount (synchronous check)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('stuffie-user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to restore user from localStorage:', error);
      localStorage.removeItem('stuffie-user');
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
    // Clear persisted user
    localStorage.removeItem('stuffie-user');
    localStorage.removeItem('username');
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;