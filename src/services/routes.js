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
    listDetail: ids => `${config.server}stuff?q={"$or":${JSON.stringify(ids)}}&metafields=true`,
    listForStuffier: id_stuffier => `${config.server}stuffiers-stuff?q=${JSON.stringify({ id_stuffier })}`,
    listStuffiers: ids_stuffier => `${config.server}stuffiers-stuff?q={"$or":${JSON.stringify(ids_stuffier)}}`,
    detailFromCategories: (category, subcategory) => `${config.server}stuff?q={"$and":[{"category": ${category}}, {"subcategory": ${subcategory}}]}`,
    listPendingPics: () =>  `${config.server}stuff?q={"$or": [ {"file_name": {"$exists": false}}, {"file_name": ""} ]}`,
    updateStuff: (_id) => `${config.server}stuffiers-stuff/${_id}`
  },
  user: {
    detail: email => `${config.server}stuffiers?q=${JSON.stringify({ email })}`,
    listDetail: ids => `${config.server}stuffiers?q={"$or":${JSON.stringify(ids)}}`,
    friends: email => `${config.server}friends?q=${JSON.stringify({ email_stuffier: email })}`,
    list: () => `${config.server}stuffiers`,
    loginUser: (email, password) => `${config.server}stuffiers?q=${JSON.stringify({ email, password })}`,
    registerUser: () => `${config.server}stuffiers`,
    lastId: () => `${config.server}stuffiers?q={}&h={"$fields": {"id":1}, "$aggregate":["COUNT:"] }`,
    requestToBeFriend: () => `${config.server}friend-requests`,
    friendsRequest: email_stuffier => `${config.server}friend-requests?q=${JSON.stringify({ email_stuffier })}`,
    friendRequestDetail: (email_stuffier, id_friend) => `${config.server}friend-requests?q=${JSON.stringify({ email_stuffier, id_friend })}`,
    deleteFriendRequest: id => `${config.server}friend-requests/${id}`,
    friend: () => `${config.server}friends`,
    userRequests: () => `${config.server}stuffiers?q={"request": true}`,
    deleteUserRequest: id => `${config.server}stuffiers/${id}`
  },
  exchange: {
    request: () => `${config.server}exchange-requests`,
    list: id => `${config.server}exchange-requests?q={ "$or": [{ "id_stuffier": ${id} } ,{ "id_friend": ${id} }] }`,
    deleteRequest: _id => `${config.server}exchange-requests/${_id}`
  },
  loan: {
    request: () => `${config.server}loan-requests`,
    list: id => `${config.server}loan-requests?q={ "$or": [{ "id_stuffier": ${id} } ,{ "id_friend": ${id} }] }`,
    deleteRequest: _id => `${config.server}loan-requests/${_id}`
  },
  covid: {
    default: () => `https://api.covid19api.com/`,
    all: () => `https://api.covid19api.com/all`,
    countries: () => `https://api.covid19api.com/countries`,
    country: country => `https://api.covid19api.com/dayone/country/${country}`,
   //  countryStatus: (country) => `/dayone/country/${country}/status/confirmed/live`
  },
  spotify: {
    fetch: () => `${config.server}conf?q={"platform": "spotify"}`
  }
};

export default routes;
