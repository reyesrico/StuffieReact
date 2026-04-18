/**
 * SocialAuthButtons — Google and Apple sign-in buttons
 *
 * Each button only renders when its env var is set:
 *   VITE_GOOGLE_CLIENT_ID  — shows Google button
 *   VITE_APPLE_CLIENT_ID   — shows Apple button
 *
 * The entire component returns null if neither is configured.
 * Used on both LoginPage and RegisterPage.
 */
import React, { useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';

import { useAppleAuth } from '../../hooks/useAppleAuth';
import { socialLogin } from '../../api/users.api';
import UserContext from '../../context/UserContext';
import type User from '../types/User';

import './SocialAuthButtons.scss';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const APPLE_CLIENT_ID  = import.meta.env.VITE_APPLE_CLIENT_ID  || '';

// ── Brand SVG Icons ───────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg className="social-btn__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg className="social-btn__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.32 2.99-2.53 4.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      fill="currentColor"
    />
  </svg>
);

// ── Interfaces ────────────────────────────────────────────────────────────────

interface SocialAuthButtonsProps {
  onSuccess: (user: User) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

interface GoogleSignInButtonProps {
  onSuccess: (user: User) => void;
  onError?: (msg: string) => void;
  disabled?: boolean;
}

// ── Google sub-component ──────────────────────────────────────────────────────
// Must be its own component so useGoogleLogin() is always called at the top
// level — never conditionally. Only rendered when GOOGLE_CLIENT_ID is set
// and GoogleOAuthProvider is in the tree (see App.tsx).

const GoogleSignInButton = ({ onSuccess, onError, disabled }: GoogleSignInButtonProps) => {
  const { t } = useTranslation();
  const { loginUser } = useContext(UserContext);
  const [loading, setLoading] = React.useState(false);

  const handleSuccess = async (access_token: string) => {
    setLoading(true);
    try {
      const user = await socialLogin('google', access_token);
      loginUser(user);
      onSuccess(user);
    } catch (err: any) {
      onError?.(err?.response?.data?.error || t('social.googleError'));
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (res) => handleSuccess(res.access_token),
    onError:   ()    => onError?.(t('social.googleError')),
    flow:      'implicit',
  });

  return (
    <button
      type="button"
      className="social-btn social-btn--google"
      onClick={() => googleLogin()}
      disabled={disabled || loading}
      aria-label={t('social.googleLabel')}
    >
      {loading ? <span className="social-btn__spinner" /> : <GoogleIcon />}
      <span className="social-btn__text">{t('social.googleText')}</span>
    </button>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const SocialAuthButtons = ({ onSuccess, onError, disabled = false }: SocialAuthButtonsProps) => {
  const { t } = useTranslation();
  const { loginUser } = useContext(UserContext);
  const [appleLoading, setAppleLoading] = React.useState(false);

  const { signIn: appleSignIn } = useAppleAuth({
    onSuccess: async ({ idToken, firstName, lastName }) => {
      setAppleLoading(true);
      try {
        const user = await socialLogin('apple', idToken, firstName, lastName);
        loginUser(user);
        onSuccess(user);
      } catch (err: any) {
        onError?.(err?.response?.data?.error || t('social.appleError'));
      } finally {
        setAppleLoading(false);
      }
    },
    onError: (msg) => onError?.(msg || t('social.appleError')),
  });

  // Return null if neither provider is configured
  if (!GOOGLE_CLIENT_ID && !APPLE_CLIENT_ID) return null;

  return (
    <div className="social-auth">
      <div className="social-auth__divider">
        <span className="social-auth__divider-text">{t('social.divider')}</span>
      </div>

      <div className="social-auth__buttons">
        {/* Google — only shown when VITE_GOOGLE_CLIENT_ID is set */}
        {GOOGLE_CLIENT_ID && (
          <GoogleSignInButton
            onSuccess={onSuccess}
            onError={onError}
            disabled={disabled || appleLoading}
          />
        )}

        {/* Apple — only shown when VITE_APPLE_CLIENT_ID is set */}
        {APPLE_CLIENT_ID && (
          <button
            type="button"
            className="social-btn social-btn--apple"
            onClick={appleSignIn}
            disabled={disabled || appleLoading}
            aria-label={t('social.appleLabel')}
          >
            {appleLoading ? <span className="social-btn__spinner" /> : <AppleIcon />}
            <span className="social-btn__text">{t('social.appleText')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SocialAuthButtons;
