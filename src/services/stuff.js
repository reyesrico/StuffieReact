import axios from 'axios';
import { map } from 'lodash';
import routes from './routes';
import config from './config';

export const getStuffList = id_stuffier => (
  axios.get(routes.stuff.listForStuffier(id_stuffier), { headers: config.headers })
);

export const getStuffiersList = ids_stuffier => {
  const ids = map(ids_stuffier, id => { 
    return { id_stuffier: id };
  });

  return axios.get(routes.stuff.listStuffiers(ids), { headers: config.headers });
};

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

export const addStuff = ({ name, category, subcategory, fileName }) => (
  axios.post(routes.stuff.addStuff(), { name, category, subcategory, file_name: fileName }, { headers: config.headers })
);

export const addStuffStuffier = (id_stuffier, id_stuff) => (
  axios.post(routes.stuff.addStuffiersStuff(), { id_stuffier, id_stuff }, { headers: config.headers })
);

export const getStuffFromCategories = (category, subcategory) => (
  axios.get(routes.stuff.detailFromCategories(category, subcategory), { headers: config.headers })
);

export const getCategory = id => (
  axios.get(routes.category.detail(id), { headers: config.headers })
);

export const getSubcategory = id => (
  axios.get(routes.subcategory.detail(id), { headers: config.headers })
);

export const isImageExist = () => (
  axios.get(routes.cloudinary.exist(), { headers: config.cloudinary_headers })
);

export const addSubCategoryCall = ({ id, name }) => (
  axios.post(routes.subcategory.add(), { id, name }, { headers: config.headers })
);

export const addCategoryCall = ({ id, name }) => (
  axios.post(routes.category.add(), { id, name }, { headers: config.headers })
);
