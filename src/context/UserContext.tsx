import React, { createContext, useState } from 'react';
import User from '../components/types/User';

interface UserContextType {
  user: any;
  loginUser: (userData: any) => void;
  logoutUser: () => void;
}

interface UserProviderProps {
  children: React.ReactNode;
}

// Create a context with default value (null)
const UserContext = createContext<UserContextType>({
  user: null,
  loginUser: () => {},
  logoutUser: () => {},
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const loginUser = (userData: User) => {
    console.log({ userData });
    setUser(userData);
  };

  const logoutUser = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;