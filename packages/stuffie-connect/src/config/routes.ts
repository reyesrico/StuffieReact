import config from './config';

const routes = {
  category: {
    add: () => `${config.server}categories`,
    list: () => `${config.server}categories`,
    detail: (id: number) => `${config.server}categories?q=${JSON.stringify({ id })}`
  },
  subcategory: {
    add: () => `${config.server}subcategories`,
    list: () => `${config.server}subcategories`,
    detail: (id: number) => `${config.server}subcategories?q=${JSON.stringify({ id })}`
  },
  stuff: {
    addStuffiersStuff: () => `${config.server}stuffiers-stuff`,
    addStuff: () => `${config.server}stuff`,
    detail: (id: number) => `${config.server}stuff?q=${JSON.stringify({ id })}`,
    listDetail: (ids: number[]) => `${config.server}stuff?q={"$or":${JSON.stringify(ids)}}&metafields=true`,
    listForStuffier: (id_stuffier: number) => `${config.server}stuffiers-stuff?q=${JSON.stringify({ id_stuffier })}`,
    listStuffiers: (ids_stuffier: {id_stuffier: number}[]) => `${config.server}stuffiers-stuff?q={"$or":${JSON.stringify(ids_stuffier)}}`,
    detailFromCategories: (category: number, subcategory: number) => `${config.server}stuff?q={"$and":[{"category": ${category}}, {"subcategory": ${subcategory}}]}`,
    listPendingPics: () =>  `${config.server}stuff?q={"$or": [ {"file_name": {"$exists": false}}, {"file_name": ""} ]}`,
    updateStuff: (id: number) => `${config.server}stuffiers-stuff/${id}`
  },
  user: {
    detail: (email: string) => `${config.server}stuffiers?q=${JSON.stringify({ email })}`,
    listDetail: (ids: number[]) => `${config.server}stuffiers?q={"$or":${JSON.stringify(ids)}}`,
    friends: (email: string) => `${config.server}friends?q=${JSON.stringify({ email_stuffier: email })}`,
    list: () => `${config.server}stuffiers`,
    loginUser: (email: string, password: string) => `${config.server}stuffiers?q=${JSON.stringify({ email, password })}`,
    registerUser: () => `${config.server}stuffiers`,
    lastId: () => `${config.server}stuffiers?q={}&h={"$fields": {"id":1}, "$aggregate":["COUNT:"] }`,
    requestToBeFriend: () => `${config.server}friend-requests`,
    friendsRequest: (email_stuffier: string) => `${config.server}friend-requests?q=${JSON.stringify({ email_stuffier })}`,
    friendRequestDetail: (email_stuffier: string, id_friend: number) => `${config.server}friend-requests?q=${JSON.stringify({ email_stuffier, id_friend })}`,
    deleteFriendRequest: (id: number) => `${config.server}friend-requests/${id}`,
    friend: () => `${config.server}friends`,
    userRequests: () => `${config.server}stuffiers?q={"request": true}`,
    deleteUserRequest: (id: number) => `${config.server}stuffiers/${id}`
  },
};

export default routes;
