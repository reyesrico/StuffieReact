/**
 * Users API - CRUD operations for users (stuffiers)
 */
import axios from 'axios';
import { apiClient } from './client';
import { userEndpoints } from './endpoints';
import crypto from '../lib/crypto';
import type User from '../components/types/User';

// Dedicated Codehooks client — always the source of truth
const codehooksClient = axios.create({
  baseURL: import.meta.env.VITE_CODEHOOKS_SERVER_URL || 'https://stuffie-2u0v.api.codehooks.io/dev/',
  headers: { 'x-apikey': import.meta.env.VITE_CODEHOOKS_API_KEY || '', 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ⚠️  BACKUP — DO NOT DELETE — DO NOT REMOVE ENV VARS
// RestDB is our permanent backup database. All writes are now Codehooks-only.
// To do a manual sync at end of migration: run backend/scripts/sync-to-restdb.js
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _restdbClient_BACKUP = axios.create({
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
  // Fetch by email only — compare hash client-side.
  // Avoids sending the password hash in a URL query string (shows up in server logs).
  const response = await apiClient.get<User[]>(userEndpoints.getByEmail(email));
  const user = response.data[0];
  if (!user) return null;

  const pbkdf2Hash = await crypto.pbkdf2(password, email);

  // 1. Match current PBKDF2 hash
  if (user.password === pbkdf2Hash) return user;

  // 2. Fallback: SHA256 — migrate to PBKDF2 on success
  const sha256Hash = crypto.encrypt(password);
  if (user.password === sha256Hash) {
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

  // Write to Codehooks only — RestDB is now a frozen backup (see _restdbClient_BACKUP above)
  const response = await codehooksClient.post<User>(userEndpoints.create(), newUser);

  // Guarantee the id is present — Codehooks doesn't always echo custom fields back
  return { ...response.data, id: newId };
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
  zip_code?: string;
  lat?: number;
  lng?: number;
}

/**
 * Update user by _id — writes to Codehooks only. RestDB is a frozen backup.
 */
export const updateUser = async (_id: string, data: UpdateUserInput): Promise<User> => {
  const response = await apiClient.put<User>(userEndpoints.update(_id), data);
  return response.data;
};

/**
 * Approve a user request (removes request flag) — Codehooks only. RestDB is frozen backup.
 */
export const approveUserRequest = async (user: User): Promise<User> => {
  const payload = { ...user, request: false };
  const response = await apiClient.put<User>(userEndpoints.update(String(user._id)), payload);
  return response.data;
};

// ============ DELETE ============

/**
 * Delete user by _id from Codehooks only. RestDB is a frozen backup — never delete from it.
 */
export const deleteUser = async (_id: string, _email: string): Promise<void> => {
  await apiClient.delete(userEndpoints.delete(_id));
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
