import axios from 'axios';
import routes from './routes';
import config from './config';

export const getStuffier = email => (
  axios.get(routes.user.detail(email), { headers: config.headers })
);

export const getStuffiers = ids => (
  axios.get(routes.user.listDetail(ids), { headers: config.headers })
);

export const getFriends = email => (
  axios.get(routes.user.friends(email), { headers: config.headers })
);

export const loginStuffier = (email, password) => (
  axios.get(routes.user.loginUser(email, password), { headers: config.headers })
);

export const getLastStuffierId = () => (
  axios.get(routes.user.lastId(), { headers: config.headers })
);

export const registerStuffier = (user) => {
  return getLastStuffierId().then(res => {
    let id = Object.values(res.data)[0] + 1;
    return axios.post(routes.user.registerUser(), { ...user, id }, { headers: config.headers });
  });
};
