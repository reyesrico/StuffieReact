/**
 * Users API - CRUD operations for users (stuffiers)
 */
import axios from 'axios';
import { apiClient } from './client';
import { userEndpoints } from './endpoints';
import crypto from '../lib/crypto';
import type User from '../components/types/User';

// Dedicated clients for each backend — used during registration to write to both
const codehooksClient = axios.create({
  baseURL: import.meta.env.VITE_CODEHOOKS_SERVER_URL || 'https://stuffie-2u0v.api.codehooks.io/dev/',
  headers: { 'x-apikey': import.meta.env.VITE_CODEHOOKS_API_KEY || '', 'Content-Type': 'application/json' },
  timeout: 30000,
});
const restdbClient = axios.create({
  baseURL: import.meta.env.VITE_RESTDB_SERVER_URL || 'https://stuffie-98b2.restdb.io/rest/',
  headers: { 'cache-control': 'no-cache', 'x-apikey': import.meta.env.VITE_RESTDB_API_KEY || '' },
  timeout: 30000,
});

// ============ READ ============

/**
 * Get all users
 */
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>(userEndpoints.list());
  return response.data;
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const response = await apiClient.get<User[]>(userEndpoints.getByEmail(email));
  return response.data[0] || null;
};

/**
 * Get multiple users by ids
 */
export const getUsersByIds = async (ids: Array<{ id: number }>): Promise<User[]> => {
  if (ids.length === 0) return [];
  const response = await apiClient.get<User[]>(userEndpoints.listByIds(ids));
  return response.data;
};

/**
 * Get users with pending approval requests
 */
export const getPendingUserRequests = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>(userEndpoints.listPendingRequests());
  return response.data;
};

/**
 * Get the highest 'id' value from Codehooks (our source of truth).
 * Always queries Codehooks directly — independent of the useCodehooks toggle.
 */
export const getLastUserId = async (): Promise<number> => {
  const response = await codehooksClient.get<Record<string, any>[]>(userEndpoints.getLastId());
  const ids = response.data
    .map((row: Record<string, any>) => Number(row.id))
    .filter((n: number) => Number.isFinite(n) && n > 0);
  return ids.length > 0 ? Math.max(...ids) : 0;
};

// ============ AUTH ============

/**
 * Login user with email and password
 * Password is encrypted before sending
 */
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const pbkdf2Hash = await crypto.pbkdf2(password, email);

  // 1. Try current PBKDF2 (new registrations)
  const response = await apiClient.get<User[]>(userEndpoints.login(email, pbkdf2Hash));
  if (response.data[0]) return response.data[0];

  // Fallback: SHA256 — users who registered before the PBKDF2 migration
  const sha256Hash = crypto.encrypt(password);
  const sha256Response = await apiClient.get<User[]>(userEndpoints.login(email, sha256Hash));
  if (sha256Response.data[0]) {
    // Migrate to PBKDF2 on the way through
    const user = sha256Response.data[0];
    if (user._id) {
      await apiClient.put(userEndpoints.update(String(user._id)), { ...user, password: pbkdf2Hash });
    }
    return user;
  }

  return null;
};

export interface RegisterUserInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

/**
 * Register a new user
 * - Gets last id to generate new id
 * - Encrypts password with PBKDF2
 * - Sets request: true for admin approval
 */
/**
 * Register a new user
 *
 * Steps (in order):
 * 1. Get the current max 'id' from Codehooks (our sequential id, not the DB's _id)
 * 2. Compute newId = max + 1
 * 3. Hash password with PBKDF2 (email as salt)
 * 4. Write to Codehooks AND RestDB with the same newId
 * 5. Return user with guaranteed 'id' field (used by caller for Cloudinary upload)
 */
export const registerUser = async (userData: RegisterUserInput): Promise<User> => {
  const [lastId, encryptedPassword] = await Promise.all([
    getLastUserId(),
    crypto.pbkdf2(userData.password, userData.email),
  ]);

  const newId = lastId + 1;

  const newUser = {
    ...userData,
    password: encryptedPassword,
    id: newId,
    admin: false,
    request: true, // Requires admin approval
  };

  // Write to both databases — Codehooks is primary, RestDB is secondary
  const [codehooksRes] = await Promise.all([
    codehooksClient.post<User>(userEndpoints.create(), newUser),
    restdbClient.post<User>(userEndpoints.create(), newUser).catch((err) => {
      // RestDB failure is non-fatal — Codehooks is source of truth
      console.warn('[Register] RestDB write failed:', err?.message);
    }),
  ]);

  // Guarantee the id is present — some backends don't echo custom fields back
  return { ...codehooksRes.data, id: newId };
};

// ============ UPDATE ============

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  picture?: string;
  admin?: boolean;
  request?: boolean;
  password?: string;
  // email is used to locate the matching record in RestDB for dual-write sync
  email?: string;
}

/**
 * Find a user in RestDB by email and apply a PATCH — keeps RestDB in sync with Codehooks.
 * Non-fatal: a RestDB failure is warned but never throws.
 */
const syncRestDB = async (email: string, data: Record<string, any>): Promise<void> => {
  try {
    const search = await restdbClient.get<User[]>(userEndpoints.getByEmail(email));
    const rbUser = search.data[0];
    if (rbUser?._id) {
      await restdbClient.put(userEndpoints.update(String(rbUser._id)), data);
    }
  } catch (err: any) {
    console.warn('[RestDB] sync failed for', email, err?.message);
  }
};

/**
 * Update user by _id — writes to Codehooks, then syncs RestDB via email lookup.
 */
export const updateUser = async (_id: string, data: UpdateUserInput): Promise<User> => {
  const response = await apiClient.put<User>(userEndpoints.update(_id), data);
  if (data.email) {
    await syncRestDB(data.email, data);
  }
  return response.data;
};

/**
 * Approve a user request (removes request flag) — dual-write to both DBs.
 */
export const approveUserRequest = async (user: User): Promise<User> => {
  const payload = { ...user, request: false };
  const response = await apiClient.put<User>(userEndpoints.update(String(user._id)), payload);
  if (user.email) {
    await syncRestDB(user.email, payload);
  }
  return response.data;
};

// ============ DELETE ============

/**
 * Delete user by _id from Codehooks, and by email lookup from RestDB.
 */
export const deleteUser = async (_id: string, email: string): Promise<void> => {
  await apiClient.delete(userEndpoints.delete(_id));
  try {
    const search = await restdbClient.get<User[]>(userEndpoints.getByEmail(email));
    const rbUser = search.data[0];
    if (rbUser?._id) {
      await restdbClient.delete(userEndpoints.delete(String(rbUser._id)));
    }
  } catch (err: any) {
    console.warn('[RestDB] delete sync failed for', email, err?.message);
  }
};

// Export all functions
export const usersApi = {
  // Read
  list: getUsers,
  get: getUserByEmail,
  listByIds: getUsersByIds,
  listPendingRequests: getPendingUserRequests,
  getLastId: getLastUserId,
  
  // Auth
  login: loginUser,
  register: registerUser,
  
  // Update
  update: updateUser,
  approveRequest: approveUserRequest,
  
  // Delete
  delete: deleteUser,
};

export default usersApi;
