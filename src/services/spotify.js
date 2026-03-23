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
export const getToken = (clientId, clientSecret) => {
  // Use btoa() for Base64 encoding (browser-native, replaces deprecated Buffer)
  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  const headers = {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  };

  // Use URLSearchParams instead of deprecated querystring module
  const body = new URLSearchParams({ grant_type: 'client_credentials' });

  return axios.post(
    'https://accounts.spotify.com/api/token',
    body.toString(),
    { headers }
  );
};

/**
 * Authenticates and gets user profile
 * @param token - Spotify access token
 */
export const auth = (token) => {
  const options = {
    url: 'https://api.spotify.com/v1/users/jmperezperez',
    headers: { 'Authorization': `Bearer ${token}` }
  };
  return axios.get(options.url, { headers: options.headers });
};

/**
 * Search for tracks by track name and artist
 * @param token - Spotify access token
 * @param track - Track name to search
 * @param artist - Artist name to search
 */
export const search = (token, track, artist) => {
  const query = encodeURIComponent(`track:${track} artist:${artist}`);
  const options = {
    url: `https://api.spotify.com/v1/search?q=${query}&type=track`,
    headers: { 'Authorization': `Bearer ${token}` }
  };

  return axios.get(options.url, { headers: options.headers });
};

/**
 * Get user's playlists
 * @param token - Spotify access token
 */
export const getPlaylists = (token) => {
  const userId = '1286537068';
  const options = {
    url: `https://api.spotify.com/v1/users/${userId}/playlists`,
    headers: { 'Authorization': `Bearer ${token}` }
  };

  return axios.get(options.url, { headers: options.headers });
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
