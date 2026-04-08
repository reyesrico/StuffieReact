import React from 'react';
import { useTranslation } from 'react-i18next';

export const SPOTIFY_VISIBLE_KEY = 'stuffie_spotify_visible';

export function useSpotifyVisible() {
  const stored = localStorage.getItem(SPOTIFY_VISIBLE_KEY);
  const [visible, setVisible] = React.useState<boolean>(stored !== 'false');

  const toggle = () => {
    const next = !visible;
    localStorage.setItem(SPOTIFY_VISIBLE_KEY, String(next));
    setVisible(next);
    window.dispatchEvent(new StorageEvent('storage', { key: SPOTIFY_VISIBLE_KEY, newValue: String(next) }));
  };

  return { visible, toggle };
}

// Official Spotify logo mark — no FluentUI equivalent exists
const SpotifyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#1DB954" />
    <path
      d="M7.5 16.5c3.5-1.7 7.5-1.5 10.5.5M7 13c4-2 8-1.8 11.5.3M7.5 9.5c4.5-2.3 9-2 12.5.5"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const SpotifyToggle = () => {
  const { t } = useTranslation();
  const { visible, toggle } = useSpotifyVisible();

  return (
    <button
      type="button"
      className="settings__row"
      onClick={toggle}
      aria-pressed={visible}
    >
      <span className="settings__row-icon"><SpotifyIcon /></span>
      <span className="settings__row-label">{t('settings.spotifyLabel')}</span>
      <span className={`settings__row-badge${visible ? ' settings__row-badge--on' : ''}`}>
        {visible ? t('settings.chatOn') : t('settings.chatOff')}
      </span>
    </button>
  );
};

export default SpotifyToggle;
