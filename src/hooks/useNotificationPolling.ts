/**
 * useNotificationPolling
 *
 * Runs while the user is logged in.
 * 1. Invalidates notification-related queries every 30s (skips hidden tabs).
 * 2. Fires a browser Notification when totalRequests increases.
 *    Requests permission the first time a new item arrives.
 */
import { useEffect, useRef, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import UserContext from '../context/UserContext';
import { useNotifications } from './queries/useNotifications';
import queryKeys from './queries/queryKeys';

const POLL_MS = 30_000; // 30 s when tab is visible

export const useNotificationPolling = () => {
  const { user } = useContext(UserContext);
  const qc = useQueryClient();
  const { totalRequests } = useNotifications();
  const prevCountRef = useRef<number | null>(null);
  const permAskedRef = useRef(false);
  const { t } = useTranslation();

  // Periodic invalidation — keeps badge + notification data fresh
  useEffect(() => {
    if (!user?.id) return;
    const userId = user.id;
    const email = user.email || '';

    const poll = () => {
      if (document.hidden) return; // don't waste requests on background tabs
      qc.invalidateQueries({ queryKey: queryKeys.exchanges.all(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.loans.all(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.purchases.all(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.friends.requests(email) });
    };

    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [user?.id, user?.email, qc]);

  // Browser notification when incoming request count rises
  useEffect(() => {
    // First render — initialise ref without firing
    if (prevCountRef.current === null) {
      prevCountRef.current = totalRequests;
      return;
    }

    if (totalRequests <= prevCountRef.current) {
      prevCountRef.current = totalRequests;
      return;
    }

    // Count increased — fire browser notification
    const delta = totalRequests - prevCountRef.current;
    prevCountRef.current = totalRequests;

    if (!('Notification' in window)) return;

    const fire = () => {
      new Notification(t('notifications.pushTitle'), {
        body: t('notifications.pushBody', { count: delta }),
        icon: `${import.meta.env.BASE_URL}images/stuffie-logo-light.svg`,
        tag: 'stuffie-notif', // deduplicates rapid-fire notifications
      });
    };

    if (Notification.permission === 'granted') {
      fire();
    } else if (Notification.permission !== 'denied' && !permAskedRef.current) {
      permAskedRef.current = true;
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') fire();
      });
    }
  }, [totalRequests, t]);
};
