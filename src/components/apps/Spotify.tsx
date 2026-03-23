/**
 * Spotify Component
 * 
 * Purpose: Social media personalization feature
 * - Displays user's Spotify playlists and tracks
 * - Part of the personalized social experience
 * - Allows users to share music preferences with friends
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'lodash';

import State from '../../redux/State';
import { getToken, search, getPlaylists, getTracksFromPlaylist } from '../../services/spotify';

import './Spotify.scss';

const Spotify = () => {
  const spotifyConf = useSelector((state: State) => state.spotifyConf);

  const [items, setItems] = useState<any[]>([]);
  const [tracks, setTracks] = useState<string[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Spotify data on mount or when credentials change
  useEffect(() => {
    if (!spotifyConf?.key || !spotifyConf?.secret) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchSpotifyData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get access token
        const tokenRes = await getToken(spotifyConf.key, spotifyConf.secret);
        const token = tokenRes.data.access_token;
        
        if (!isMounted) return;

        // Get playlists
        const playlistsRes = await getPlaylists(token);
        const playlists = playlistsRes.data.items;
        const rockPlaylist = playlists.find((item: any) => item.name === 'Rock');

        if (!rockPlaylist) {
          throw new Error('Rock playlist not found');
        }

        // Get tracks from playlist
        const tracksRes = await getTracksFromPlaylist(token, rockPlaylist.id);
        const playlistItems = tracksRes.data.items;
        
        const trackUrls = playlistItems
          .filter((item: any) => item.track?.preview_url)
          .map((item: any) => item.track.preview_url);
        
        const albumImages = playlistItems
          .filter((item: any) => item.track?.album?.images?.[0])
          .map((item: any) => item.track.album.images[0]);

        if (!isMounted) return;
        setTracks(trackUrls);
        setAlbums(albumImages);

        // Search for a specific track
        const searchRes = await search(token, 'Musica Ligera', 'Soda Stereo');
        if (isMounted) {
          setItems(searchRes.data.tracks.items);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load Spotify data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSpotifyData();

    return () => {
      isMounted = false;
    };
  }, [spotifyConf?.key, spotifyConf?.secret]);

  const handleTrack = useCallback(() => {
    setCurrentTrack(prev => (prev + 1) % tracks.length || 0);
  }, [tracks.length]);

  if (isLoading) return <div className="spotify spotify--loading">Loading Spotify...</div>;
  if (error) return <div className="spotify spotify--error">{error}</div>;
  if (!items.length) return <div className="spotify spotify--empty"></div>;

  const image = get(items[0], 'album.images[0]');

  return (
    <div className="spotify">
      {image && albums[currentTrack] && (
        <img src={albums[currentTrack].url || albums[currentTrack]} height="30" width="30" alt="Album cover" />
      )}
      <audio
        aria-label="Spotify track player"
        autoPlay={false}
        className="spotify__audio"
        controls={true}
        src={tracks[currentTrack]}
      />
      <button onClick={handleTrack} disabled={tracks.length <= 1}>Next</button>
    </div>
  );
};

export default Spotify;
