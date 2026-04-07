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
  items: 'items',
  userItems: 'user_items',
  stuffiersStuff: 'user_items', // Stage 6: redirected to user_items
  users: 'users',
  friends: 'friends',
  friendRequests: 'friendrequests',
  friendships: 'friendships', // Stage 7: replaces friends + friendrequests
  exchangeRequests: 'exchange_requests', // Stage 8: renamed from exchangerequests + status field
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
 * Product (items) endpoints
 */
export const productEndpoints = {
  /** GET all products (items collection) */
  list: () => collections.items,
  
  /** GET product by id */
  get: (id: number) => 
    `${collections.items}?q=${JSON.stringify({ id })}`,
  
  /** GET multiple products by ids array */
  listByIds: (ids: Array<{ id: number }>) => 
    `${collections.items}?q={"$or":${JSON.stringify(ids)}}&metafields=true`,
  
  /** GET products by category and subcategory */
  listByCategory: (category_id: number, subcategory_id: number) => 
    `${collections.items}?q={"$and":[{"category_id": ${category_id}}, {"subcategory_id": ${subcategory_id}}]}`,
  
  /** GET products without images (pending) */
  listPending: () => 
    `${collections.items}?q={"$or": [ {"image_key": {"$exists": false}}, {"image_key": ""} ]}`,
  
  /** POST create product */
  create: () => collections.items,
  
  /** GET all product ids (for computing next sequential id — fallback only) */
  getLastId: () => `${collections.items}?q={}&h={"$fields": {"id":1}}`,

  /** POST atomic next-id counter (Codehooks keyvalue counter) — preferred over getLastId */
  nextId: () => `stuff/next-id`,

  /** PUT update product by _id (not used directly - see stuffiersStuff) */
  update: (_id: string) => `${collections.items}/${_id}`,
  
  /** DELETE product by _id */
  delete: (_id: string) => `${collections.items}/${_id}`,
};

/**
 * Stuffiers-Stuff (user-product relationship with cost) endpoints
 * Stage 6: now points at user_items collection
 */
export const stuffiersStuffEndpoints = {
  /** GET all user-product relationships for a user */
  listByUser: (userId: number) =>
    `${collections.userItems}?q=${JSON.stringify({ user_id: userId })}`,

  /** GET user-product relationships for multiple users */
  listByUsers: (userIds: Array<{ user_id: number }>) =>
    `${collections.userItems}?q={"$or":${JSON.stringify(userIds)}}`,

  /** POST create user-product relationship */
  create: () => collections.userItems,

  /** PUT update user-product relationship */
  update: (_id: string) => `${collections.userItems}/${_id}`,

  /** DELETE user-product relationship */
  delete: (_id: string) => `${collections.userItems}/${_id}`,
};

/**
 * UserItem endpoints (new name for stuffiersStuffEndpoints)
 */
export const userItemEndpoints = stuffiersStuffEndpoints;

/**
 * User endpoints
 */
export const userEndpoints = {
  /** GET all users */
  list: () => collections.users,
  
  /** GET user by email */
  getByEmail: (email: string) => 
    `${collections.users}?q=${JSON.stringify({ email })}`,
  
  /** GET multiple users by ids */
  listByIds: (ids: Array<{ id: number }>) => 
    `${collections.users}?q={"$or":${JSON.stringify(ids)}}`,
  
  /** GET users pending approval */
  listPendingRequests: () => 
    `${collections.users}?q=${JSON.stringify({ status: 'pending' })}`,
  
  /** GET last user id (for registration — fallback only) */
  getLastId: () => 
    `${collections.users}?q={}&h={"$fields": {"id":1}, "$aggregate":["COUNT:"] }`,

  /** POST atomic next-id counter (Codehooks keyvalue counter) — preferred over getLastId */
  nextId: () => `users/next-id`,

  /** POST register user */
  create: () => collections.users,
  
  /** PUT update user */
  update: (_id: string) => `${collections.users}/${_id}`,
  
  /** DELETE user */
  delete: (_id: string) => `${collections.users}/${_id}`,
};

/**
 * Friendships endpoints (Stage 7 — replaces friends + friendrequests)
 * Schema: { user_id, friend_id, status: 'accepted'|'pending', initiated_by }
 */
export const friendshipEndpoints = {
  /** GET all friendships where user is a participant */
  listByUser: (userId: number) =>
    `${collections.friendships}?q=${JSON.stringify({ user_id: userId })}`,

  /** GET specific friendship between two users */
  get: (userId: number, friendId: number) =>
    `${collections.friendships}?q=${JSON.stringify({ user_id: userId, friend_id: friendId })}`,

  /** GET pending requests targeting a user (received) */
  listPendingForUser: (userId: number) =>
    `${collections.friendships}?q=${JSON.stringify({ user_id: userId, status: 'pending' })}`,

  /** GET pending requests sent by a user (outgoing) */
  listSentByUser: (userId: number) =>
    `${collections.friendships}?q=${JSON.stringify({ friend_id: userId, status: 'pending' })}`,

  /** POST create friendship record */
  create: () => collections.friendships,

  /** PUT update friendship record (e.g. pending → accepted) */
  update: (_id: string) => `${collections.friendships}/${_id}`,

  /** DELETE friendship record */
  delete: (_id: string) => `${collections.friendships}/${_id}`,
};

/**
 * Friends endpoints (legacy — Stage 7 shadow period)
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
