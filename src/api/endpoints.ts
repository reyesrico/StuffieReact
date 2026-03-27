/**
 * API Endpoints - Centralized URL builders
 * 
 * Migrated from services/routes.js with TypeScript support
 * All endpoints return relative paths (baseURL is set in client.ts)
 */
import { useCodehooks } from '../config/api';

// Collection names differ between RestDB (kebab-case) and Codehooks (camelCase)
const collections = {
  categories: 'categories',
  subcategories: 'subcategories',
  stuff: 'stuff',
  stuffiersStuff: useCodehooks ? 'stuffiersstuff' : 'stuffiers-stuff',
  stuffiers: 'stuffiers',
  friends: 'friends',
  friendRequests: useCodehooks ? 'friendrequests' : 'friend-requests',
  exchangeRequests: useCodehooks ? 'exchangerequests' : 'exchange-requests',
  loanRequests: useCodehooks ? 'loanrequests' : 'loan-requests',
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
  
  /** GET last user id (for registration) */
  getLastId: () => 
    `${collections.stuffiers}?q={}&h={"$fields": {"id":1}, "$aggregate":["COUNT:"] }`,
  
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
 * Config endpoints (for Spotify, etc.)
 */
export const configEndpoints = {
  /** GET config by platform */
  getByPlatform: (platform: string) => 
    `${collections.conf}?q={"platform": "${platform}"}`,
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
  config: configEndpoints,
};

export default endpoints;
