import CryptoJS from 'crypto-js';

// Internal: hex string → Uint8Array<ArrayBuffer>
const hexToBytes = (hex: string): Uint8Array<ArrayBuffer> => {
  const bytes = new Uint8Array(hex.length / 2) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
};

// Internal: derive 256-bit PBKDF2-HMAC-SHA256 via native WebCrypto, returns hex
const deriveKeyHex = async (password: string, hexSalt: string): Promise<string> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(hexSalt), iterations: 600_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const crypto = {
  encrypt: (clear: string): string => CryptoJS.SHA256(clear).toString(CryptoJS.enc.Hex),
  digest: (clear: string): string => CryptoJS.SHA256(clear).toString(CryptoJS.enc.Hex),

  // Legacy PBKDF2 — kept only to migrate old hashes (email-as-salt, 1000 iterations, CryptoJS)
  pbkdf2: (clear: string, salt: string): Promise<string> => {
    return Promise.resolve(
      CryptoJS.PBKDF2(clear, salt, { keySize: 256 / 32, iterations: 1000 }).toString(CryptoJS.enc.Hex)
    );
  },

  // v2: native WebCrypto PBKDF2-HMAC-SHA256, 600k iterations, 16-byte random salt
  // Format: "v2:<hexSalt>:<hexHash>"
  pbkdf2v2: async (password: string): Promise<string> => {
    const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
    const hexSalt = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const hexHash = await deriveKeyHex(password, hexSalt);
    return `v2:${hexSalt}:${hexHash}`;
  },

  // Verify a v2 hash — returns true only if "v2:<salt>:<hash>" matches password
  verifyPbkdf2v2: async (password: string, stored: string): Promise<boolean> => {
    const parts = stored.split(':');
    if (parts.length !== 3 || parts[0] !== 'v2') return false;
    const [, hexSalt, storedHash] = parts;
    const computed = await deriveKeyHex(password, hexSalt);
    return computed === storedHash;
  },
};

export default crypto;
