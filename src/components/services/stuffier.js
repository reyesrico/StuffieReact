import axios from 'axios';
import routes from './routes';
import config from './config';

// Axios POST Defaults
const headers = {
  ...config.headers,
  'content-type': 'application/json'
};


export const getStuffier = email => (
  axios.get(routes.user.detail(email), { headers: config.headers })
);

export const getFriends = email => (
  axios.get(routes.user.friends(email), { headers: config.headers })
);

export const loginStuffier = (email, password) => (
  axios.get(routes.user.loginUser(email, password), { headers: config.headers })
);

export const registerStuffier = async (user) => {
  axios.headers = headers;
  axios.defaults.withCredentials = true;
  
  const id = 3; // await getStuffierId();
  axios.headers = headers;
  return axios.post(routes.user.registerUser(), { ...user, id })
};
