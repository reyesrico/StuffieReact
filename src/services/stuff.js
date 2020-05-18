import axios from 'axios';
import { map } from 'lodash';
import routes from './routes';
import config from './config';

export const getStuffList = id_stuffier => (
  axios.get(routes.stuff.listForStuffier(id_stuffier), { headers: config.headers })
);

export const getStuffiersList = friends => {
  if (friends.length > 0) {
    const ids = map(friends, friend => { 
      return { id_stuffier: friend.id };
    });
  
    return axios.get(routes.stuff.listStuffiers(ids), { headers: config.headers });  
  }

  return Promise.resolve([]);
};

export const getStuff = id => (
  axios.get(routes.stuff.detail(id), { headers: config.headers })
);

export const getListStuff = ids => {
  if (ids.length) {
    return axios.get(routes.stuff.listDetail(ids), { headers: config.headers });
  }

  return Promise.resolve([]);
};

export const getProductsFromIds = ids => (
  axios.get(routes.stuff.listDetail(ids), { headers: config.headers })
);

export const getCategories = (token = null) => (
  axios.get(routes.category.list(), { headers: config.headers, cancelToken: token })
);

export const getSubCategories = (token = null) => (
  axios.get(routes.subcategory.list(), { headers: config.headers, cancelToken: token })
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

export const getPendingProducts = () => (
  axios.get(routes.stuff.listPendingPics(), { headers: config.headers })
);

export const updateStuff = (id_stuffier, id_stuff, cost) => {
  return getStuffList(id_stuffier)
    .then(res => {
      console.log(res.data);
      const stuff = res.data.find(row => row.id_stuff === id_stuff);
      if (stuff) {
        return axios.put(routes.stuff.updateStuff(stuff._id), {...stuff, cost }, { headers: config.headers });
      }
      return Promise.resolve([]);
    });
};

/*
* This is to emulate ElasticSearch
*/
export const getSearchResults = (searchText, products, token) => {
  let results = [];
  const text = searchText.toLowerCase();

  return Promise.all([getCategories(token), getSubCategories(token)]).then(values => {
    values[0].data.forEach(c => {
      if (c.name.toLowerCase().includes(text)){
        results.push({ type: 'Category', name: c.name, id: c.id });
      }
    });

    values[1].data.forEach(s => {
      if (s.name.toLowerCase().includes(text)) {
        results.push({ type: 'Subcategory', name: s.name, id: s.id });
      }
    });

    Object.keys(products).forEach(key => {
      products[key].forEach(p => {
        if (p.name.toLowerCase().includes(text)) {
          results.push({ type: 'Product', name: p.name, id: p.id });
        }  
      });
    });
  
    return Promise.resolve(results);
  });
};

// For Exchange ElasticSearch
export const getProductResults = (searchText, products) => (
  products.filter(product => product.name.toLowerCase().includes(searchText.toLowerCase()))
);
