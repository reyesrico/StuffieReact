/**
 * Password helpers — supports all 3 stored hash formats for backwards
 * compatibility with accounts created before the v2 migration.
 *
 *   v2:<hexSalt>:<hexHash>  PBKDF2-HMAC-SHA256, 600k iters  (current)
 *   64-char hex             PBKDF2-HMAC-SHA256, 1k iters    (legacy CryptoJS)
 *   64-char hex             raw SHA256                       (oldest fallback)
 */
import { createHash, pbkdf2Sync, randomBytes } from 'crypto';

/**
 * verifyPassword
 * @returns {{ valid: boolean, needsUpgrade: boolean }}
 */
export const verifyPassword = (password, storedHash, email) => {
  if (!storedHash) return { valid: false, needsUpgrade: false };

  // v2 format
  if (storedHash.startsWith('v2:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return { valid: false, needsUpgrade: false };
    const [, hexSalt, hexStored] = parts;
    const computed = pbkdf2Sync(password, Buffer.from(hexSalt, 'hex'), 600_000, 32, 'sha256').toString('hex');
    return { valid: computed === hexStored, needsUpgrade: false };
  }

  // Legacy PBKDF2 (email as salt, 1k iters)
  const legacyHash = pbkdf2Sync(password, email, 1_000, 32, 'sha256').toString('hex');
  if (legacyHash === storedHash) return { valid: true, needsUpgrade: true };

  // Oldest fallback — raw SHA256
  const sha256 = createHash('sha256').update(password).digest('hex');
  if (sha256 === storedHash) return { valid: true, needsUpgrade: true };

  return { valid: false, needsUpgrade: false };
};

/**
 * hashPasswordV2 — creates a new v2 hash for storage / upgrade.
 * @returns {string}  "v2:<hexSalt>:<hexHash>"
 */
export const hashPasswordV2 = (password) => {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, 600_000, 32, 'sha256').toString('hex');
  return `v2:${salt.toString('hex')}:${hash}`;
};
