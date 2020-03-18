import config from './config';

const routes = {
  category: {
    add: () => `${config.server}categories`,
    list: () => `${config.server}categories`,
    detail: id => `${config.server}categories?q=${JSON.stringify({ id: parseInt(id) })}`
  },
  cloudinary: {
    exist: () => `https://${config.cloudinary.apiKey}:${config.cloudinary.apiSecret}@api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/resources/image`
  },
  subcategory: {
    add: () => `${config.server}subcategories`,
    list: () => `${config.server}subcategories`,
    detail: id => `${config.server}subcategories?q=${JSON.stringify({ id: parseInt(id) })}`
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
