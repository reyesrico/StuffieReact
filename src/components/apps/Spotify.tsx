import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Loading from '../shared/Loading';
import { useSpotify, type Track } from '../../context/SpotifyContext';

import './Spotify.scss';

// Playing bars icon
const PlayingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954" aria-hidden="true">
    <rect x="3" y="8" width="4" height="13" rx="1" />
    <rect x="10" y="4" width="4" height="17" rx="1" />
    <rect x="17" y="10" width="4" height="11" rx="1" />
  </svg>
);

// Play arrow icon
const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

// External link icon
const LinkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const Spotify = () => {
  const { t } = useTranslation();
  const { tracks, selectedTrack, searchTitle, isLoading, isSearching, error, selectTrack, search } = useSpotify();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await search(searchQuery);
  }, [search, searchQuery]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="spotify spotify--loading">
        <Loading size="lg" message={t('spotify.connecting')} />
      </div>
    );
  }

  if (error && tracks.length === 0) {
    return (
      <div className="spotify spotify--error">
        <h3>{t('spotify.errorTitle')}</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="spotify">
      <div className="spotify__header">
        <h2>{t('spotify.title')}</h2>
      </div>

      {/* Search */}
      <form className="spotify__search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder={t('spotify.searchPlaceholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="spotify__search-input"
        />
        <button
          type="submit"
          className="spotify__search-btn"
          disabled={!searchQuery.trim() || isSearching}
        >
          {isSearching ? '...' : t('spotify.searchButton')}
        </button>
      </form>

      {/* Track list */}
      <div className="spotify__tracks">
        <div className="spotify__tracks-header">
          <h3>
            {searchTitle
              ? t('spotify.results', { query: searchTitle })
              : t('spotify.tracks')}
          </h3>
        </div>

        {isSearching ? (
          <Loading size="md" message={t('spotify.searching')} />
        ) : tracks.length === 0 ? (
          <p className="spotify__empty">{t('spotify.noResults')}</p>
        ) : (
          <div className="spotify__track-list">
            {tracks.map((track: Track) => (
              <div
                key={track.id}
                className={`spotify__track spotify__track--clickable${selectedTrack?.id === track.id ? ' spotify__track--selected' : ''}`}
                onClick={() => selectTrack(track)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') selectTrack(track); }}
                aria-label={`${track.name} by ${track.artists.map(a => a.name).join(', ')}`}
              >
                <div className="spotify__track-play">
                  {selectedTrack?.id === track.id ? <PlayingIcon /> : <PlayIcon />}
                </div>
                <img
                  src={track.album.images[2]?.url || track.album.images[0]?.url || ''}
                  alt={track.album.name}
                  className="spotify__track-image"
                />
                <div className="spotify__track-info">
                  <div className="spotify__track-name">{track.name}</div>
                  <div className="spotify__track-artist">
                    {track.artists.map(a => a.name).join(', ')}
                  </div>
                </div>
                <div className="spotify__track-duration">
                  {formatDuration(track.duration_ms)}
                </div>
                <a
                  href={track.external_urls?.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="spotify__track-link"
                  onClick={e => e.stopPropagation()}
                  title={t('spotify.openInApp')}
                >
                  <LinkIcon />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Spotify;
