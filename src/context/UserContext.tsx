import React, { createContext, useState, useEffect } from 'react';
import User from '../components/types/User';
import { queryClient } from './QueryProvider';
import { registerAndSubscribe, unsubscribeFromPush } from '../lib/webPush';

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

  // Proactive session expiry check — runs every 60 s while the tab is open.
  // When < 5 minutes remain, silently refreshes the JWT so the user never
  // gets unexpectedly logged out mid-session. Falls back to logout only if
  // the token is already expired or the refresh call fails.
  useEffect(() => {
    const checkExpiry = async () => {
      const storedSession = localStorage.getItem('stuffie-session');
      if (!storedSession) return;
      try {
        const { expiresAt, accessToken } = JSON.parse(storedSession);
        const now = Math.floor(Date.now() / 1000);

        // Already expired — clean logout immediately
        if (now >= expiresAt) {
          localStorage.removeItem('stuffie-user');
          localStorage.removeItem('stuffie-session');
          localStorage.removeItem('username');
          localStorage.removeItem('stuffie-cache');
          setUser(null);
          return;
        }

        // Within 5 minutes of expiry — try to refresh
        if (expiresAt - now < 5 * 60) {
          try {
            const serverUrl = import.meta.env.VITE_CODEHOOKS_SERVER_URL || 'https://stuffie-2u0v.api.codehooks.io/dev/';
            const apiKey = import.meta.env.VITE_CODEHOOKS_API_KEY || '';
            const res = await fetch(`${serverUrl}auth/refresh`, {
              method: 'POST',
              headers: {
                'x-apikey': apiKey,
                'X-Stuffie-Auth': accessToken,
                'Content-Type': 'application/json',
              },
            });
            if (res.ok) {
              const { accessToken: newToken, expiresAt: newExpiry } = await res.json();
              localStorage.setItem('stuffie-session', JSON.stringify({ accessToken: newToken, expiresAt: newExpiry }));
              return; // session extended — stay logged in
            }
          } catch {
            // network error — fall through to logout below
          }
          // Refresh failed — logout cleanly
          localStorage.removeItem('stuffie-user');
          localStorage.removeItem('stuffie-session');
          localStorage.removeItem('username');
          localStorage.removeItem('stuffie-cache');
          setUser(null);
        }
      } catch {
        // malformed session — leave it; the 401 interceptor will handle it
      }
    };

    const interval = setInterval(checkExpiry, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to Web Push when the user logs in (user.id becomes non-null).
  // registerAndSubscribe is idempotent — safe to call on every mount/re-login.
  useEffect(() => {
    if (user?.id) {
      registerAndSubscribe().catch(() => {});
    }
  }, [user?.id]);

  const loginUser = (userData: User) => {
    setUser(userData);
    // Persist user to localStorage for auto-login on return
    localStorage.setItem('stuffie-user', JSON.stringify(userData));
    localStorage.setItem('username', userData.email || '');
  };

  const logoutUser = () => {
    unsubscribeFromPush().catch(() => {}); // fire-and-forget before clearing session
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