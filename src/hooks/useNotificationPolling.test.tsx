/**
 * useNotificationPolling — unit tests
 *
 * Covers:
 * 1. Polling: invalidateQueries is called after 30s (visible tab)
 * 2. Polling: skipped when document.hidden is true
 * 3. Push: Notification fired when totalRequests increases
 * 4. Push: no Notification when count is unchanged
 * 5. Push: no Notification when count decreases
 * 6. Push: requestPermission called when permission is 'default'
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '../config/i18n';
import UserContext from '../context/UserContext';
import { useNotificationPolling } from './useNotificationPolling';

// ---------------------------------------------------------------------------
// Control totalRequests through a shared object (avoids hoisting issues)
// ---------------------------------------------------------------------------
const notifState = { totalRequests: 0 };

vi.mock('./queries/useNotifications', () => ({
  useNotifications: () => ({ totalRequests: notifState.totalRequests }),
}));

// ---------------------------------------------------------------------------
// Notification stub
// ---------------------------------------------------------------------------
const notifFired = vi.fn();
const requestPermission = vi.fn<() => Promise<NotificationPermission>>();

class MockNotification {
  static permission: NotificationPermission = 'granted';
  static requestPermission = requestPermission;
  constructor(title: string, opts?: NotificationOptions) {
    notifFired(title, opts);
  }
}

// ---------------------------------------------------------------------------
// Per-test setup
// ---------------------------------------------------------------------------
const makeSetup = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidateSpy = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue(undefined as any);

  const fakeUser = { id: 1, email: 'a@stuffie.net' };
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>
      <UserContext.Provider
        value={{ user: fakeUser, isLoading: false, setUser: vi.fn(), loginUser: vi.fn(), logoutUser: vi.fn() }}
      >
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </UserContext.Provider>
    </QueryClientProvider>
  );

  return { qc, invalidateSpy, wrapper };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useNotificationPolling', () => {
  beforeEach(() => {
    // Only fake timers we need; leaving queueMicrotask live keeps React 18's
    // scheduler from deadlocking inside act().
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    notifState.totalRequests = 0;
    notifFired.mockClear();
    requestPermission.mockClear().mockResolvedValue('granted');
    MockNotification.permission = 'granted';

    vi.stubGlobal('Notification', MockNotification);
    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('calls invalidateQueries for all collections after 30s', () => {
    const { invalidateSpy, wrapper } = makeSetup();
    renderHook(() => useNotificationPolling(), { wrapper });

    expect(invalidateSpy).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(30_000); });

    // exchanges + loans + purchases + friends = 4 calls
    expect(invalidateSpy.mock.calls.length).toBeGreaterThanOrEqual(4);
  });

  it('does not poll when the tab is hidden', () => {
    Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
    const { invalidateSpy, wrapper } = makeSetup();
    renderHook(() => useNotificationPolling(), { wrapper });

    act(() => { vi.advanceTimersByTime(30_000); });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('fires a Notification when totalRequests increases', () => {
    notifState.totalRequests = 2;
    const { wrapper } = makeSetup();
    const { rerender } = renderHook(() => useNotificationPolling(), { wrapper });

    // Raise the count and trigger a re-render
    notifState.totalRequests = 5;
    act(() => { rerender(); });

    expect(notifFired).toHaveBeenCalledTimes(1);
    expect(notifFired.mock.calls[0][0]).toMatch(/Stuffie/);
  });

  it('does not fire when count stays the same', () => {
    notifState.totalRequests = 3;
    const { wrapper } = makeSetup();
    const { rerender } = renderHook(() => useNotificationPolling(), { wrapper });

    act(() => { rerender(); });

    expect(notifFired).not.toHaveBeenCalled();
  });

  it('does not fire when count decreases', () => {
    notifState.totalRequests = 5;
    const { wrapper } = makeSetup();
    const { rerender } = renderHook(() => useNotificationPolling(), { wrapper });

    notifState.totalRequests = 2;
    act(() => { rerender(); });

    expect(notifFired).not.toHaveBeenCalled();
  });

  it('requests permission when it is "default"', () => {
    MockNotification.permission = 'default' as NotificationPermission;
    notifState.totalRequests = 0;
    const { wrapper } = makeSetup();
    const { rerender } = renderHook(() => useNotificationPolling(), { wrapper });

    notifState.totalRequests = 2;
    act(() => { rerender(); });

    expect(requestPermission).toHaveBeenCalledTimes(1);
  });
});
