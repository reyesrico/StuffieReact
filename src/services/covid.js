import axios from 'axios';
import routes from './routes';
import config from './config';

export const getDefault = () => (
  axios.get(routes.covid.default(), { headers: config.headers })
);

export const getAll = () => (
  axios.get(routes.covid.all(), { headers: config.headers })
);

export const getCountry = (country) => (
  axios.get(routes.covid.country(country), { headers: config.headers })
);
