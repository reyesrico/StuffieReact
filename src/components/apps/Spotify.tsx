/**
 * Spotify Component
 * 
 * Purpose: Social media personalization feature
 * - Search and browse Spotify tracks
 * - Play using Spotify's embed player
 * - Part of the personalized social experience
 * 
 * Note: Spotify removed preview_url from their API in 2024.
 * Using Spotify embed player for playback instead.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

import Loading from '../shared/Loading';
import State from '../../redux/State';
import { getToken, searchTracks } from '../../services/spotify';

import './Spotify.scss';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: { spotify: string };
  duration_ms: number;
}

const Spotify = () => {
  const spotifyConf = useSelector((state: State) => state.spotifyConf);

  // Use backend config or fall back to environment variables
  const clientId = spotifyConf?.key || import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = spotifyConf?.secret || import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  const [token, setToken] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTitle, setSearchTitle] = useState('');

  // Initialize - get token and load initial tracks
  useEffect(() => {
    if (!clientId || !clientSecret) {
      setIsLoading(false);
      setError('Spotify credentials not configured. Add VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET to your .env file.');
      return;
    }

    let isMounted = true;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const tokenRes = await getToken(clientId, clientSecret);
        const accessToken = tokenRes.data.access_token;
        
        if (!isMounted) return;
        setToken(accessToken);

        // Search for popular tracks on initial load
        const searchRes = await searchTracks(accessToken, 'Bad Bunny', 20);
        
        if (!isMounted) return;
        const initialTracks = searchRes.data.tracks?.items || [];
        setTracks(initialTracks);
        setSearchTitle('Bad Bunny');
        
        // Auto-select first track
        if (initialTracks.length > 0) {
          setSelectedTrack(initialTracks[0]);
        }
      } catch (err) {
        console.error('Spotify error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect to Spotify');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [clientId, clientSecret]);
  
  // Handle search
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const res = await searchTracks(token, searchQuery);
      const searchResults = res.data.tracks?.items || [];
      setTracks(searchResults);
      setSearchTitle(searchQuery);
      
      // Auto-select first result
      if (searchResults.length > 0) {
        setSelectedTrack(searchResults[0]);
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [token, searchQuery]);

  const handleSelectTrack = useCallback((track: Track) => {
    setSelectedTrack(track);
  }, []);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="spotify spotify--loading">
        <Loading size="lg" message="Connecting to Spotify..." />
      </div>
    );
  }

  if (error && tracks.length === 0) {
    return (
      <div className="spotify spotify--error">
        <div className="spotify__error-icon">🎵</div>
        <h3>Spotify Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="spotify">
      <div className="spotify__header">
        <h2>🎵 Spotify</h2>
      </div>

      {/* Search Bar */}
      <form className="spotify__search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for songs, artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="spotify__search-input"
        />
        <button type="submit" className="spotify__search-btn" disabled={!searchQuery.trim() || isSearching}>
          {isSearching ? '...' : '🔍 Search'}
        </button>
      </form>

      {/* Spotify Embed Player */}
      {selectedTrack && (
        <div className="spotify__embed-container">
          <iframe
            title="Spotify Player"
            src={`https://open.spotify.com/embed/track/${selectedTrack.id}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="spotify__embed"
          />
        </div>
      )}

      {/* Tracks List */}
      <div className="spotify__tracks">
        <div className="spotify__tracks-header">
          <h3>{searchTitle ? `Results: "${searchTitle}"` : 'Tracks'}</h3>
        </div>
        <p className="spotify__tracks-note">
          🎵 Click a track to play it using the Spotify player above.
        </p>
        {isSearching ? (
          <Loading size="md" message="Searching..." />
        ) : tracks.length === 0 ? (
          <p className="spotify__empty">No results found. Try a different search.</p>
        ) : (
          <div className="spotify__track-list">
            {tracks.map((track) => (
              <div 
                key={track.id}
                className={`spotify__track spotify__track--clickable ${selectedTrack?.id === track.id ? 'spotify__track--selected' : ''}`}
                onClick={() => handleSelectTrack(track)}
              >
                <div className="spotify__track-play">
                  {selectedTrack?.id === track.id ? '🔊' : '▶'}
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
                  onClick={(e) => e.stopPropagation()}
                  title="Open in Spotify app"
                >
                  🔗
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
