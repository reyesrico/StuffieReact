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

  // Restore user from localStorage on mount.
  // - If the refresh token has expired → full logout (user must log in again)
  // - If only the access token has expired but refresh is valid → keep user logged in;
  //   the 60s interval will call /auth/refresh on the next tick
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem('stuffie-session');
      if (storedSession) {
        const { refreshExpiresAt } = JSON.parse(storedSession);
        // If we have a refreshExpiresAt, honour it; legacy sessions without it use expiresAt
        const expiry = refreshExpiresAt ?? JSON.parse(storedSession).expiresAt;
        if (expiry && Math.floor(Date.now() / 1000) >= expiry) {
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

  // Session maintenance — runs every 60 s while the tab is open.
  //
  // Strategy:
  //   1. If refresh token has expired (or is missing) → logout cleanly.
  //   2. If access token expires in < 5 minutes → call POST /auth/refresh
  //      using the X-Stuffie-Refresh header (long-lived refresh token).
  //      On success: store new access + refresh tokens → stay logged in.
  //      On failure: logout cleanly.
  useEffect(() => {
    const checkExpiry = async () => {
      const storedSession = localStorage.getItem('stuffie-session');
      if (!storedSession) return;
      try {
        const { expiresAt, refreshToken, refreshExpiresAt } = JSON.parse(storedSession);
        const now = Math.floor(Date.now() / 1000);

        // Refresh token expired (or missing for legacy sessions) — must log in again
        if (refreshExpiresAt && now >= refreshExpiresAt) {
          localStorage.removeItem('stuffie-user');
          localStorage.removeItem('stuffie-session');
          localStorage.removeItem('username');
          localStorage.removeItem('stuffie-cache');
          setUser(null);
          return;
        }

        // Access token not near expiry — nothing to do
        if (expiresAt - now >= 5 * 60) return;

        // Access token expires soon (or already expired) — use refresh token
        if (!refreshToken) {
          // Legacy session with no refresh token — logout
          localStorage.removeItem('stuffie-user');
          localStorage.removeItem('stuffie-session');
          localStorage.removeItem('username');
          localStorage.removeItem('stuffie-cache');
          setUser(null);
          return;
        }

        try {
          const serverUrl = import.meta.env.VITE_CODEHOOKS_SERVER_URL || 'https://stuffie-2u0v.api.codehooks.io/dev/';
          const apiKey = import.meta.env.VITE_CODEHOOKS_API_KEY || '';
          const res = await fetch(`${serverUrl}auth/refresh`, {
            method: 'POST',
            headers: {
              'x-apikey': apiKey,
              'X-Stuffie-Refresh': refreshToken,
            },
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('stuffie-session', JSON.stringify({
              accessToken:      data.accessToken,
              expiresAt:        data.expiresAt,
              refreshToken:     data.refreshToken,
              refreshExpiresAt: data.refreshExpiresAt,
            }));
            return; // session extended — stay logged in
          }
        } catch {
          // network error — fall through to logout
        }

        // Refresh call failed — logout cleanly
        localStorage.removeItem('stuffie-user');
        localStorage.removeItem('stuffie-session');
        localStorage.removeItem('username');
        localStorage.removeItem('stuffie-cache');
        setUser(null);
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