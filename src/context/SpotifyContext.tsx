import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getToken, searchTracks } from '../api/external/spotify';

export interface Track {
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

interface SpotifyContextType {
  tracks: Track[];
  selectedTrack: Track | null;
  searchTitle: string;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  selectTrack: (track: Track) => void;
  search: (query: string) => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export const useSpotify = (): SpotifyContextType => {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error('useSpotify must be used within SpotifyProvider');
  return ctx;
};

export const SpotifyProvider = ({ children }: { children: React.ReactNode }) => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  const [token, setToken] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [searchTitle, setSearchTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId || !clientSecret) {
      setIsLoading(false);
      setError('Spotify credentials not configured.');
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const tokenRes = await getToken(clientId, clientSecret);
        const accessToken = tokenRes.data.access_token;
        if (!isMounted) return;
        setToken(accessToken);

        const res = await searchTracks(accessToken, 'Bad Bunny', 20);
        if (!isMounted) return;
        const items: Track[] = res.data.tracks?.items || [];
        setTracks(items);
        setSearchTitle('Bad Bunny');
        if (items.length > 0) setSelectedTrack(items[0]);
      } catch {
        if (isMounted) setError('Failed to connect to Spotify');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [clientId, clientSecret]);

  const search = useCallback(async (query: string) => {
    if (!token || !query.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const res = await searchTracks(token, query);
      const items: Track[] = res.data.tracks?.items || [];
      setTracks(items);
      setSearchTitle(query);
      if (items.length > 0) setSelectedTrack(items[0]);
    } catch {
      setError('Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [token]);

  const selectTrack = useCallback((track: Track) => {
    setSelectedTrack(track);
  }, []);

  return (
    <SpotifyContext.Provider value={{
      tracks, selectedTrack, searchTitle,
      isLoading, isSearching, error,
      selectTrack, search,
    }}>
      {children}
    </SpotifyContext.Provider>
  );
};

export default SpotifyContext;
