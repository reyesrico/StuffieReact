/**
 * useFacebookAuth
 *
 * Uses Facebook's OAuth dialog (NOT the JS SDK) via a popup window.
 * The JS SDK blocks calls from http:// pages; the OAuth dialog approach
 * works on both http://localhost (dev) and https:// (prod).
 *
 * Flow:
 *   1. Open popup → https://www.facebook.com/v19.0/dialog/oauth
 *   2. Facebook redirects popup to /auth/facebook/callback.html
 *   3. Callback page reads access_token from hash, postMessages it back
 *   4. This hook resolves and calls onSuccess({ accessToken })
 *   5. Caller sends accessToken to backend which fetches profile via Graph API
 *
 * Returns:
 *   signIn      — opens the OAuth popup
 *   isLoading   — true while the popup flow is in progress
 *   isAvailable — true when VITE_FB_APP_ID is configured
 */
import { useState, useRef, useEffect } from 'react';

const FB_APP_ID = import.meta.env.VITE_FB_APP_ID || '';

// Vite's BASE_URL is '/' in dev and '/StuffieReact/' in production.
const getRedirectUri = () =>
  `${window.location.origin}${import.meta.env.BASE_URL}auth/facebook/callback.html`;

const buildAuthUrl = () => {
  const params = new URLSearchParams({
    client_id:     FB_APP_ID,
    redirect_uri:  getRedirectUri(),
    scope:         'email,public_profile',
    response_type: 'token',
  });
  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
};

// Popup dimensions
const POPUP_WIDTH  = 520;
const POPUP_HEIGHT = 600;

export interface FacebookAuthResult {
  accessToken: string;
}

interface UseFacebookAuthOptions {
  onSuccess: (result: FacebookAuthResult) => void;
  onError: (message: string) => void;
}

export const useFacebookAuth = ({ onSuccess, onError }: UseFacebookAuthOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef   = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current   = onError;

  const isAvailable = Boolean(FB_APP_ID);

  // Clean up message listener on unmount
  const cleanupRef = useRef<(() => void) | null>(null);
  useEffect(() => () => { cleanupRef.current?.(); }, []);

  const signIn = () => {
    if (!isAvailable || isLoading) return;
    setIsLoading(true);

    // Centre the popup
    const left = Math.round(window.screenX + (window.outerWidth  - POPUP_WIDTH)  / 2);
    const top  = Math.round(window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2);

    const popup = window.open(
      buildAuthUrl(),
      'fb_oauth',
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},toolbar=no,menubar=no`,
    );

    if (!popup) {
      onErrorRef.current('Popup blocked. Please allow popups for this site.');
      setIsLoading(false);
      return;
    }

    // Poll to detect if the user closes the popup without completing login
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        cleanup();
        setIsLoading(false);
        // Don't call onError — user dismissed intentionally
      }
    }, 500);

    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from same origin
      if (event.origin !== window.location.origin) return;

      const data = event.data as { type?: string; access_token?: string; error?: string };
      if (data?.type === 'fb_oauth_success' && data.access_token) {
        cleanup();
        setIsLoading(false);
        onSuccessRef.current({ accessToken: data.access_token });
      } else if (data?.type === 'fb_oauth_error') {
        cleanup();
        setIsLoading(false);
        onErrorRef.current(data.error || 'Facebook sign in failed. Please try again.');
      }
    };

    const cleanup = () => {
      clearInterval(pollTimer);
      window.removeEventListener('message', handleMessage);
      cleanupRef.current = null;
      if (!popup.closed) popup.close();
    };

    cleanupRef.current = cleanup;
    window.addEventListener('message', handleMessage);
  };

  return { signIn, isLoading, isAvailable };
};

export default useFacebookAuth;
