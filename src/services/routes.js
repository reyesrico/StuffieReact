import config from './config';

const routes = {
  category: {
    list: () => `${config.server}categories`,
  },
  subcategory: {
    list: () => `${config.server}subcategories`,
  },
  stuff: {
    addStuffiersStuff: () => `${config.server}stuffiers-stuff`,
    addStuff: () => `${config.server}stuff`,
    detail: id => `${config.server}stuff?q=${JSON.stringify({ id: parseInt(id) })}`,
    listDetail: ids => `${config.server}stuff?q={"$or":${JSON.stringify(ids)}}`,
    listForStuffier: id_stuffier => `${config.server}stuffiers-stuff?q=${JSON.stringify({ id_stuffier })}`,
    listStuffiers: ids_stuffier => `${config.server}stuffiers-stuff?q={"$or":${JSON.stringify(ids_stuffier)}}`,
    detailFromCategories: (category, subcategory) => `${config.server}stuff?q={"$and":[{"category": ${category}}, {"subcategory": ${subcategory}}]}`
  },
  user: {
    detail: email => `${config.server}stuffiers?q=${JSON.stringify({ email })}`,
    listDetail: ids => `${config.server}stuffiers?q={"$or":${JSON.stringify(ids)}}`,
    friends: email => `${config.server}friends?q=${JSON.stringify({ email_stuffier: email })}`,
    list: () => `${config.server}stuffiers`,
    loginUser: (email, password) => `${config.server}stuffiers?q=${JSON.stringify({ email, password })}`,
    registerUser: () => `${config.server}stuffiers`,
  }
};

export default routes;
