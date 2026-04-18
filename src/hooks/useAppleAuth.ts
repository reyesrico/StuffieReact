/**
 * useAppleAuth — Sign in with Apple (web)
 *
 * Loads Apple's JS SDK on first use (no npm dep), then triggers the sign-in
 * popup when `signIn()` is called. Returns the id_token and any user info
 * that Apple provides (name and email are only sent on the FIRST sign-in).
 *
 * Setup required in Apple Developer Portal:
 *   1. Create a Services ID (e.g. com.stuffie.web) — set as VITE_APPLE_CLIENT_ID
 *   2. Enable "Sign in with Apple" and add the app domain + redirect URI
 *   3. The redirect URI should be your app's base URL (used even in popup mode)
 *
 * Reference: https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js
 */
import { useCallback, useState } from 'react';

// ── Type declarations ────────────────────────────────────────────────────────
interface AppleAuthConfig {
  clientId: string;
  scope: string;
  redirectURI: string;
  state?: string;
  usePopup?: boolean;
}

interface AppleName {
  firstName?: string;
  lastName?: string;
}

interface AppleSignInResult {
  authorization: {
    code: string;
    id_token: string;
    state?: string;
  };
  user?: {
    email?: string;
    name?: AppleName;
  };
}

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: AppleAuthConfig) => void;
        signIn: () => Promise<AppleSignInResult>;
      };
    };
  }
}

// ── Config ───────────────────────────────────────────────────────────────────
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID || '';
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI
  || (typeof window !== 'undefined' ? `${window.location.origin}${import.meta.env.BASE_URL || '/'}` : '');

// ── Script loader ─────────────────────────────────────────────────────────────
let scriptPromise: Promise<void> | null = null;

const loadAppleScript = (): Promise<void> => {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.AppleID) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Failed to load Apple Sign In SDK'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
};

// ── Hook ─────────────────────────────────────────────────────────────────────
export interface AppleAuthSuccessPayload {
  idToken: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface UseAppleAuthOptions {
  onSuccess: (payload: AppleAuthSuccessPayload) => void | Promise<void>;
  onError?: (error: string) => void;
}

interface UseAppleAuthReturn {
  signIn: () => Promise<void>;
  isLoading: boolean;
  isAvailable: boolean;
}

export const useAppleAuth = ({ onSuccess, onError }: UseAppleAuthOptions): UseAppleAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const isAvailable = Boolean(APPLE_CLIENT_ID);

  const signIn = useCallback(async () => {
    if (!APPLE_CLIENT_ID) {
      onError?.('Apple Sign In is not configured (VITE_APPLE_CLIENT_ID missing)');
      return;
    }

    setIsLoading(true);
    try {
      await loadAppleScript();

      window.AppleID!.auth.init({
        clientId:   APPLE_CLIENT_ID,
        scope:      'name email',
        redirectURI: APPLE_REDIRECT_URI,
        state:      Math.random().toString(36).slice(2), // CSRF token
        usePopup:   true,
      });

      const result = await window.AppleID!.auth.signIn();

      const idToken   = result.authorization.id_token;
      const firstName = result.user?.name?.firstName;
      const lastName  = result.user?.name?.lastName;
      const email     = result.user?.email;

      await onSuccess({ idToken, firstName, lastName, email });
    } catch (err: any) {
      // Apple's SDK throws { error: 'popup_closed_by_user' } when user cancels
      if (err?.error !== 'popup_closed_by_user') {
        onError?.(err?.error || err?.message || 'Apple Sign In failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  return { signIn, isLoading, isAvailable };
};
