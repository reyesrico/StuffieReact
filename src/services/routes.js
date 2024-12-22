import config, { useCodehooks } from './config';

const server = config.server;

const urlRoutes = {
  categories: `${server}categories`,
  subcategories: `${server}subcategories`,
  stuff: `${server}stuff`,
  stuffiers_stuff: useCodehooks ? `${server}stuffiersstuff` : `${server}stuffiers-stuff`,
  stuffiers: `${server}stuffiers`,
  friends: `${server}friends`,
  friend_requests: useCodehooks ? `${server}friendrequests` : `${server}friend-requests`,
  exchange_requests: useCodehooks ? `${server}exchangerequests` : `${server}exchange-requests`,
  loan_requests: useCodehooks ? `${server}loanrequests` : `${server}loan-requests`,
}

const routes = {
  category: {
    add: () => urlRoutes.categories,
    list: () => urlRoutes.categories,
    detail: id => `${urlRoutes.categories}?q=${JSON.stringify({ id: parseInt(id) })}`
  },
  cloudinary: {
    exist: () => `https://${config.cloudinary.apiKey}:${config.cloudinary.apiSecret}@api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/resources/image`
  },
  subcategory: {
    add: () => urlRoutes.subcategories,
    list: () => urlRoutes.subcategories,
    detail: id => `${urlRoutes.subcategories}?q=${JSON.stringify({ id: parseInt(id) })}`
  },
  stuff: {
    addStuffiersStuff: () => urlRoutes.stuffiers_stuff,
    addStuff: () => urlRoutes.stuff,
    detail: id => `${urlRoutes.stuff}?q=${JSON.stringify({ id: parseInt(id) })}`,
    listDetail: ids => `${urlRoutes.stuff}?q={"$or":${JSON.stringify(ids)}}&metafields=true`,
    listForStuffier: id_stuffier => `${urlRoutes.stuffiers_stuff}?q=${JSON.stringify({ id_stuffier })}`,
    listStuffiers: ids_stuffier => `${urlRoutes.stuffiers_stuff}?q={"$or":${JSON.stringify(ids_stuffier)}}`,
    detailFromCategories: (category, subcategory) => `${urlRoutes.stuff}?q={"$and":[{"category": ${category}}, {"subcategory": ${subcategory}}]}`,
    listPendingPics: () =>  `${urlRoutes.stuff}?q={"$or": [ {"file_name": {"$exists": false}}, {"file_name": ""} ]}`,
    updateStuff: (_id) => `${urlRoutes.stuffiers_stuff}/${_id}`
  },
  user: {
    detail: email => `${urlRoutes.stuffiers}?q=${JSON.stringify({ email })}`,
    update: id => `${urlRoutes.stuffiers}/${id}`,
    listDetail: ids => `${urlRoutes.stuffiers}?q={"$or":${JSON.stringify(ids)}}`,
    friends: email => `${urlRoutes.friends}?q=${JSON.stringify({ email_stuffier: email })}`,
    list: () => urlRoutes.stuffiers,
    loginUser: (email, password) => `${urlRoutes.stuffiers}?q=${JSON.stringify({ email, password })}`,
    registerUser: () => urlRoutes.stuffiers,
    lastId: () => `${urlRoutes.stuffiers}?q={}&h={"$fields": {"id":1}, "$aggregate":["COUNT:"] }`,
    requestToBeFriend: () => urlRoutes.friend_requests,
    friendsRequest: email_stuffier => `${urlRoutes.friend_requests}?q=${JSON.stringify({ email_stuffier })}`,
    friendRequestDetail: (email_stuffier, id_friend) => `${urlRoutes.friend_requests}?q=${JSON.stringify({ email_stuffier, id_friend })}`,
    deleteFriendRequest: id => `${urlRoutes.friend_requests}/${id}`,
    friend: () => urlRoutes.friends,
    userRequests: () => `${urlRoutes.stuffiers}?q={"request": true}`,
    deleteUserRequest: id => `${urlRoutes.stuffiers}/${id}`
  },
  exchange: {
    request: () => urlRoutes.exchange_requests,
    list: id => `${urlRoutes.exchange_requests}?q={ "$or": [{ "id_stuffier": ${id} } ,{ "id_friend": ${id} }] }`,
    deleteRequest: _id => `${urlRoutes.exchange_requests}/${_id}`
  },
  loan: {
    request: () => urlRoutes.loan_requests,
    list: id => `${urlRoutes.loan_requests}?q={ "$or": [{ "id_stuffier": ${id} } ,{ "id_friend": ${id} }] }`,
    deleteRequest: _id => `${urlRoutes.loan_requests}/${_id}`
  },
  covid: {
    default: () => `https://api.covid19api.com/`,
    all: () => `https://api.covid19api.com/all`,
    countries: () => `https://api.covid19api.com/countries`,
    country: country => `https://api.covid19api.com/dayone/country/${country}`,
   //  countryStatus: (country) => `/dayone/country/${country}/status/confirmed/live`
  },
  spotify: {
    fetch: () => `${server}conf?q={"platform": "spotify"}`
  }
};

export default routes;
