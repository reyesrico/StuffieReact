import axios from 'axios';
import routes from './routes';
import config from './config';

export const addExchangeRequest = (id_stuffier, id_stuff, id_friend, id_friend_stuff) => (
  axios.post(routes.exchange.request(), { id_stuffier, id_friend, id_stuff, id_friend_stuff }, { headers: config.headers })
);

export const getExchangeRequests = id_stuffier => (
  axios.get(routes.exchange.list(id_stuffier), { headers: config.headers })
);
