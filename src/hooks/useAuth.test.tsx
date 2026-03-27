/**
 * useAuth Hook Tests
 */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import useAuth from './useAuth';
import UserContext from '../context/UserContext';

// Wrapper to provide UserContext
const createWrapper = (user: any = null, isLoading = false) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <UserContext.Provider 
        value={{ 
          user, 
          isLoading, 
          setUser: () => {},
          loginUser: () => {},
          logoutUser: () => {},
        }}
      >
        {children}
      </UserContext.Provider>
    );
  };
};

describe('useAuth', () => {
  describe('when user is not logged in', () => {
    it('should return isAuthenticated as false', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(null),
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.email).toBeNull();
    });
  });

  describe('when user is logged in', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    };

    it('should return isAuthenticated as true', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockUser),
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.email).toBe('test@example.com');
    });
  });

  describe('when loading', () => {
    it('should return isLoading state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(null, true),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
