/**
 * webPush — browser-side Web Push subscription helpers
 *
 * registerAndSubscribe()  — call after login to opt in to background notifications.
 * unsubscribeFromPush()   — call on logout to clean up the server-side record.
 *
 * Requires:
 *   VITE_VAPID_PUBLIC_KEY — base64url P-256 public key (from generate-vapid-keys)
 *   VITE_CODEHOOKS_SERVER_URL + VITE_CODEHOOKS_API_KEY — already used by apiClient
 *
 * Silently no-ops if:
 *   - Browser doesn't support service workers or PushManager
 *   - VAPID public key env var is missing
 *   - User denies notification permission
 */

const SERVER_URL     = import.meta.env.VITE_CODEHOOKS_SERVER_URL ?? 'https://stuffie-2u0v.api.codehooks.io/dev/';
const API_KEY        = import.meta.env.VITE_CODEHOOKS_API_KEY    ?? '';
const VAPID_PUB_KEY  = import.meta.env.VITE_VAPID_PUBLIC_KEY     ?? '';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Convert a VAPID base64url string to Uint8Array for pushManager.subscribe() */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer  = new ArrayBuffer(rawData.length);
  const view    = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) view[i] = rawData.charCodeAt(i);
  return view;
}

function getStoredAccessToken(): string | null {
  try {
    const raw = localStorage.getItem('stuffie-session');
    if (!raw) return null;
    return JSON.parse(raw).accessToken ?? null;
  } catch {
    return null;
  }
}

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  const token = getStoredAccessToken();
  if (!token) return;

  await fetch(`${SERVER_URL}push-subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
      'x-apikey':      API_KEY,
    },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });
}

async function removeSubscriptionFromServer(): Promise<void> {
  const token = getStoredAccessToken();
  if (!token) return;

  await fetch(`${SERVER_URL}push-subscribe`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-apikey':      API_KEY,
    },
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register the service worker (if not already active) and subscribe the user
 * to Web Push. Sends the PushSubscription to the Stuffie backend for storage.
 *
 * Safe to call on every login — if the user is already subscribed, it just
 * re-syncs the subscription with the server (handles rotated endpoints).
 */
export async function registerAndSubscribe(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  if (!VAPID_PUB_KEY) return;

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check for an existing subscription first
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Ask permission if we don't have it yet
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUB_KEY),
      });
    }

    // Always re-sync with server (handles rotated endpoints / new logins)
    await sendSubscriptionToServer(subscription);
  } catch (err) {
    console.warn('Push subscription failed:', err);
  }
}

/**
 * Unsubscribe from Web Push and remove the server-side subscription record.
 * Should be called on logout.
 */
export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    await subscription.unsubscribe();
    await removeSubscriptionFromServer();
  } catch (err) {
    console.warn('Push unsubscribe failed:', err);
  }
}
