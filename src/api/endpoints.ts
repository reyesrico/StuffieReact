/**
 * API Endpoints - Centralized URL builders
 * 
 * All endpoints target Codehooks only — RestDB is a frozen backup.
 * Collection names use Codehooks conventions (camelCase/lowercase).
 */

// Codehooks collection names (single source of truth)
const collections = {
  categories: 'categories',
  subcategories: 'subcategories',
  stuff: 'stuff',
  stuffiersStuff: 'stuffiersstuff',
  stuffiers: 'stuffiers',
  friends: 'friends',
  friendRequests: 'friendrequests',
  exchangeRequests: 'exchangerequests',
  loanRequests: 'loanrequests',
  purchaseRequests: 'purchaserequests',
  conf: 'conf',
};

/**
 * Category endpoints
 */
export const categoryEndpoints = {
  /** GET all categories */
  list: () => collections.categories,
  
  /** GET category by id */
  get: (id: number) => 
    `${collections.categories}?q=${JSON.stringify({ id })}`,
  
  /** POST create category */
  create: () => collections.categories,
  
  /** DELETE category by _id */
  delete: (_id: string) => `${collections.categories}/${_id}`,
};

/**
 * Subcategory endpoints
 */
export const subcategoryEndpoints = {
  /** GET all subcategories */
  list: () => collections.subcategories,
  
  /** GET subcategory by id */
  get: (id: number) => 
    `${collections.subcategories}?q=${JSON.stringify({ id })}`,
  
  /** POST create subcategory */
  create: () => collections.subcategories,
  
  /** DELETE subcategory by _id */
  delete: (_id: string) => `${collections.subcategories}/${_id}`,
};

/**
 * Product (stuff) endpoints
 */
export const productEndpoints = {
  /** GET all products (stuff collection) */
  list: () => collections.stuff,
  
  /** GET product by id */
  get: (id: number) => 
    `${collections.stuff}?q=${JSON.stringify({ id })}`,
  
  /** GET multiple products by ids array */
  listByIds: (ids: Array<{ id: number }>) => 
    `${collections.stuff}?q={"$or":${JSON.stringify(ids)}}&metafields=true`,
  
  /** GET products by category and subcategory */
  listByCategory: (category: number, subcategory: number) => 
    `${collections.stuff}?q={"$and":[{"category": ${category}}, {"subcategory": ${subcategory}}]}`,
  
  /** GET products without images (pending) */
  listPending: () => 
    `${collections.stuff}?q={"$or": [ {"file_name": {"$exists": false}}, {"file_name": ""} ]}`,
  
  /** POST create product */
  create: () => collections.stuff,
  
  /** GET all product ids (for computing next sequential id — fallback only) */
  getLastId: () => `${collections.stuff}?q={}&h={"$fields": {"id":1}}`,

  /** POST atomic next-id counter (Codehooks keyvalue counter) — preferred over getLastId */
  nextId: () => `stuff/next-id`,

  /** PUT update product by _id (not used directly - see stuffiersStuff) */
  update: (_id: string) => `${collections.stuff}/${_id}`,
  
  /** DELETE product by _id */
  delete: (_id: string) => `${collections.stuff}/${_id}`,
};

/**
 * Stuffiers-Stuff (user-product relationship with cost) endpoints
 */
export const stuffiersStuffEndpoints = {
  /** GET all user-product relationships for a user */
  listByUser: (userId: number) => 
    `${collections.stuffiersStuff}?q=${JSON.stringify({ id_stuffier: userId })}`,
  
  /** GET user-product relationships for multiple users */
  listByUsers: (userIds: Array<{ id_stuffier: number }>) => 
    `${collections.stuffiersStuff}?q={"$or":${JSON.stringify(userIds)}}`,
  
  /** POST create user-product relationship */
  create: () => collections.stuffiersStuff,
  
  /** PUT update user-product relationship (e.g., cost) */
  update: (_id: string) => `${collections.stuffiersStuff}/${_id}`,
  
  /** DELETE user-product relationship */
  delete: (_id: string) => `${collections.stuffiersStuff}/${_id}`,
};

/**
 * User (stuffiers) endpoints
 */
export const userEndpoints = {
  /** GET all users */
  list: () => collections.stuffiers,
  
  /** GET user by email */
  getByEmail: (email: string) => 
    `${collections.stuffiers}?q=${JSON.stringify({ email })}`,
  
  /** GET user by email and password (login) */
  login: (email: string, password: string) => 
    `${collections.stuffiers}?q=${JSON.stringify({ email, password })}`,
  
  /** GET multiple users by ids */
  listByIds: (ids: Array<{ id: number }>) => 
    `${collections.stuffiers}?q={"$or":${JSON.stringify(ids)}}`,
  
  /** GET users pending approval */
  listPendingRequests: () => 
    `${collections.stuffiers}?q={"request": true}`,
  
  /** GET last user id (for registration — fallback only) */
  getLastId: () => 
    `${collections.stuffiers}?q={}&h={"$fields": {"id":1}, "$aggregate":["COUNT:"] }`,

  /** POST atomic next-id counter (Codehooks keyvalue counter) — preferred over getLastId */
  nextId: () => `stuffiers/next-id`,

  /** POST register user */
  create: () => collections.stuffiers,
  
  /** PUT update user */
  update: (_id: string) => `${collections.stuffiers}/${_id}`,
  
  /** DELETE user */
  delete: (_id: string) => `${collections.stuffiers}/${_id}`,
};

/**
 * Friends endpoints
 */
export const friendsEndpoints = {
  /** GET friends for a user */
  listByUser: (email: string) => 
    `${collections.friends}?q=${JSON.stringify({ email_stuffier: email })}`,
  
  /** POST add friend relationship */
  create: () => collections.friends,
  
  /** DELETE remove friend relationship */
  delete: (_id: string) => `${collections.friends}/${_id}`,
};

/**
 * Friend Request endpoints
 */
export const friendRequestEndpoints = {
  /** GET friend requests for a user */
  listByUser: (email: string) => 
    `${collections.friendRequests}?q=${JSON.stringify({ email_stuffier: email })}`,
  
  /** GET specific friend request */
  get: (email: string, friendId: number) => 
    `${collections.friendRequests}?q=${JSON.stringify({ email_stuffier: email, id_friend: friendId })}`,
  
  /** POST send friend request */
  create: () => collections.friendRequests,
  
  /** DELETE friend request (accept/reject) */
  delete: (_id: string) => `${collections.friendRequests}/${_id}`,
};

/**
 * Exchange Request endpoints
 */
export const exchangeEndpoints = {
  /** GET exchanges for a user (both sent and received) */
  listByUser: (userId: number) => 
    `${collections.exchangeRequests}?q={ "$or": [{ "id_stuffier": ${userId} } ,{ "id_friend": ${userId} }] }`,
  
  /** POST create exchange request */
  create: () => collections.exchangeRequests,
  
  /** DELETE exchange request (accept/reject/cancel) */
  delete: (_id: string) => `${collections.exchangeRequests}/${_id}`,
};

/**
 * Loan Request endpoints
 */
export const loanEndpoints = {
  /** GET loans for a user (both sent and received) */
  listByUser: (userId: number) => 
    `${collections.loanRequests}?q={ "$or": [{ "id_stuffier": ${userId} } ,{ "id_friend": ${userId} }] }`,
  
  /** POST create loan request */
  create: () => collections.loanRequests,
  
  /** DELETE loan request (accept/reject/return) */
  delete: (_id: string) => `${collections.loanRequests}/${_id}`,
};

/**
 * Purchase Request endpoints
 */
export const purchaseEndpoints = {
  /** GET purchases for a user (both sent and received) */
  listByUser: (userId: number) =>
    `${collections.purchaseRequests}?q={ "$or": [{ "id_stuffier": ${userId} } ,{ "id_friend": ${userId} }] }`,

  /** POST create purchase request */
  create: () => collections.purchaseRequests,

  /** DELETE purchase request */
  delete: (_id: string) => `${collections.purchaseRequests}/${_id}`,
};

/**
 * Config endpoints (for Spotify, etc.)
 */
export const configEndpoints = {
  /** GET config by platform */
  getByPlatform: (platform: string) => 
    `${collections.conf}?q={"platform": "${platform}"}`,
};

/**
 * User Products — server-side join endpoint (Phase 3 of DB migration)
 * Replaces the 3-call client-side pipeline: stuffiersstuff + stuff + mapCost
 * Endpoint: GET /userproducts/:stuffierId  (custom Codehooks handler in backend/index.js)
 */
export const userProductsEndpoints = {
  /** GET all products for a user with cost, via server-side join */
  listByUser: (stuffierId: number) => `userproducts/${stuffierId}`,
};

// Export all endpoints as single object for convenience
export const endpoints = {
  categories: categoryEndpoints,
  subcategories: subcategoryEndpoints,
  products: productEndpoints,
  stuffiersStuff: stuffiersStuffEndpoints,
  users: userEndpoints,
  friends: friendsEndpoints,
  friendRequests: friendRequestEndpoints,
  exchanges: exchangeEndpoints,
  loans: loanEndpoints,
  purchases: purchaseEndpoints,
  config: configEndpoints,
  userProducts: userProductsEndpoints,
};

export default endpoints;
