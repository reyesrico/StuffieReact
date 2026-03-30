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

  // Helper: migrate a legacy user to the current PBKDF2 hash (non-destructive)
  const migrate = async (user: User) => {
    if (user._id) {
      await apiClient.put(userEndpoints.update(String(user._id)), {
        ...user,
        password: pbkdf2Hash,
      });
    }
    return user;
  };

  // 2. Fallback: SHA256 — users who registered between Sept 2022 and today
  const sha256Hash = crypto.encrypt(password);
  const sha256Response = await apiClient.get<User[]>(userEndpoints.login(email, sha256Hash));
  if (sha256Response.data[0]) return migrate(sha256Response.data[0]);

  // 3. Fallback: legacy PBKDF2 — users who registered before Sept 2022
  //    (Node crypto.pbkdf2, 100 iterations, 256 bytes → 512 hex chars)
  const legacyHash = await crypto.legacyPbkdf2(password, email);
  const legacyResponse = await apiClient.get<User[]>(userEndpoints.login(email, legacyHash));
  if (legacyResponse.data[0]) return migrate(legacyResponse.data[0]);

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
}

/**
 * Update user by _id
 */
export const updateUser = async (_id: string, data: UpdateUserInput): Promise<User> => {
  const response = await apiClient.put<User>(userEndpoints.update(_id), data);
  return response.data;
};

/**
 * Approve a user request (removes request flag)
 */
export const approveUserRequest = async (user: User): Promise<User> => {
  const response = await apiClient.put<User>(
    userEndpoints.update(String(user._id)), 
    { ...user, request: false }
  );
  return response.data;
};

// ============ DELETE ============

/**
 * Delete user by _id
 */
export const deleteUser = async (_id: string): Promise<void> => {
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
