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
 * Always queries Codehooks directly.
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
  try {
    const response = await codehooksClient.post<{ user: User; accessToken: string; expiresAt: number; refreshToken: string; refreshExpiresAt: number }>(
      '/auth/login',
      { email, password },
    );
    const { user, accessToken, expiresAt, refreshToken, refreshExpiresAt } = response.data;
    // Store JWT session — includes refresh token for seamless 7-day sessions
    localStorage.setItem('stuffie-session', JSON.stringify({ accessToken, expiresAt, refreshToken, refreshExpiresAt }));
    return user;
  } catch (err: any) {
    if (err?.response?.status === 401) return null;
    if (err?.response?.status === 429) {
      // Rate limited — surface the server message to the UI
      const msg = err.response.data?.error || 'Too many login attempts. Please try again later.';
      throw new Error(msg);
    }
    throw err;
  }
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
 * Register a new user.
 *
 * Steps (in order):
 * 1. Get the next atomic user id from the server-side counter (POST /users/next-id)
 *    — eliminates the race condition of the old getLastUserId() + Math.max() approach.
 * 2. Hash password with PBKDF2 (done in parallel with step 1).
 * 3. Write to Codehooks with the guaranteed unique numeric id.
 * 4. Return user with guaranteed 'id' field (used by caller for Cloudinary upload).
 */
export const registerUser = async (userData: RegisterUserInput): Promise<User> => {
  const [{ data: { id: newId } }, encryptedPassword] = await Promise.all([
    codehooksClient.post<{ id: number }>(userEndpoints.nextId()),
    crypto.pbkdf2v2(userData.password),
  ]);

  // Destructure to exclude plain-text password from what gets stored
  const { password: _plaintext, ...userDataWithoutPassword } = userData;

  const newUser = {
    ...userDataWithoutPassword,
    password_hash: encryptedPassword,
    id: newId,
    is_admin: false,
    status: 'pending' as const, // Requires admin approval
  };

  const response = await codehooksClient.post<User>(userEndpoints.create(), newUser);

  // Guarantee the id is present — Codehooks doesn't always echo custom fields back
  return { ...response.data, id: newId };
};

// ============ UPDATE ============

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  picture?: string;
  is_admin?: boolean;
  status?: 'pending' | 'active';
  password_hash?: string;
  email?: string;
  zip_code?: string;
  lat?: number;
  lng?: number;
}

/**
 * Update user by _id — uses PATCH with $set so that fields not in the payload
 * (notably password_hash, which is stripped from the in-memory user object by
 * the backend) are never overwritten.  A crudlify PUT would replace the whole
 * document and silently wipe the password hash.
 */
export const updateUser = async (_id: string, data: UpdateUserInput): Promise<User> => {
  const response = await apiClient.patch<User>(userEndpoints.update(_id), data);
  return response.data;
};

/**
 * Approve a user request (removes request flag).
 * Uses PATCH (not PUT) so that password_hash is never overwritten.
 */
export const approveUserRequest = async (user: User): Promise<User> => {
  const response = await apiClient.patch<User>(userEndpoints.update(String(user._id)), { status: 'active' });
  return response.data;
};

// ============ DELETE ============

/**
 * Delete user by _id.
 */
export const deleteUser = async (_id: string, _email: string): Promise<void> => {
  await apiClient.delete(userEndpoints.delete(_id));
};

// ============ ADMIN ============

export interface OrphanRow {
  _id: string;
  user_id: number;
  item_id: number;
  asking_price?: number;
  _reason: 'unknown_user' | 'unknown_item';
}

/**
 * Scan user_items for orphaned rows (unknown user_id or item_id).
 * Admin only — requires an admin JWT in the session.
 */
export const getOrphanRows = async (): Promise<{ orphans: OrphanRow[]; totalChecked: number }> => {
  const response = await apiClient.get<{ orphans: OrphanRow[]; totalChecked: number }>('/admin/orphans');
  return response.data;
};

/**
 * Delete a single orphaned user_items row by its _id.
 * Admin only.
 */
export const deleteOrphanRow = async (_id: string): Promise<void> => {
  await apiClient.delete(`/admin/orphans/${_id}`);
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

  // Admin
  getOrphanRows,
  deleteOrphanRow,
};

export default usersApi;
