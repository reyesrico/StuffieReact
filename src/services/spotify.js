/**
 * Spotify API Service
 * 
 * Purpose: Social media personalization feature
 * - Allows users to share music preferences
 * - Creates a more personalized social experience
 * - Integrates with Stuffie's friend/sharing features
 * 
 * @see https://developer.spotify.com/documentation/web-api
 */

import routes from './routes';
import config from './config';
import axios from 'axios';

/**
 * Fetches Spotify configuration data from backend
 */
export const fetchSpotifyData = () => (
  axios.get(routes.spotify.fetch(), { headers: config.headers })
);

/**
 * Gets Spotify access token using Client Credentials Flow
 * @see https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
 * 
 * @param clientId - Spotify App Client ID
 * @param clientSecret - Spotify App Client Secret
 * @returns Promise with access_token and expires_in
 */
export const getToken = async (clientId, clientSecret) => {
  // Use body params instead of Basic Auth header (better CORS compatibility)
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  });

  try {
    // Use fetch for better browser CORS handling
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Spotify token error:', error);
    throw error;
  }
};

/**
 * Search for tracks
 * @param token - Spotify access token
 * @param query - Search query
 * @param limit - Number of results
 */
export const searchTracks = async (token, query, limit = 50) => {
  try {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Spotify search error:', error);
    throw error;
  }
};

/**
 * Get tracks from a specific playlist
 * @param token - Spotify access token
 * @param playlistId - Spotify playlist ID
 */
export const getTracksFromPlaylist = (token, playlistId) => {
  const options = {
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    headers: { 'Authorization': `Bearer ${token}` }
  };

  return axios.get(options.url, { headers: options.headers });
};

/**
 * Get track details by ID
 * @param token - Spotify access token
 * @param trackId - Spotify track ID
 */
export const getTrack = (token, trackId) => {
  const options = {
    url: `https://api.spotify.com/v1/tracks/${trackId}`,
    headers: { 'Authorization': `Bearer ${token}` }
  };

  return axios.get(options.url, { headers: options.headers });
};
