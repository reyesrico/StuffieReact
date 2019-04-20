import config from './config';

const routes = {
  category: {
    list: () => `${config.server}categories`,
  },
  stuff: {
    detail: id => `${config.server}stuff?q=${JSON.stringify({ id })}`,
    listDetail: ids => `${config.server}stuff?q={"$or":${JSON.stringify(ids)}}`,
    listForStuffier: id_stuffier => `${config.server}stuffiers-stuff?q=${JSON.stringify({ id_stuffier })}`,
  },
  user: {
    detail: email => `${config.server}stuffiers?q=${JSON.stringify({ email })}`,
    friends: email => `${config.server}friends?q=${JSON.stringify({ email_stuffier: email })}`,
    list: () => `${config.server}stuffiers`,
    loginUser: (email, password) => `${config.server}stuffiers?q=${JSON.stringify({ email, password })}`,
    registerUser: () => `${config.server}stuffiers`,
  }
};

export default routes;
