import CryptoJS from 'crypto-js';

const crypto = {
  encrypt: (clear: string): string => CryptoJS.SHA256(clear).toString(CryptoJS.enc.Hex),
  digest: (clear: string): string => CryptoJS.SHA256(clear).toString(CryptoJS.enc.Hex),
  pbkdf2: (clear: string, salt: string): Promise<string> => {
    return Promise.resolve(
      CryptoJS.PBKDF2(clear, salt, { keySize: 256 / 32, iterations: 1000 }).toString(CryptoJS.enc.Hex)
    );
  },
  /**
   * Legacy PBKDF2 used before Sept 2022:
   * Node's crypto.pbkdf2(password, email, 100, 256, 'sha256') → 512 hex chars
   * Reproduced in the browser via Web Crypto API.
   */
  legacyPbkdf2: async (clear: string, salt: string): Promise<string> => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw', enc.encode(clear), { name: 'PBKDF2' }, false, ['deriveBits']
    );
    const bits = await window.crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100, hash: 'SHA-256' },
      keyMaterial,
      256 * 8  // 256 bytes = 2048 bits, matching the old Node.js output
    );
    return Array.from(new Uint8Array(bits))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },
};

export default crypto;
