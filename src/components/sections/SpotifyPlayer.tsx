import React from 'react';
import { Link } from 'react-router-dom';
import { useSpotify } from '../../context/SpotifyContext';
import Loading from '../shared/Loading';


import './SpotifyPlayer.scss';

// Spotify logo mark
const SpotifyLogo = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
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

// External link icon
const ExternalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

interface SpotifyPlayerProps {
  variant?: 'sidebar' | 'bar';
}

const SpotifyPlayer = ({ variant = 'sidebar' }: SpotifyPlayerProps) => {
  const { selectedTrack, isLoading, error } = useSpotify();
  const [embedOpen, setEmbedOpen] = React.useState(false);

  // ── Mobile bar ──────────────────────────────────────────────────────────────
  if (variant === 'bar') {
    if (!selectedTrack) return null;
    return (
      <iframe
        key={selectedTrack.id}
        title="Spotify Player"
        src={`https://open.spotify.com/embed/track/${selectedTrack.id}?utm_source=generator&theme=0`}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        style={{ display: 'block', border: 'none' }}
      />
    );
  }

  // ── Sidebar widget ──────────────────────────────────────────────────────────
  return (
    <div className="spotify-player">
      <div className="spotify-player__header">
        <div className="spotify-player__label">
          <SpotifyLogo size={14} />
          <span>Now Playing</span>
        </div>
        <Link to="/spotify" className="spotify-player__browse-link">
          Browse
          <ExternalIcon />
        </Link>
      </div>

      {isLoading && (
        <div className="spotify-player__state">
          <Loading size="sm" />
        </div>
      )}

      {!isLoading && error && !selectedTrack && (
        <div className="spotify-player__state spotify-player__state--error">
          {error}
        </div>
      )}

      {!isLoading && !selectedTrack && !error && (
        <div className="spotify-player__state">
          <Link to="/spotify" className="spotify-player__start-link">
            Browse tracks to start listening
          </Link>
        </div>
      )}

      {!isLoading && selectedTrack && (
        <iframe
          key={selectedTrack.id}
          title="Spotify Player"
          src={`https://open.spotify.com/embed/track/${selectedTrack.id}?utm_source=generator&theme=0`}
          width="100%"
          height="80"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="spotify-player__embed"
        />
      )}
    </div>
  );
};

export default SpotifyPlayer;
