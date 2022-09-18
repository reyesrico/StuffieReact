import axios, { CancelToken } from 'axios';
import { map } from 'lodash';
import routes from '../config/routes';
import config from '../config/config';
import { Category, Friend, Product, Subcategory } from '../types';

const Stuff = () => {
  const getStuffList = (id_stuffier: any) => (
    axios.get(routes.stuff.listForStuffier(id_stuffier), { headers: config.headers })
  );

  const getStuffiersList = (friends: Friend[]) => {
    if (friends.length > 0) {
      const ids = map(friends, friend => {
        return { id_stuffier: friend.id };
      });

      return axios.get(routes.stuff.listStuffiers(ids), { headers: config.headers });
    }

    return Promise.resolve([]);
  };

  const getStuff = (id: number) => (
    axios.get(routes.stuff.detail(id), { headers: config.headers })
  );

  const getListStuff = (ids: number[]) => {
    if (ids.length) {
      return axios.get(routes.stuff.listDetail(ids), { headers: config.headers });
    }

    return Promise.resolve([]);
  };

  const getProductsFromIds = (ids: number[]) => (
    axios.get(routes.stuff.listDetail(ids), { headers: config.headers })
  );

  const getCategories = (token: CancelToken = null) => (
    axios.get(routes.category.list(), { headers: config.headers, cancelToken: token })
  );

  const getSubCategories = (token: CancelToken = null) => (
    axios.get(routes.subcategory.list(), { headers: config.headers, cancelToken: token })
  );

  const addStuff = ({ name, category, subcategory, fileName }:
    { name: string, category: number, subcategory: number, fileName: string }) => (
    axios.post(routes.stuff.addStuff(), { name, category, subcategory, file_name: fileName }, { headers: config.headers })
  );

  const addStuffStuffier = (id_stuffier: number, id_stuff: number) => (
    axios.post(routes.stuff.addStuffiersStuff(), { id_stuffier, id_stuff }, { headers: config.headers })
  );

  const getStuffFromCategories = (category: number, subcategory: number) => (
    axios.get(routes.stuff.detailFromCategories(category, subcategory), { headers: config.headers })
  );

  const getCategory = (id: number) => (
    axios.get(routes.category.detail(id), { headers: config.headers })
  );

  const getSubcategory = (id: number) => (
    axios.get(routes.subcategory.detail(id), { headers: config.headers })
  );

  const addSubCategoryCall = ({ id, name }: { id: number, name: string }) => (
    axios.post(routes.subcategory.add(), { id, name }, { headers: config.headers })
  );

  const addCategoryCall = ({ id, name }: { id: number, name: string }) => (
    axios.post(routes.category.add(), { id, name }, { headers: config.headers })
  );

  const getPendingProducts = () => (
    axios.get(routes.stuff.listPendingPics(), { headers: config.headers })
  );

  const updateStuff = (id_stuffier: number, id_stuff: number, cost: number) => {
    return getStuffList(id_stuffier)
      // @ts-ignore
      .then((res: any) => {
        const stuff = res.data.find((row: { id_stuff: number }) => row.id_stuff === id_stuff);
        if (stuff) {
          return axios.put(routes.stuff.updateStuff(stuff._id), { ...stuff, cost }, { headers: config.headers });
        }
        return Promise.resolve([]);
      });
  };

  /*
  * This is to emulate ElasticSearch
  */
  const getSearchResults = (searchText: string, products: Record<string, Product[]>, token: CancelToken) => {
    let results: { type: string, name: string, id: number }[] = [];
    const text = searchText.toLowerCase();

    return Promise.all([getCategories(token), getSubCategories(token)]).then(values => {
      values[0].data.forEach((c: Category) => {
        if (c.name.toLowerCase().includes(text)) {
          results.push({ type: 'Category', name: c.name, id: c.id });
        }
      });

      values[1].data.forEach((s: Subcategory) => {
        if (s.name.toLowerCase().includes(text)) {
          results.push({ type: 'Subcategory', name: s.name, id: s.id });
        }
      });

      Object.keys(products).forEach(key => {
        products[key].forEach((p: Product) => {
          if (p.name.toLowerCase().includes(text)) {
            results.push({ type: 'Product', name: p.name, id: p.id });
          }
        });
      });

      return Promise.resolve(results);
    });
  };

  // For Exchange ElasticSearch
  const getProductResults = (searchText: string, products: Product[]) => (
    products.filter(product => product.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  return {
    getCategories,
    getCategory,
    getListStuff,
    getPendingProducts,
    getProductResults,
    getProductsFromIds,
    getSearchResults,
    getStuff,
    getStuffFromCategories,
    getStuffList,
    getStuffiersList,
    getSubCategories,
    getSubcategory,
    updateStuff,
    addCategoryCall,
    addStuff,
    addStuffStuffier,
    addSubCategoryCall,
  }
}

export default Stuff;
