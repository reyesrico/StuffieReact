/**
 * useFacebookAuth
 *
 * Lazily loads the Facebook JS SDK from CDN and wraps FB.login() in a
 * promise-based hook. Only active when VITE_FB_APP_ID is set.
 *
 * Returns:
 *   signIn      — triggers the FB.login popup
 *   isLoading   — true while the SDK is loading
 *   isAvailable — true once the SDK is ready
 */

const FB_APP_ID = import.meta.env.VITE_FB_APP_ID || '';

interface FacebookAuthResult {
  accessToken: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

interface UseFacebookAuthOptions {
  onSuccess: (result: FacebookAuthResult) => void;
  onError: (message: string) => void;
}

// Singleton load promise — only inject the script once
let _sdkPromise: Promise<void> | null = null;

const loadFacebookSDK = (): Promise<void> => {
  if (_sdkPromise) return _sdkPromise;

  _sdkPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).FB) {
      resolve();
      return;
    }

    // Facebook SDK async loader
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      (window as any).FB.init({
        appId:   FB_APP_ID,
        cookie:  true,
        xfbml:   false,
        version: 'v19.0',
      });
      resolve();
    };

    script.onerror = () => {
      _sdkPromise = null; // allow retry
      reject(new Error('Failed to load Facebook SDK'));
    };

    document.head.appendChild(script);
  });

  return _sdkPromise;
};

import { useState, useEffect, useRef } from 'react';

export const useFacebookAuth = ({ onSuccess, onError }: UseFacebookAuthOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef   = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current   = onError;

  useEffect(() => {
    if (!FB_APP_ID) return;
    loadFacebookSDK()
      .then(() => setIsAvailable(true))
      .catch(() => {}); // silent — button just won't show
  }, []);

  const signIn = async () => {
    if (!isAvailable) return;
    setIsLoading(true);

    try {
      await loadFacebookSDK(); // ensure ready

      const FB = (window as any).FB;

      // Step 1: login popup
      const loginResponse = await new Promise<any>((resolve) => {
        FB.login((res: any) => resolve(res), { scope: 'email,public_profile' });
      });

      if (loginResponse.status !== 'connected') {
        // User cancelled or denied
        return;
      }

      const accessToken = loginResponse.authResponse.accessToken;

      // Step 2: fetch profile info via Graph API
      const meResponse = await new Promise<any>((resolve) => {
        FB.api('/me', { fields: 'email,first_name,last_name,picture.type(large)' }, (data: any) => resolve(data));
      });

      onSuccessRef.current({
        accessToken,
        email:     meResponse.email     ?? null,
        firstName: meResponse.first_name  ?? null,
        lastName:  meResponse.last_name   ?? null,
        avatar:    meResponse.picture?.data?.url ?? null,
      });
    } catch (err: any) {
      onErrorRef.current(err?.message || 'Facebook sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading, isAvailable };
};

export default useFacebookAuth;
