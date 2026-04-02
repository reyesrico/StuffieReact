import { useEffect, useRef } from 'react';

const TOUCH_THRESHOLD = 80;  // px downward pull needed to trigger
const COOLDOWN_MS = 2000;    // ms before another refresh can be triggered

/**
 * Triggers `onRefresh` when the user pulls DOWN from the top of the page,
 * matching the Facebook / Instagram pull-to-refresh gesture on mobile.
 *
 * Only touch events are used. Desktop wheel events are intentionally omitted
 * because there is no clean "pull down" equivalent without conflicting with
 * normal downward page scrolling.
 *
 * A 2-second cooldown prevents duplicate triggers.
 */
export function usePullToRefresh(onRefresh: () => void): void {
  const onRefreshRef = useRef(onRefresh);
  const touchStartY = useRef(0);
  const inCooldown = useRef(false);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  useEffect(() => {
    const trigger = () => {
      if (inCooldown.current) return;
      inCooldown.current = true;
      onRefreshRef.current();
      setTimeout(() => {
        inCooldown.current = false;
      }, COOLDOWN_MS);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      // Positive dy = finger moved down = pull-down gesture at top of page
      if (window.scrollY === 0 && dy > TOUCH_THRESHOLD) {
        trigger();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
}
