import axios from 'axios';
const qs = require('querystring');

const conf = {
  clientId: '413dcf18427849af963bd5f934e9b1d6',
  clientSecret: '317233385d9b467cbc33a15c2f998d54',
  redirectUri: 'http://localhost:3000',
  scopes: 'user-read-private user-read-email'
};

const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(conf.clientId + ':' + conf.clientSecret).toString('base64')),
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  },
  form: {
    grant_type: 'client_credentials'
  }
};

export const getToken = () => {
  return axios.post(
    authOptions.url,
    qs.stringify(authOptions.form),
    { headers: authOptions.headers }
  );
}

export const auth = token => {
  var options = {
    url: 'https://api.spotify.com/v1/users/jmperezperez',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  return request.get(options.url, { headers: options.headers });
}

export const search = (token, track, artist) => {
  var options = {
    url: `https://api.spotify.com/v1/search?q=track:${track}%20artist:${artist}&type=track`,
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };

  return axios.get(options.url, { headers: options.headers });
}

// NOT USED
var request = require('request'); // "Request" library
export const authorize = () => {
  return request.get('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + conf.clientId +
    (conf.scopes ? '&scope=' + encodeURIComponent(conf.scopes) : '') +
    '&redirect_uri=' + encodeURIComponent(conf.redirectUri));
}
