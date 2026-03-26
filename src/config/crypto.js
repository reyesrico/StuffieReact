import CryptoJS from 'crypto-js';

const crypto = {
  encrypt: clear => CryptoJS.SHA256(clear).toString(CryptoJS.enc.Hex),
  digest: clear => CryptoJS.SHA256(clear).toString(CryptoJS.enc.Hex),
  pbkdf2: (clear, salt) => {
    return Promise.resolve(
      CryptoJS.PBKDF2(clear, salt, { keySize: 256 / 32, iterations: 1000 }).toString(CryptoJS.enc.Hex)
    );
  }
};

export default crypto;
