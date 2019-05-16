import axios from 'axios';
import routes from './routes';
import config from './config';

export const getStuffList = id_stuffier => (
  axios.get(routes.stuff.listForStuffier(id_stuffier), { headers: config.headers })
);

export const getStuff = id => (
  axios.get(routes.stuff.detail(id), { headers: config.headers })
);

export const getListStuff = ids => (
  axios.get(routes.stuff.listDetail(ids), { headers: config.headers })
);

export const getCategories = () => (
  axios.get(routes.category.list(), { headers: config.headers })
);

export const getSubCategories = () => (
  axios.get(routes.subcategory.list(), { headers: config.headers })
);

export const addStuff = (name, category, subcategory, file_name) => (
  axios.post(routes.stuff.addStuff(), { name, category, subcategory, file_name }, { headers: config.headers })
);

export const addStuffStuffier = (id_stuffier, id_stuff) => (
  axios.post(routes.stuff.addStuffiersStuff(), { id_stuffier, id_stuff }, { headers: config.headers })
);
