import CryptoJS from 'crypto-js';

const crypto = {
  encrypt: (clear: string): string => CryptoJS.SHA256(clear).toString(CryptoJS.enc.Hex),
  digest: (clear: string): string => CryptoJS.SHA256(clear).toString(CryptoJS.enc.Hex),
  pbkdf2: (clear: string, salt: string): Promise<string> => {
    return Promise.resolve(
      CryptoJS.PBKDF2(clear, salt, { keySize: 256 / 32, iterations: 1000 }).toString(CryptoJS.enc.Hex)
    );
  }
};

export default crypto;
