import routes from './routes';
import config from './config';
import axios from 'axios';
const qs = require('querystring');

export const fetchSpotifyData = () => (
  axios.get(routes.spotify.fetch(), { headers: config.headers })
);

export const getToken = (clientId, clientSecret) => {
  const headers = {
    'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64')),
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  };

  return axios.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify({ grant_type: 'client_credentials' }),
    { headers }
  );
}

export const auth = token => {
  var options = {
    url: 'https://api.spotify.com/v1/users/jmperezperez',
    headers: { 'Authorization': 'Bearer ' + token }
  };
  return axios.get(options.url, { headers: options.headers });
}

export const search = (token, track, artist) => {
  var options = {
    url: `https://api.spotify.com/v1/search?q=track:${track}%20artist:${artist}&type=track`,
    headers: { 'Authorization': 'Bearer ' + token }
  };

  return axios.get(options.url, { headers: options.headers });
}
