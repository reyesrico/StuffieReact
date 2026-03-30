/**
 * Users API - CRUD operations for users (stuffiers)
 */
import { apiClient } from './client';
import { userEndpoints } from './endpoints';
import crypto from '../lib/crypto';
import type User from '../components/types/User';

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
 * Get the last user id (for registration)
 */
export const getLastUserId = async (): Promise<number> => {
  const response = await apiClient.get<Record<string, number>>(userEndpoints.getLastId());
  return Object.values(response.data)[0] || 0;
};

// ============ AUTH ============

/**
 * Login user with email and password
 * Password is encrypted before sending
 */
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  // Try PBKDF2 first (current algorithm)
  const pbkdf2Hash = await crypto.pbkdf2(password, email);
  const response = await apiClient.get<User[]>(
    userEndpoints.login(email, pbkdf2Hash)
  );

  if (response.data[0]) return response.data[0];

  // Fallback: user was registered with legacy SHA256 (no salt) — auto-migrate on match
  const sha256Hash = crypto.encrypt(password);
  const legacyResponse = await apiClient.get<User[]>(
    userEndpoints.login(email, sha256Hash)
  );
  const legacyUser = legacyResponse.data[0];

  if (legacyUser?._id) {
    // Silently upgrade password to PBKDF2 so next login uses the secure hash
    await apiClient.put(userEndpoints.update(String(legacyUser._id)), {
      password: pbkdf2Hash,
    });
  }

  return legacyUser || null;
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
export const registerUser = async (userData: RegisterUserInput): Promise<User> => {
  // Get last id and encrypt password in parallel
  const [lastId, encryptedPassword] = await Promise.all([
    getLastUserId(),
    crypto.pbkdf2(userData.password, userData.email),
  ]);
  
  const newUser = {
    ...userData,
    password: encryptedPassword,
    id: lastId + 1,
    request: true, // Requires admin approval
  };
  
  const response = await apiClient.post<User>(userEndpoints.create(), newUser);
  return response.data;
};

// ============ UPDATE ============

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  picture?: string;
  admin?: boolean;
  request?: boolean;
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
