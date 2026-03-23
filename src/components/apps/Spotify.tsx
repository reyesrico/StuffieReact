/**
 * Spotify Component
 * 
 * Purpose: Social media personalization feature
 * - Displays user's Spotify playlists and tracks
 * - Part of the personalized social experience
 * - Allows users to share music preferences with friends
 */

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import State from '../../redux/State';
import { getToken, getPlaylists, getTracksFromPlaylist } from '../../services/spotify';

import './Spotify.scss';

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { total: number };
}

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: { spotify: string };
  preview_url: string | null;
  duration_ms: number;
}

const Spotify = () => {
  const spotifyConf = useSelector((state: State) => state.spotifyConf);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Use backend config or fall back to environment variables
  const clientId = spotifyConf?.key || process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const clientSecret = spotifyConf?.secret || process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

  const [token, setToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Player controls
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');

  // Get only tracks with preview URLs
  const playableTracks = useMemo(() => 
    tracks.filter(t => t.preview_url),
  [tracks]);

  const playableCount = playableTracks.length;

  // Fetch token and playlists on mount
  useEffect(() => {
    if (!clientId || !clientSecret) {
      setIsLoading(false);
      setError('Spotify credentials not configured. Add REACT_APP_SPOTIFY_CLIENT_ID and REACT_APP_SPOTIFY_CLIENT_SECRET to your .env file.');
      return;
    }

    let isMounted = true;

    const fetchPlaylists = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const tokenRes = await getToken(clientId, clientSecret);
        const accessToken = tokenRes.data.access_token;
        
        if (!isMounted) return;
        setToken(accessToken);

        const playlistsRes = await getPlaylists(accessToken);
        
        if (!isMounted) return;
        setPlaylists(playlistsRes.data.items || []);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load Spotify playlists');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPlaylists();

    return () => {
      isMounted = false;
    };
  }, [clientId, clientSecret]);

  // Fetch tracks when a playlist is selected
  const handleSelectPlaylist = useCallback(async (playlist: Playlist) => {
    if (!token) return;

    setSelectedPlaylist(playlist);
    setTracks([]);
    setCurrentTrackIndex(null);
    setIsLoadingTracks(true);

    try {
      const tracksRes = await getTracksFromPlaylist(token, playlist.id);
      const trackItems = tracksRes.data.items
        .filter((item: any) => item.track)
        .map((item: any) => item.track);
      setTracks(trackItems);
    } catch (err) {
      setError('Failed to load tracks');
    } finally {
      setIsLoadingTracks(false);
    }
  }, [token]);

  // Find next playable track index
  const findNextPlayableIndex = useCallback((fromIndex: number, direction: 1 | -1 = 1): number | null => {
    if (playableTracks.length === 0) return null;
    
    // Find the playable track in the original tracks array
    let searchIndex = fromIndex;
    let attempts = 0;
    
    while (attempts < tracks.length) {
      searchIndex = (searchIndex + direction + tracks.length) % tracks.length;
      if (tracks[searchIndex]?.preview_url) {
        return searchIndex;
      }
      attempts++;
    }
    return null;
  }, [tracks, playableTracks.length]);

  // Get random playable track
  const getRandomPlayableIndex = useCallback((): number | null => {
    if (playableTracks.length === 0) return null;
    const randomPlayable = playableTracks[Math.floor(Math.random() * playableTracks.length)];
    return tracks.findIndex(t => t.id === randomPlayable.id);
  }, [tracks, playableTracks]);

  const handlePlayTrack = useCallback((index: number) => {
    if (!tracks[index]?.preview_url) return;
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  }, [tracks]);

  const handlePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleNextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    
    if (repeat === 'one' && currentTrackIndex !== null) {
      // Replay current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    let nextIndex: number | null;
    
    if (shuffle) {
      nextIndex = getRandomPlayableIndex();
    } else {
      nextIndex = findNextPlayableIndex(currentTrackIndex ?? -1, 1);
    }

    if (nextIndex !== null) {
      // Check if we've looped around
      if (nextIndex <= (currentTrackIndex ?? 0) && repeat === 'off') {
        // Stop playing if we've gone through all tracks and repeat is off
        setIsPlaying(false);
        return;
      }
      setCurrentTrackIndex(nextIndex);
      setIsPlaying(true);
    }
  }, [currentTrackIndex, tracks.length, shuffle, repeat, findNextPlayableIndex, getRandomPlayableIndex]);

  const handlePrevTrack = useCallback(() => {
    if (tracks.length === 0 || currentTrackIndex === null) return;

    // If more than 3 seconds in, restart current track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const prevIndex = findNextPlayableIndex(currentTrackIndex, -1);
    if (prevIndex !== null) {
      setCurrentTrackIndex(prevIndex);
      setIsPlaying(true);
    }
  }, [currentTrackIndex, tracks.length, findNextPlayableIndex]);

  const handlePlayAll = useCallback(() => {
    const firstPlayable = findNextPlayableIndex(-1, 1);
    if (firstPlayable !== null) {
      setCurrentTrackIndex(firstPlayable);
      setIsPlaying(true);
    }
  }, [findNextPlayableIndex]);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const handleBackToPlaylists = useCallback(() => {
    setSelectedPlaylist(null);
    setTracks([]);
    setCurrentTrackIndex(null);
    setIsPlaying(false);
  }, []);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="spotify spotify--loading">
        <Loading size="lg" message="Loading Spotify..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="spotify spotify--error">
        <div className="spotify__error-icon">🎵</div>
        <h3>Spotify Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Show current playing track
  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  return (
    <div className="spotify">
      <div className="spotify__header">
        <h2>🎵 Spotify</h2>
        {selectedPlaylist && (
          <Button text="← Back to Playlists" onClick={handleBackToPlaylists} />
        )}
      </div>

      {/* Now Playing Section */}
      {currentTrack && currentTrack.preview_url && (
        <div className="spotify__player">
          <img 
            src={currentTrack.album.images[0]?.url || ''} 
            alt={currentTrack.album.name}
            className="spotify__player-image"
          />
          <div className="spotify__player-info">
            <div className="spotify__player-title">{currentTrack.name}</div>
            <div className="spotify__player-artist">
              {currentTrack.artists.map(a => a.name).join(', ')}
            </div>
            <div className="spotify__player-album">{currentTrack.album.name}</div>
            <a 
              href={currentTrack.external_urls?.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="spotify__player-open"
            >
              Open full song in Spotify ↗
            </a>
          </div>
          <div className="spotify__player-controls">
            <button 
              className={`spotify__control-btn spotify__control-btn--small ${shuffle ? 'spotify__control-btn--active' : ''}`}
              onClick={toggleShuffle}
              title="Shuffle"
            >
              🔀
            </button>
            <button className="spotify__control-btn" onClick={handlePrevTrack} title="Previous">⏮</button>
            <button className="spotify__control-btn spotify__control-btn--play" onClick={handlePlayPause}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="spotify__control-btn" onClick={handleNextTrack} title="Next">⏭</button>
            <button 
              className={`spotify__control-btn spotify__control-btn--small ${repeat !== 'off' ? 'spotify__control-btn--active' : ''}`}
              onClick={toggleRepeat}
              title={`Repeat: ${repeat}`}
            >
              {repeat === 'one' ? '🔂' : '🔁'}
            </button>
          </div>
          <audio
            ref={audioRef}
            key={currentTrack.id}
            autoPlay
            className="spotify__audio"
            src={currentTrack.preview_url}
            onEnded={handleNextTrack}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      )}

      {/* Playlists Grid */}
      {!selectedPlaylist && (
        <div className="spotify__playlists">
          <h3>Your Playlists ({playlists.length})</h3>
          {playlists.length === 0 ? (
            <p className="spotify__empty">No playlists found. Create some playlists on Spotify!</p>
          ) : (
            <div className="spotify__grid">
              {playlists.map((playlist) => (
                <div 
                  key={playlist.id} 
                  className="spotify__playlist-card"
                  onClick={() => handleSelectPlaylist(playlist)}
                >
                  <img 
                    src={playlist.images[0]?.url || 'https://via.placeholder.com/150?text=No+Image'} 
                    alt={playlist.name}
                    className="spotify__playlist-image"
                  />
                  <div className="spotify__playlist-info">
                    <div className="spotify__playlist-name">{playlist.name}</div>
                    <div className="spotify__playlist-count">{playlist.tracks.total} tracks</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tracks List */}
      {selectedPlaylist && (
        <div className="spotify__tracks">
          <div className="spotify__tracks-header">
            <h3>{selectedPlaylist.name}</h3>
            {playableCount > 0 && (
              <button className="spotify__play-all" onClick={handlePlayAll}>
                ▶ Play All Previews ({playableCount})
              </button>
            )}
          </div>
          <p className="spotify__tracks-note">
            🎧 {playableCount} of {tracks.length} tracks have 30-second previews available. 
            Click ▶ to play or 🔗 to open full song in Spotify.
          </p>
          {isLoadingTracks ? (
            <Loading size="md" message="Loading tracks..." />
          ) : tracks.length === 0 ? (
            <p className="spotify__empty">No tracks in this playlist.</p>
          ) : (
            <div className="spotify__track-list">
              {tracks.map((track, index) => (
                <div 
                  key={track.id || index}
                  className={`spotify__track ${currentTrackIndex === index ? 'spotify__track--playing' : ''} ${track.preview_url ? 'spotify__track--has-preview' : ''}`}
                  onClick={() => track.preview_url && handlePlayTrack(index)}
                >
                  <div className="spotify__track-play">
                    {track.preview_url ? (currentTrackIndex === index && isPlaying ? '⏸' : '▶') : '—'}
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
                    title="Open in Spotify"
                  >
                    🔗
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Spotify;
